"use client";

/**
 * Selected-work cover stack. A small R3F scene, not a second world graph.
 * Mounted only when WebGL is available and motion is allowed.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import * as THREE from "three";

type Card = {
  slug: string;
  cover?: string;
};

type Props = {
  cards: readonly Card[];
  activeIdx: number;
  onSelect: (index: number) => void;
  onOpen: () => void;
};

const CARD_W = 2.18;
const CARD_H = 1.36;
const LAMBDA = 8;

function subscribeCss(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useCssColor(varName: string, fallback: string): string {
  return useSyncExternalStore(
    subscribeCss,
    () =>
      getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
      fallback,
    () => fallback,
  );
}

function CoverMesh({
  card,
  index,
  activeRef,
  surface,
  primary,
  dragRef,
  onSelect,
  onOpen,
}: {
  card: Card;
  index: number;
  activeRef: RefObject<number>;
  surface: string;
  primary: string;
  dragRef: RefObject<boolean>;
  onSelect: (index: number) => void;
  onOpen: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [map, setMap] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!card.cover) return;
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      card.cover,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        setMap(texture);
      },
      undefined,
      () => {
        if (!cancelled) setMap(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [card.cover]);

  useEffect(() => {
    return () => {
      map?.dispose();
    };
  }, [map]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const offset = index - activeRef.current;
    const abs = Math.abs(offset);
    const targetX = offset * 0.62;
    const targetZ = -Math.min(abs, 2) * 0.48;
    const targetY = Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.016;
    const targetRotY = THREE.MathUtils.clamp(-offset * 0.38, -0.62, 0.62);
    const targetScale = abs === 0 ? 1 : 0.82;

    node.position.x = THREE.MathUtils.damp(node.position.x, targetX, LAMBDA, delta);
    node.position.y = THREE.MathUtils.damp(node.position.y, targetY, LAMBDA, delta);
    node.position.z = THREE.MathUtils.damp(node.position.z, targetZ, LAMBDA, delta);
    node.rotation.y = THREE.MathUtils.damp(node.rotation.y, targetRotY, LAMBDA, delta);
    const scale = THREE.MathUtils.damp(node.scale.x, targetScale, LAMBDA, delta);
    node.scale.setScalar(scale);
    node.visible = abs < 2.2;
  });

  return (
    <group
      ref={group}
      position={[index * 0.52, 0, -index * 0.42]}
      onClick={(event) => {
        event.stopPropagation();
        if (dragRef.current) return;
        if (index === activeRef.current) onOpen();
        else onSelect(index);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh position={[0, 0, -0.012]} scale={[1.03, 1.04, 1]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial color={primary} transparent opacity={0.22} />
      </mesh>
      <mesh>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial
          map={map}
          color={map ? "#ffffff" : surface}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DeckScene({
  cards,
  activeIdx,
  dragRef,
  onSelect,
  onOpen,
}: Props & { dragRef: RefObject<boolean> }) {
  const group = useRef<THREE.Group>(null);
  const activeRef = useRef(activeIdx);
  const surface = useCssColor("--surface-2", "#1e1c19");
  const primary = useCssColor("--primary", "#b883ec");

  useEffect(() => {
    activeRef.current = activeIdx;
  }, [activeIdx]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const tiltY = state.pointer.x * 0.18;
    const tiltX = -state.pointer.y * 0.1;
    node.rotation.y = THREE.MathUtils.damp(node.rotation.y, tiltY, 5, delta);
    node.rotation.x = THREE.MathUtils.damp(node.rotation.x, tiltX, 5, delta);
  });

  return (
    <group ref={group}>
        {cards.map((card, index) => (
          <CoverMesh
            key={card.slug}
            card={card}
            index={index}
            activeRef={activeRef}
            surface={surface}
            primary={primary}
            dragRef={dragRef}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        ))}
    </group>
  );
}

export function WorkDeckStage({ cards, activeIdx, onSelect, onOpen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const dragRef = useRef(false);
  const pointerX = useRef<number | null>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setVisible(entry.isIntersecting);
      },
      { rootMargin: "80px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div
      ref={host}
      className="relative aspect-[16/10] w-full bg-surface-1"
      aria-hidden
      onPointerDown={(event) => {
        pointerX.current = event.clientX;
        dragRef.current = false;
      }}
      onPointerMove={(event) => {
        const start = pointerX.current;
        if (start === null) return;
        if (Math.abs(event.clientX - start) > 12) dragRef.current = true;
      }}
      onPointerUp={(event) => {
        const start = pointerX.current;
        pointerX.current = null;
        if (start === null || !dragRef.current) return;
        const delta = event.clientX - start;
        if (Math.abs(delta) < 48) return;
        onSelect(delta < 0 ? activeIdx + 1 : activeIdx - 1);
      }}
      onPointerLeave={() => {
        pointerX.current = null;
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.02, 2.58], fov: 32, near: 0.1, far: 20 }}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <DeckScene
            cards={cards}
            activeIdx={activeIdx}
            dragRef={dragRef}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
