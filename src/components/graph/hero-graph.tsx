"use client";

/**
 * Hero graph fallback gate.
 *
 * The live graph is now the persistent world canvas mounted from
 * `[lang]/layout` (see `world.tsx`) — the hero no longer carries its own.
 * This component renders the static SVG still only when that canvas cannot
 * run: `prefers-reduced-motion` on, or WebGL unavailable. Same box either
 * way, so nothing shifts.
 */

import { GraphStill } from "@/components/graph-still";

import { usePrefersReducedMotion, useWebGLAvailable } from "./use-graph-runtime";

export function HeroGraph({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();

  if (reducedMotion || !webgl) {
    return <GraphStill className={className} />;
  }

  return null;
}
