"use client";

/**
 * The persistent world canvas — fixed behind every section, mounted from
 * `[lang]/layout`.
 *
 * Mounts only when motion is allowed and WebGL exists. Otherwise it renders
 * nothing: the hero keeps its `GraphStill` (see `hero-graph.tsx`) as the
 * graph's only body, and sections simply run flat-dark. The site must
 * work completely without this component — that is a build constraint, not a
 * fallback bolted on at the end.
 *
 * Sits at z = -10: above the root background, below everything else, so the
 * column rules (`.bg-grid-lines`) and the grain still cross over it.
 */

import dynamic from "next/dynamic";

import { usePrefersReducedMotion, useWebGLAvailable } from "./use-graph-runtime";

const GraphCanvas = dynamic(() => import("./canvas").then((mod) => mod.GraphCanvas), {
  ssr: false,
});

export function WorldGraph() {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();

  if (reducedMotion || !webgl) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <GraphCanvas className="h-full w-full" />
    </div>
  );
}

