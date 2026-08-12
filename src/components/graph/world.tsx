"use client";

/**
 * The persistent world canvas — fixed behind every chapter, mounted from
 * `[lang]/layout`.
 *
 * Mounts only when motion is allowed and WebGL exists. Otherwise it renders
 * nothing: the hero keeps its `GraphStill` (see `hero-graph.tsx`) as the
 * graph's only body, and ink chapters simply run flat-dark. The site must
 * work completely without this component — that is a build constraint, not a
 * fallback bolted on at the end.
 *
 * Sits at z = -10: above the root background, below everything else, so the
 * column rules (`.bg-grid-lines`) and the grain still cross over it.
 *
 * Chapter ownership lives here, not in the scene: the palette target is
 * route-aware. The hero sentinel only exists on home, and an
 * IntersectionObserver bound to a removed element never fires again — so a
 * scene-level observer got stranded mid-lerp the first time anyone navigated
 * away. Non-home routes are ink, always.
 */

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion, useWebGLAvailable } from "./use-graph-runtime";

const GraphCanvas = dynamic(() => import("./canvas").then((mod) => mod.GraphCanvas), {
  ssr: false,
});

export function WorldGraph() {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();

  const pathname = usePathname();
  const isHome = /^\/[a-z]{2}\/?$/.test(pathname);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const sentinel = document.querySelector("[data-hero-chapter-end]");
    if (!sentinel) return;
    // The observer's first callback fires on observe() — that covers the
    // initial state, so no synchronous setState happens in the effect body.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setHeroVisible(entry.isIntersecting || entry.boundingClientRect.top > 0);
      },
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHome]);

  const chapterTarget = isHome && heroVisible ? 1 : 0;

  if (reducedMotion || !webgl) return null;

  return (
    <>
      {/* TEMP DEBUG — remove after palette verification */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 8,
          left: 8,
          zIndex: 9999,
          pointerEvents: "none",
          background: "rgba(0,0,0,0.8)",
          color: "#a3e635",
          font: "11px monospace",
          padding: "2px 6px",
        }}
      >
        {`target=${chapterTarget} heroVisible=${String(heroVisible)} isHome=${String(isHome)}`}
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <GraphCanvas className="h-full w-full" chapterTarget={chapterTarget} />
      </div>
    </>
  );
}
