"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Locale } from "@/lib/locale";
import type { ShelfBook } from "@/lib/shelf-books";
import { cn } from "@/lib/utils";

const SHELF_MIN_HEIGHT = "min-h-[100dvh]";

/** Designed loading stage — never a blank black hole while Three.js boots. */
function ShelfPlaceholder({ label = "Loading library…" }: { label?: string }) {
  const heights = [7.5, 8.2, 9, 8.5, 7.8, 8.8];
  return (
    <div
      className={cn(
        SHELF_MIN_HEIGHT,
        "relative flex w-full flex-col overflow-hidden bg-[#08080a]",
      )}
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(124,58,237,0.12), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute left-5 top-20 z-10 sm:left-8 sm:top-24">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
          Editorial library
        </p>
        <p className="mt-1 font-display text-lg text-foreground">The Complete Shelf</p>
      </div>
      {/* Book silhouettes on a plank — promise of the 3D stage */}
      <div className="absolute inset-x-0 bottom-[28%] flex items-end justify-center gap-2 px-6 sm:gap-3">
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-9 animate-pulse rounded-sm border border-white/10 bg-surface-2 sm:w-12"
            style={{
              height: `${h}rem`,
              animationDelay: `${i * 80}ms`,
              opacity: 0.55 + (i % 3) * 0.1,
            }}
            aria-hidden
          />
        ))}
      </div>
      <div
        className="absolute inset-x-[8%] bottom-[26%] h-3 rounded-sm bg-surface-3/80"
        aria-hidden
      />
      <p className="absolute inset-x-0 bottom-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

const ShelfExperience = dynamic(
  () => import("./shelf-experience").then((mod) => mod.ShelfExperience),
  {
    ssr: false,
    loading: () => <ShelfPlaceholder />,
  },
);

function subscribeHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getShelfHash(): boolean {
  return window.location.hash === "#shelf";
}

export function ShelfIsland({
  lang,
  books,
  readLabel,
}: {
  lang: Locale;
  books: ShelfBook[];
  readLabel: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const hashActive = useSyncExternalStore(subscribeHash, getShelfHash, () => false);
  const [ready, setReady] = useState(false);
  // Mount WebGL as soon as the island is in the document so books exist
  // before the user finishes scrolling past the hero.
  const active = hashActive || ready;

  useEffect(() => {
    // Prefer idle; fall back so mobile still preloads quickly.
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 600 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="shelf"
      className="scroll-mt-0 border-t border-border/40"
      aria-label="The Complete Shelf"
    >
      {active ? (
        <ShelfExperience lang={lang} books={books} readLabel={readLabel} />
      ) : (
        <ShelfPlaceholder />
      )}
    </section>
  );
}
