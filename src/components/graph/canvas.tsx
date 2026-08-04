"use client";

/**
 * Live idle graph — one instancedMesh draw call + one lineSegments draw call.
 * Versions and shape locked to the S2 measurement (58fps on Redmi Note 11):
 * three@0.185.1, @react-three/fiber@9.7.0, 400 nodes, ≤600 edges, no drei.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { IDLE_GRAPH } from "./geometry";

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
  const foreground = useCssColor("--foreground", "#101319");
  const primary = useCssColor("--primary", "#26346e");
  const { positions, edgePositions, nodeCount, signalIndex } = IDLE_GRAPH;

  const edgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    return geometry;
  }, [edgePositions]);

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;

    const dummy = new THREE.Object3D();
    const base = new THREE.Color(foreground);
    const accent = new THREE.Color(primary);

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      // Signal node slightly larger — same "baseline and deviation" as GraphStill.
      dummy.scale.setScalar(i === signalIndex ? 1.8 : 1);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, i === signalIndex ? accent : base);
    }

    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  }, [positions, nodeCount, signalIndex, foreground, primary]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Slow drift — technical drawing that breathes, not a hologram.
    g.rotation.y += delta * 0.06;
    g.rotation.x = Math.sin(g.rotation.y * 0.5) * 0.08;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
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
      // Decorative — hero copy already states everything a reader needs.
      aria-hidden
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.35, 7.2], fov: 42, near: 0.1, far: 50 }}
      // pointer-events none: the graph must not steal scroll on mobile.
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <IdleScene />
    </Canvas>
  );
}
