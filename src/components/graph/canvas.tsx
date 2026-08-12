"use client";

/**
 * Persistent world graph — one fixed full-viewport canvas behind every
 * chapter, mounted from `[lang]/layout` (see `world.tsx`).
 *
 * Draw calls: one instancedMesh of nodes, one lineSegments of edges, one
 * instancedMesh of travelling signal packets — plus bloom.
 *
 * Chapter-aware: the palette lerps between the ink and paper ramps as the
 * reader crosses the hero boundary, keyed off the same
 * `data-hero-chapter-end` sentinel the header watches. Under ink the scene
 * dims itself so body copy keeps its contrast; under paper it prints dark.
 *
 * Alive in three ways:
 * - signals — packets ride random edges; streaming multiplies and speeds
 *   them, and `showProject` highlights make them converge on the lit node.
 * - pointer wake — nodes near the cursor brighten and swell, gently.
 * - chat highlights — slugs swell their nodes in over ~350ms (plans/004).
 *
 * The camera dollies in once on load (CameraIntro, plans/003). The
 * frame-rate budget that capped all of this was retired 2026-08-11
 * (tasks/todo.md); graceful degradation did not — `world.tsx` never mounts
 * this under reduced motion or without WebGL.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import { useGraphActivity } from "./activity";
import { IDLE_GRAPH } from "./geometry";
import { nodeIndicesForSlugs } from "./project-nodes";

/** Paper ramp — mirrors `.chapter-paper` in src/app/globals.css. */
const PAPER = {
  background: "#ffffff",
  foreground: "#141310",
  primary: "#5a189a",
};

/** Ink base nodes dim so only attention (accent, wake, signals) blooms.
 * NOTE: Color math is linear-space — 0.06 linear lands at ~0.29 sRGB, safely
 * under the bloom threshold; anything near 0.2 linear blooms everywhere. */
const INK_BASE_STRENGTH = 0.06;
/** Under ink the whole scene steps back — smaller nodes, fainter edges — so
 * body copy keeps its contrast. Paper (the hero) stays near-full but held
 * off the headline: full-size nodes on white read as clutter over display
 * type, not as a print texture. */
const INK_PRESENCE = 0.6;
const PAPER_PRESENCE = 0.75;
/** Paper nodes print at charcoal, not full black — softer under type. */
const PAPER_BASE_STRENGTH = 0.72;
const WAKE_RADIUS = 1.15;
/** Wake reads gentler than a highlight — the shared weight channel caps it. */
const WAKE_MAX = 0.45;
const WAKE_FADE_MS = 900;
const SIGNAL_CAPACITY = 48;
const SIGNAL_IDLE_COUNT = 24;
/** Fog runs deep under ink (night-network volume), gentle on paper. */
const FOG_INK = 0.1;
const FOG_PAPER = 0.045;
/** Route pulse: the wave sweep that acknowledges a navigation. */
const PULSE_SECONDS = 1.2;
const EMPTY_HIGHLIGHTS: readonly number[] = [];

type SignalState = { edge: number; t: number; dir: 1 | -1; speed: number };

function useCssColor(varName: string, fallback: string): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (value) setColor(value);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [varName]);

  return color;
}

function buildAdjacency(edges: Uint16Array, nodeCount: number): number[][] {
  const adjacency: number[][] = Array.from({ length: nodeCount }, () => []);
  for (let e = 0; e < edges.length / 2; e++) {
    adjacency[edges[e * 2]].push(e);
    adjacency[edges[e * 2 + 1]].push(e);
  }
  return adjacency;
}

function WorldScene({
  fogRef,
  groundRef,
  bloomRef,
  chapterTarget,
}: {
  fogRef: RefObject<THREE.FogExp2 | null>;
  groundRef: RefObject<THREE.MeshBasicMaterial | null>;
  bloomRef: RefObject<ComponentRef<typeof Bloom> | null>;
  /** 1 = paper hero, 0 = ink. Owned by `world.tsx` (route-aware) — the scene
   * never queries the DOM. */
  chapterTarget: number;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sigMesh = useRef<THREE.InstancedMesh>(null);
  const sigMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null);

  const camera = useThree((state) => state.camera);

  const background = useCssColor("--background", "#0d0c0b");
  const foreground = useCssColor("--foreground", "#141310");
  const primary = useCssColor("--primary", "#5a189a");

  const { positions, edgePositions, edges, edgeCount, nodeCount, signalIndex } =
    IDLE_GRAPH;
  const { streaming, highlightSlugs, pulseNonce } = useGraphActivity();

  const streamingRef = useRef(false);
  const highlightRef = useRef<Set<number>>(new Set());
  const pulseNonceRef = useRef(0);
  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);
  useEffect(() => {
    highlightRef.current = new Set(nodeIndicesForSlugs(highlightSlugs));
  }, [highlightSlugs]);
  useEffect(() => {
    pulseNonceRef.current = pulseNonce;
  }, [pulseNonce]);

  /* Chapter crossfade: 1 = paper hero, 0 = ink body. The target arrives as a
   * prop from `world.tsx` — route-aware, so navigating away from home can
   * never strand the palette mid-lerp (an observer on a removed sentinel
   * never fires again). Refs seed from the prop at mount so the first frame
   * is already the right chapter. */
  const paperness = useRef(chapterTarget);
  const papernessTarget = useRef(chapterTarget);
  useEffect(() => {
    papernessTarget.current = chapterTarget;
  }, [chapterTarget]);

  /* Pointer wake — window-level; the canvas itself never takes events. */
  const wakePoint = useRef(new THREE.Vector3());
  const localWake = useRef(new THREE.Vector3());
  const lastMoveMs = useRef(-1e9);

  useEffect(() => {
    const ray = new THREE.Vector3();
    const onMove = (event: PointerEvent) => {
      ray
        .set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5,
        )
        .unproject(camera);
      ray.sub(camera.position).normalize();
      if (Math.abs(ray.z) < 1e-6) return;
      const distance = -camera.position.z / ray.z;
      if (distance <= 0) return;
      wakePoint.current.copy(camera.position).addScaledVector(ray, distance);
      lastMoveMs.current = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [camera]);

  // Fog is attached declaratively at the Canvas level (`<fogExp2
  // attach="fog">`) — react-hooks/immutability forbids writing to the
  // `scene` object from useThree, and the ref still lets the chapter palette
  // update its colour every frame.

  // Per-node weight channel, eased toward its target over ~350ms (plans/004).
  // Highlights drive it to 1; pointer wake drives it up to WAKE_MAX. A ref,
  // not useMemo: the frame loop writes individual entries, and the compiler
  // lint treats memo values as immutable. nodeCount is a module constant, so
  // the buffer never resizes.
  const highlightWeight = useRef(new Float32Array(nodeCount));
  const weightsActive = useRef(false);

  const colors = useMemo(
    () => ({
      inkBg: new THREE.Color(background),
      inkFg: new THREE.Color(foreground),
      inkAccent: new THREE.Color(primary),
      paperBg: new THREE.Color(PAPER.background),
      paperFg: new THREE.Color(PAPER.foreground),
      paperAccent: new THREE.Color(PAPER.primary),
      // Live-mixed palette — rewritten whenever paperness changes.
      accent: new THREE.Color(primary),
      base: new THREE.Color(foreground).multiplyScalar(INK_BASE_STRENGTH),
      dim: new THREE.Color(foreground).multiplyScalar(INK_BASE_STRENGTH * 0.45),
    }),
    [background, foreground, primary],
  );
  const lastPaletteP = useRef(-1);

  const edgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    return geometry;
  }, [edgePositions]);

  const adjacency = useMemo(() => buildAdjacency(edges, nodeCount), [edges, nodeCount]);
  const signals = useRef<SignalState[]>([]);

  const respawnSignal = useCallback(
    (sig: SignalState, convergeOn: readonly number[]) => {
      // While projects are highlighted, most packets reroute onto an edge
      // that ends at a lit node — the network visibly converges on them.
      if (convergeOn.length > 0 && Math.random() < 0.65) {
        const node = convergeOn[Math.floor(Math.random() * convergeOn.length)];
        const options = adjacency[node];
        if (options && options.length > 0) {
          sig.edge = options[Math.floor(Math.random() * options.length)];
          sig.dir = edges[sig.edge * 2 + 1] === node ? 1 : -1;
          sig.t = sig.dir === 1 ? 0 : 1;
          sig.speed = 0.45 + Math.random() * 0.6;
          return;
        }
      }
      sig.edge = Math.floor(Math.random() * edgeCount);
      sig.dir = Math.random() < 0.5 ? 1 : -1;
      sig.t = sig.dir === 1 ? 0 : 1;
      sig.speed = 0.3 + Math.random() * 0.55;
    },
    [adjacency, edges, edgeCount],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);
  const pulseSeen = useRef(0);
  const pulseStart = useRef(-10);

  // Baseline matrices + colours when theme changes or geometry rebuilds.
  // Presence matches the current chapter so a remount under ink does not
  // flash paper-sized nodes before the first useFrame rewrite.
  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;

    const presence =
      INK_PRESENCE + (PAPER_PRESENCE - INK_PRESENCE) * paperness.current;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar((i === signalIndex ? 1.8 : 1) * presence);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, i === signalIndex ? colors.accent : colors.base);
    }

    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  }, [positions, nodeCount, signalIndex, colors, dummy]);

  useFrame((state, delta) => {
    const g = group.current;
    const instance = mesh.current;
    if (!g || !instance) return;

    const active = streamingRef.current;
    const highlights = highlightRef.current;
    const hasHighlights = highlights.size > 0;
    const t = state.clock.elapsedTime;

    /* Chapter palette — ease toward the sentinel's verdict, then remix. */
    const papernessGoal = papernessTarget.current;
    if (paperness.current !== papernessGoal) {
      paperness.current = THREE.MathUtils.lerp(
        paperness.current,
        papernessGoal,
        Math.min(1, delta * 3),
      );
      if (Math.abs(paperness.current - papernessGoal) < 0.002) {
        paperness.current = papernessGoal;
      }
    }
    /* Presence: ink steps the scene back (smaller nodes, fainter edges). */
    const presence = INK_PRESENCE + (PAPER_PRESENCE - INK_PRESENCE) * paperness.current;
    let paletteDirty = false;
    if (paperness.current !== lastPaletteP.current) {
      const p = paperness.current;
      lastPaletteP.current = p;
      paletteDirty = true;
      colors.accent.copy(colors.inkAccent).lerp(colors.paperAccent, p);
      // Ink base nodes stay under the bloom threshold; paper prints charcoal.
      const fg = scratch.copy(colors.inkFg).lerp(colors.paperFg, p);
      const baseStrength = THREE.MathUtils.lerp(INK_BASE_STRENGTH, PAPER_BASE_STRENGTH, p);
      colors.base.copy(fg).multiplyScalar(baseStrength);
      colors.dim.copy(colors.base).multiplyScalar(0.45);
      if (fogRef.current) {
        fogRef.current.color.copy(colors.inkBg).lerp(colors.paperBg, p);
        fogRef.current.density = THREE.MathUtils.lerp(FOG_INK, FOG_PAPER, p);
      }
      if (groundRef.current) {
        groundRef.current.color.copy(colors.inkBg).lerp(colors.paperBg, p);
      }
      if (bloomRef.current) {
        bloomRef.current.intensity = THREE.MathUtils.lerp(1.15, 0.15, p);
      }
      if (edgeMaterial.current) edgeMaterial.current.color.copy(fg);
      if (sigMaterial.current) sigMaterial.current.color.copy(colors.accent);
    }

    /* Route pulse — a brightness sweep that acknowledges a navigation. */
    if (pulseNonceRef.current !== pulseSeen.current) {
      pulseSeen.current = pulseNonceRef.current;
      pulseStart.current = t;
    }
    const pulseAge = t - pulseStart.current;
    const pulseEnv =
      pulseAge >= 0 && pulseAge < PULSE_SECONDS
        ? Math.sin((Math.PI * pulseAge) / PULSE_SECONDS)
        : 0;
    const energized = active || pulseEnv > 0;

    /* Drift speeds up a little while the bot works — pointer parallax adds depth. */
    const spin = active ? 0.14 : 0.06 + 0.08 * pulseEnv;
    const targetX = -state.pointer.y * 0.2;
    const targetY = state.pointer.x * 0.25;

    g.rotation.y += delta * spin;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      Math.sin(g.rotation.y * 0.5) * (active ? 0.12 : 0.08) + targetX,
      0.05,
    );
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetY * 0.2, 0.05);

    if (edgeMaterial.current) {
      // Pulse travels as a breathing opacity on the hairline edges; a route
      // pulse rides on top as a brief surge.
      edgeMaterial.current.opacity =
        ((active
          ? 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(t * 5))
          : 0.22 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2))) +
          0.25 * pulseEnv) *
        presence;
    }

    /* Pointer wake fades out ~0.9s after the last move. */
    const sinceMove = performance.now() - lastMoveMs.current;
    const wake = sinceMove < WAKE_FADE_MS ? 1 - sinceMove / WAKE_FADE_MS : 0;
    if (wake > 0) {
      g.updateMatrixWorld();
      localWake.current.copy(wakePoint.current);
      g.worldToLocal(localWake.current);
    }

    /* Signals — ambient packets crossing the network. */
    const signalsInst = sigMesh.current;
    if (signalsInst) {
      if (signals.current.length === 0) {
        signals.current = Array.from({ length: SIGNAL_CAPACITY }, () => ({
          edge: 0,
          t: 0,
          dir: 1 as const,
          speed: 0,
        }));
        for (const sig of signals.current) {
          respawnSignal(sig, EMPTY_HIGHLIGHTS);
          sig.t = Math.random(); // scatter mid-edge so load doesn't burst
        }
      }
      const activeSignals = active ? SIGNAL_CAPACITY : SIGNAL_IDLE_COUNT;
      signalsInst.count = activeSignals;
      const convergeOn = hasHighlights ? [...highlights] : EMPTY_HIGHLIGHTS;
      for (let s = 0; s < activeSignals; s++) {
        const sig = signals.current[s];
        sig.t += sig.dir * sig.speed * (active ? 1.8 : 1 + 1.2 * pulseEnv) * delta;
        if (sig.t < 0 || sig.t > 1) respawnSignal(sig, convergeOn);
        const o = sig.edge * 6;
        dummy.position.set(
          edgePositions[o] + (edgePositions[o + 3] - edgePositions[o]) * sig.t,
          edgePositions[o + 1] + (edgePositions[o + 4] - edgePositions[o + 1]) * sig.t,
          edgePositions[o + 2] + (edgePositions[o + 5] - edgePositions[o + 2]) * sig.t,
        );
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        signalsInst.setMatrixAt(s, dummy.matrix);
      }
      signalsInst.instanceMatrix.needsUpdate = true;
    }

    /* Ease weights toward their targets (~350ms per direction). */
    let weightsMoving = false;
    if (hasHighlights || weightsActive.current || wake > 0) {
      const step = delta / 0.35;
      weightsActive.current = false;
      const radius2 = WAKE_RADIUS * WAKE_RADIUS;
      for (let i = 0; i < nodeCount; i++) {
        let nodeTarget = highlights.has(i) ? 1 : 0;
        if (wake > 0 && nodeTarget < WAKE_MAX) {
          const dx = positions[i * 3] - localWake.current.x;
          const dy = positions[i * 3 + 1] - localWake.current.y;
          const dz = positions[i * 3 + 2] - localWake.current.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < radius2) {
            const w = (1 - Math.sqrt(d2) / WAKE_RADIUS) * WAKE_MAX * wake;
            if (w > nodeTarget) nodeTarget = w;
          }
        }
        const current = highlightWeight.current[i];
        if (current === nodeTarget) continue;
        const next =
          current < nodeTarget
            ? Math.min(nodeTarget, current + step)
            : Math.max(nodeTarget, current - step);
        highlightWeight.current[i] = next;
        if (next !== nodeTarget) weightsActive.current = true;
        weightsMoving = true;
      }
    }

    // Only rewrite instance colours/scales when something is happening. A
    // palette remix (chapter crossfade) also forces one, or the nodes would
    // keep the other chapter's ramp.
    if (!energized && !hasHighlights && !weightsMoving && !paletteDirty) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

      const weight = highlightWeight.current[i];
      let scale = 1;
      if (weight > 0) {
        // Highlighted or woken: swell toward 2.2, base -> accent, on the weight.
        scale = 1 + 1.2 * weight;
        scratch.copy(colors.base).lerp(colors.accent, weight);
      } else if (i === signalIndex) {
        scale = active ? 1.6 : 1.8;
        scratch.copy(colors.accent);
      } else if (energized) {
        // Brightness wave travels along +x — a pulse crossing the cloud. A
        // route pulse reuses it as a brief sweep that fades with `pulseEnv`.
        const env = active ? 1 : pulseEnv;
        const wave = 0.5 + 0.5 * Math.sin(t * 4 + positions[i * 3] * 1.8);
        scale = 0.85 + 0.35 * wave * env;
        scratch.copy(colors.dim).lerp(colors.accent, (0.25 + 0.55 * wave) * env);
      } else {
        scratch.copy(colors.base);
      }

      dummy.scale.setScalar(scale * presence);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, scratch);
    }

    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  });

  // When activity ends, snap back to the calm baseline once.
  // Scale by chapter presence — under ink a bare `1` would pop nodes up
  // relative to the dimmed network the useFrame loop had been drawing.
  useEffect(() => {
    if (streaming || highlightSlugs.length > 0) return;
    const instance = mesh.current;
    if (!instance) return;

    highlightWeight.current.fill(0);
    weightsActive.current = false;

    const presence =
      INK_PRESENCE + (PAPER_PRESENCE - INK_PRESENCE) * paperness.current;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar((i === signalIndex ? 1.8 : 1) * presence);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, i === signalIndex ? colors.accent : colors.base);
    }
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    if (edgeMaterial.current) edgeMaterial.current.opacity = 0.22 * presence;
  }, [
    streaming,
    highlightSlugs,
    nodeCount,
    positions,
    signalIndex,
    colors,
    dummy,
    highlightWeight,
  ]);

  return (
    <>
      {/* The ground — the canvas paints the page background itself, so the
       * paper hero stays crisp white with dark print nodes instead of being
       * a translucent wash over ink. Outside the drifting group: it must not
       * rotate. Fog-exempt so distant nodes fade into it seamlessly. */}
      <mesh position={[0, 0, -12]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial
          ref={groundRef}
          color={background}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <group ref={group}>
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, nodeCount]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial
            ref={edgeMaterial}
            color={foreground}
            transparent
            opacity={0.22}
            toneMapped={false}
          />
        </lineSegments>
        <instancedMesh
          ref={sigMesh}
          args={[undefined, undefined, SIGNAL_CAPACITY]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial ref={sigMaterial} color={primary} toneMapped={false} />
        </instancedMesh>
      </group>
    </>
  );
}

/** One-shot dolly-in: the cloud arrives slightly pulled back and settles to
 * the composed framing. Exponential ease-out; zero work once settled. */
function CameraIntro() {
  const settled = useRef(false);
  useFrame(({ camera }, delta) => {
    if (settled.current) return;
    const next = THREE.MathUtils.lerp(camera.position.z, 7.2, Math.min(1, delta * 2));
    if (Math.abs(next - 7.2) < 0.005) {
      camera.position.z = 7.2;
      settled.current = true;
    } else {
      camera.position.z = next;
    }
  });
  return null;
}

export function GraphCanvas({
  className,
  chapterTarget,
}: {
  className?: string;
  /** 1 = paper hero, 0 = ink — owned by `world.tsx` (route-aware). */
  chapterTarget: number;
}) {
  // Phones/tablets: fixed 1×. Desktop: allow up to 1.5×.
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.5]);
  const fogRef = useRef<THREE.FogExp2>(null);
  const groundRef = useRef<THREE.MeshBasicMaterial>(null);
  const bloomRef = useRef<ComponentRef<typeof Bloom>>(null);

  /* Signal the DOM that the live canvas owns the ground — the paper
   * chapter's CSS background turns off (see globals.css). Without this the
   * fallback path keeps its opaque white hero, which is what we want when
   * the canvas isn't running. */
  useEffect(() => {
    document.body.dataset.world = "live";
    return () => {
      delete document.body.dataset.world;
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const apply = () => {
      setDpr(coarse.matches ? 1 : [1, 1.5]);
    };
    apply();
    coarse.addEventListener("change", apply);
    return () => coarse.removeEventListener("change", apply);
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        aria-hidden
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0.35, 8.2], fov: 42, near: 0.1, far: 50 }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <fogExp2 ref={fogRef} attach="fog" args={["#0d0c0b", FOG_INK]} />
        <WorldScene
          fogRef={fogRef}
          groundRef={groundRef}
          bloomRef={bloomRef}
          chapterTarget={chapterTarget}
        />
        <CameraIntro />
        <EffectComposer>
          <Bloom
            ref={bloomRef}
            mipmapBlur
            intensity={1.15}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.25}
            radius={0.75}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
