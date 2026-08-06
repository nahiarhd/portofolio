"use client";

/**
 * Work stage setpiece: project plates receding on a linear rail.
 *
 * Layout is linear, not circular. A sinusoidal arc wraps once |offset| passes
 * a quarter turn, which sent the far plates back toward the centre and off the
 * right edge of the canvas. Distance now grows monotonically and anything past
 * the third plate fades out instead of piling up.
 *
 * Faces are unlit (`meshBasicMaterial`): the plates are printed artwork, so
 * there is nothing for lights to do, and dropping them removes four light
 * nodes from the frame budget on mid-range Android.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type PanelProject = {
  slug: string;
  title: string;
  coverSrc?: string;
  confidential: boolean;
};

const PANEL_W = 2.4;
const PANEL_H = 1.5;
/** Lateral step between plates, in world units. */
const STEP = 1.95;
/** Plates past this distance from the selection are fully faded. */
const VISIBLE_SPAN = 2;

const INK = new THREE.Color("#1a1813");
const COBALT = new THREE.Color("#1c39bb");

function Panel({
  project,
  index,
  selectedIndex,
  onSelect,
}: {
  project: PanelProject;
  index: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const faceMat = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMat = useRef<THREE.MeshBasicMaterial>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  const offset = index - selectedIndex;
  const distance = Math.abs(offset);
  const selected = offset === 0;
  const reachable = distance <= VISIBLE_SPAN;

  const target = useMemo(() => {
    const fade = Math.max(0, 1 - distance / VISIBLE_SPAN);
    return {
      x: offset * STEP,
      y: 0,
      // Recede hard in z rather than spreading in x: trailing plates tuck
      // behind the selection instead of smearing their titles across it.
      z: -distance * 1.7,
      ry: -offset * 0.42,
      scale: selected ? 1.12 : 0.9,
      opacity: selected ? 1 : 0.2 + fade * 0.5,
    };
  }, [offset, distance, selected]);

  useEffect(() => {
    let cancelled = false;
    const mat = faceMat.current;
    if (!mat || !project.coverSrc) return;

    const loader = new THREE.TextureLoader();
    loader.load(
      project.coverSrc,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        textureRef.current?.dispose();
        textureRef.current = tex;
        mat.map = tex;
        mat.color.set("#ffffff");
        mat.needsUpdate = true;
      },
      undefined,
      () => {
        mat.map = null;
        mat.color.copy(INK);
        mat.needsUpdate = true;
      },
    );

    return () => {
      cancelled = true;
      textureRef.current?.dispose();
      textureRef.current = null;
      mat.map = null;
    };
  }, [project.coverSrc]);

  useEffect(() => {
    if (edgeMat.current) edgeMat.current.color.copy(selected ? COBALT : INK);
  }, [selected]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const damp = 1 - Math.exp(-9 * dt);

    g.position.x += (target.x - g.position.x) * damp;
    g.position.y += (target.y - g.position.y) * damp;
    g.position.z += (target.z - g.position.z) * damp;
    g.rotation.y += (target.ry - g.rotation.y) * damp;
    g.scale.setScalar(g.scale.x + (target.scale - g.scale.x) * damp);

    if (faceMat.current) {
      faceMat.current.opacity += (target.opacity - faceMat.current.opacity) * damp;
    }
    if (edgeMat.current) {
      const edge = selected ? 1 : target.opacity * 0.5;
      edgeMat.current.opacity += (edge - edgeMat.current.opacity) * damp;
    }
  });

  return (
    <group
      ref={group}
      position={[target.x, target.y, target.z]}
      rotation={[0, target.ry, 0]}
      scale={target.scale}
      visible={reachable}
    >
      {/* Printed border, thicker under the selected plate. */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshBasicMaterial ref={edgeMat} color={INK} transparent depthWrite={false} />
      </mesh>
      <mesh
        onClick={
          reachable
            ? (e) => {
                e.stopPropagation();
                onSelect(index);
              }
            : undefined
        }
        onPointerOver={() => {
          if (reachable) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          ref={faceMat}
          color={INK}
          transparent
          opacity={target.opacity}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function WorkStageCanvas({
  projects,
  selectedIndex,
  onSelect,
  className,
}: {
  projects: readonly PanelProject[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.15], fov: 42, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
      }}
      style={{ touchAction: "none" }}
    >
      {projects.map((project, index) => (
        <Panel
          key={project.slug}
          project={project}
          index={index}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      ))}
    </Canvas>
  );
}
