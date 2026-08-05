"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Locale } from "@/lib/locale";
import type { ShelfBook } from "@/lib/shelf-books";

/** Full viewport setpiece — One Object Portfolio. */
const SHELF_MIN_HEIGHT = "min-h-[100dvh]";

function ShelfPlaceholder({ label = "Loading shelf…" }: { label?: string }) {
  return (
    <div
      className={`flex ${SHELF_MIN_HEIGHT} w-full items-center justify-center bg-background font-mono text-sm text-muted-foreground`}
    >
      {label}
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
  const [inView, setInView] = useState(false);
  const active = hashActive || inView;

  useEffect(() => {
    if (active) return;
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      // Prefetch earlier: setpiece should be ready when the user scrolls in.
      { rootMargin: "120% 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="shelf"
      className="scroll-mt-20 border-t border-border/60"
      aria-label="The Complete Shelf"
    >
      {active ? (
        <ShelfExperience lang={lang} books={books} readLabel={readLabel} />
      ) : (
        <ShelfPlaceholder label="The Complete Shelf" />
      )}
    </section>
  );
}
