"use client";

/**
 * Persistent world graph — one fixed full-viewport canvas behind every
 * chapter, mounted from `[lang]/layout` (see `world.tsx`).
 *
 * Draw calls: one instancedMesh of nodes, one lineSegments of edges, one
 * instancedMesh of travelling signal packets — plus bloom.
 *
 * Alive in three ways:
 * - signals — packets ride random edges; streaming multiplies and speeds
 *   them, and `showProject` highlights make them converge on the lit node.
 * - pointer wake — nodes near the cursor brighten and swell, gently.
 * - chat highlights — slugs swell their nodes in over ~350ms (plans/004).
 *
 * The camera dollies in once on load (CameraIntro, plans/003).
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
  type RefObject,
} from "react";
import * as THREE from "three";

import { useGraphActivity } from "./activity";
import { IDLE_GRAPH } from "./geometry";
import { nodeIndicesForSlugs } from "./project-nodes";

/** Base nodes dim so only attention (accent, wake, signals) blooms.
 * NOTE: Color math is linear-space — 0.06 linear lands at ~0.29 sRGB, safely
 * under the bloom threshold; anything near 0.2 linear blooms everywhere. */
const INK_BASE_STRENGTH = 0.06;
const GRAPH_PRESENCE = 0.75;
const WAKE_RADIUS = 1.15;
/** Wake reads gentler than a highlight — the shared weight channel caps it. */
const WAKE_MAX = 0.45;
const WAKE_FADE_MS = 900;
const SIGNAL_CAPACITY = 48;
const SIGNAL_IDLE_COUNT = 24;
/** Depth fog for the dark network. */
const FOG_DENSITY = 0.08;
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
}: {
  fogRef: RefObject<THREE.FogExp2 | null>;
  groundRef: RefObject<THREE.MeshBasicMaterial | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sigMesh = useRef<THREE.InstancedMesh>(null);
  const sigMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null);

  const camera = useThree((state) => state.camera);

  const background = useCssColor("--background", "#0d0c0b");
  const foreground = useCssColor("--foreground", "#f4f0ea");
  const primary = useCssColor("--primary", "#b883ec");

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

  const highlightWeight = useRef(new Float32Array(nodeCount));
  const weightsActive = useRef(false);

  const colors = useMemo(
    () => ({
      accent: new THREE.Color(primary),
      base: new THREE.Color(foreground).multiplyScalar(INK_BASE_STRENGTH),
      dim: new THREE.Color(foreground).multiplyScalar(INK_BASE_STRENGTH * 0.45),
      bg: new THREE.Color(background),
      fg: new THREE.Color(foreground),
    }),
    [background, foreground, primary],
  );

  useEffect(() => {
    if (fogRef.current) {
      fogRef.current.color.copy(colors.bg);
      fogRef.current.density = FOG_DENSITY;
    }
    if (groundRef.current) {
      groundRef.current.color.copy(colors.bg);
    }
    if (edgeMaterial.current) {
      edgeMaterial.current.color.copy(colors.fg);
    }
    if (sigMaterial.current) {
      sigMaterial.current.color.copy(colors.accent);
    }
  }, [colors, fogRef, groundRef]);

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
  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar((i === signalIndex ? 1.8 : 1) * GRAPH_PRESENCE);
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
        GRAPH_PRESENCE;
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

    // Only rewrite instance colours/scales when something is happening.
    if (!energized && !hasHighlights && !weightsMoving) return;

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

      dummy.scale.setScalar(scale * GRAPH_PRESENCE);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, scratch);
    }

    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  });

  // When activity ends, snap back to the calm baseline once.
  useEffect(() => {
    if (streaming || highlightSlugs.length > 0) return;
    const instance = mesh.current;
    if (!instance) return;

    highlightWeight.current.fill(0);
    weightsActive.current = false;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar((i === signalIndex ? 1.8 : 1) * GRAPH_PRESENCE);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, i === signalIndex ? colors.accent : colors.base);
    }
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    if (edgeMaterial.current) edgeMaterial.current.opacity = 0.22 * GRAPH_PRESENCE;
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
      {/* The ground — matches the dark background seamless behind the whole page. */}
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

const SECTION_COLORS: Record<string, string> = {
  default: "#0d0c0b",
  work: "#0d0c0b",
  statement: "#090808",
  ask: "#120a1c",
  about: "#0a0d14",
  contact: "#0e0d0b",
};

/**
 * Dynamic Scroll-Driven Camera & Section Atmosphere Rig.
 *
 * 1. Smoothly dollies, pans, and tilts the 3D camera based on page scroll depth.
 * 2. Dynamically shifts ambient ground and fog colors between tailored section palettes.
 */
function DynamicCameraAndAtmosphereRig({
  fogRef,
  groundRef,
}: {
  fogRef: RefObject<THREE.FogExp2 | null>;
  groundRef: RefObject<THREE.MeshBasicMaterial | null>;
}) {
  const scrollTarget = useRef({ progress: 0, sectionColor: new THREE.Color("#0d0c0b") });
  const introSettled = useRef(false);

  useEffect(() => {
    const targetColor = new THREE.Color("#0d0c0b");
    const sections = ["contact", "about", "ask", "statement", "work"];

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1);

      // Determine active section color
      let matched = "default";
      const viewportCenter = scrollY + window.innerHeight * 0.45;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (viewportCenter >= top && viewportCenter <= bottom) {
            matched = id;
            break;
          }
        }
      }

      targetColor.set(SECTION_COLORS[matched] ?? SECTION_COLORS.default);
      scrollTarget.current.progress = progress;
      scrollTarget.current.sectionColor.copy(targetColor);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(({ camera }, delta) => {
    const { progress, sectionColor } = scrollTarget.current;

    // Intro dolly-in
    if (!introSettled.current) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.2, Math.min(1, delta * 2.5));
      if (Math.abs(camera.position.z - 7.2) < 0.01) {
        introSettled.current = true;
      }
    } else {
      // Continuous scroll-driven 3D parallax
      const targetX = Math.sin(progress * Math.PI * 2) * 0.75;
      const targetY = 0.35 - progress * 1.1;
      const targetZ = 7.2 + Math.cos(progress * Math.PI) * 0.5;
      const targetRotY = Math.sin(progress * Math.PI) * 0.06;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2.8);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 2.8);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 2.8);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, delta * 2.8);
    }

    // Atmospheric color lerp
    if (fogRef.current) {
      fogRef.current.color.lerp(sectionColor, delta * 2.5);
    }
    if (groundRef.current) {
      groundRef.current.color.lerp(sectionColor, delta * 2.5);
    }
  });

  return null;
}

export function GraphCanvas({
  className,
}: {
  className?: string;
}) {
  // Phones/tablets: fixed 1×. Desktop: allow up to 1.5×.
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.5]);
  const fogRef = useRef<THREE.FogExp2>(null);
  const groundRef = useRef<THREE.MeshBasicMaterial>(null);

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
        <fogExp2 ref={fogRef} attach="fog" args={["#0d0c0b", FOG_DENSITY]} />
        <WorldScene
          fogRef={fogRef}
          groundRef={groundRef}
        />
        <DynamicCameraAndAtmosphereRig
          fogRef={fogRef}
          groundRef={groundRef}
        />
        <EffectComposer>
          <Bloom
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
