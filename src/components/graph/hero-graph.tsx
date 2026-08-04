"use client";

/**
 * Hero graph island. Chooses live R3F vs the static SVG still:
 * - `prefers-reduced-motion` → still (frozen, not slowed)
 * - WebGL unavailable → still (no error, no layout shift)
 * - otherwise → live idle scene
 *
 * `GraphCanvas` is loaded with `next/dynamic` + `ssr: false` here (a Client
 * Component) — Next 16 forbids that option in Server Components.
 */

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import { GraphStill } from "@/components/graph-still";

const GraphCanvas = dynamic(
  () => import("./canvas").then((mod) => mod.GraphCanvas),
  {
    ssr: false,
    loading: () => <GraphStill className="h-full w-full" />,
  },
);

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion(): boolean {
  // Server snapshot prefers the still so SSR HTML never assumes motion/WebGL.
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

let webglCached: boolean | null = null;

function detectWebGL(): boolean {
  if (webglCached !== null) return webglCached;
  try {
    const canvas = document.createElement("canvas");
    webglCached = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCached = false;
  }
  return webglCached;
}

function useWebGLAvailable(): boolean {
  // WebGL capability does not change mid-session; empty subscribe is intentional.
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => false,
  );
}

export function HeroGraph({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();

  if (reducedMotion || !webgl) {
    return <GraphStill className={className} />;
  }

  return <GraphCanvas className={className} />;
}
