"use client";

/**
 * Live hero graph — one instancedMesh + one lineSegments draw call.
 * Versions/shape locked to S2 (58fps on Redmi Note 11): three@0.185.1,
 * @react-three/fiber@9.7.0, 400 nodes, ≤600 edges, no drei.
 *
 * T14: while chat streams, edges pulse and a brightness wave travels the
 * cloud; `showProject` slugs light their mapped nodes in the accent colour.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useGraphActivity } from "./activity";
import { IDLE_GRAPH } from "./geometry";
import { nodeIndicesForSlugs } from "./project-nodes";

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

function IdleScene() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null);
  const foreground = useCssColor("--foreground", "#fafafa");
  const primary = useCssColor("--primary", "#c084fc");
  const { positions, edgePositions, nodeCount, signalIndex } = IDLE_GRAPH;
  const { streaming, highlightSlugs } = useGraphActivity();

  const streamingRef = useRef(false);
  const highlightRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);
  useEffect(() => {
    highlightRef.current = new Set(nodeIndicesForSlugs(highlightSlugs));
  }, [highlightSlugs]);

  const colors = useMemo(
    () => ({
      base: new THREE.Color(foreground),
      accent: new THREE.Color(primary),
      dim: new THREE.Color(foreground).multiplyScalar(0.45),
      pulse: new THREE.Color(primary),
    }),
    [foreground, primary],
  );

  const edgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    return geometry;
  }, [edgePositions]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  // Baseline matrices + colours when theme changes or highlights clear to idle.
  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(i === signalIndex ? 1.8 : 1);
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

    // Drift speeds up a little while the bot works — smooth pointer parallax adds depth.
    const spin = active ? 0.14 : 0.06;
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
      // Pulse travels as a breathing opacity on the hairline edges.
      edgeMaterial.current.opacity = active
        ? 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(t * 5))
        : 0.22 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2));
    }

    // Only rewrite instance colours/scales when something is happening — idle
    // stays on the layout effect so we don't spend the S2 headroom for nothing.
    if (!active && !hasHighlights) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

      const highlighted = highlights.has(i);
      let scale = 1;
      if (highlighted) {
        scale = 2.2;
        scratch.copy(colors.accent);
      } else if (i === signalIndex) {
        scale = active ? 1.6 : 1.8;
        scratch.copy(colors.accent);
      } else if (active) {
        // Brightness wave travels along +x — reads as a pulse crossing the cloud.
        const wave = 0.5 + 0.5 * Math.sin(t * 4 + positions[i * 3] * 1.8);
        scale = 0.85 + 0.35 * wave;
        scratch.copy(colors.dim).lerp(colors.pulse, 0.25 + 0.55 * wave);
      } else {
        scratch.copy(colors.base);
      }

      dummy.scale.setScalar(scale);
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

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(i === signalIndex ? 1.8 : 1);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, i === signalIndex ? colors.accent : colors.base);
    }
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    if (edgeMaterial.current) edgeMaterial.current.opacity = 0.22;
  }, [
    streaming,
    highlightSlugs,
    nodeCount,
    positions,
    signalIndex,
    colors,
    dummy,
  ]);

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, nodeCount]}>
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
    </group>
  );
}

export function GraphCanvas({ className }: { className?: string }) {
  return (
    <Canvas
      className={className}
      aria-hidden
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.35, 7.2], fov: 42, near: 0.1, far: 50 }}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <IdleScene />
    </Canvas>
  );
}
