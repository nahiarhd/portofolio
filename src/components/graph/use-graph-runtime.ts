"use client";

/**
 * Shared capability gates for the graph: reduced motion and WebGL support.
 *
 * The live canvas is an enhancement; both gates fail closed. Server snapshots
 * report "no motion / no WebGL" so SSR HTML never assumes either.
 */

import { useSyncExternalStore } from "react";

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  // Server snapshot prefers stillness so SSR HTML never assumes motion.
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

export function useWebGLAvailable(): boolean {
  // WebGL capability does not change mid-session; empty subscribe is intentional.
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => false,
  );
}
