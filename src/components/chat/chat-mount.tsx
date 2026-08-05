"use client";

/**
 * Inline Ask section. Defers the chat panel (and `@ai-sdk/react`) until the
 * section is near the viewport or `#ask` is targeted. Site still works with
 * chat never loaded.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type Props = {
  lang: Locale;
  copy: Dictionary["chat"];
  work: Dictionary["work"];
  heading: string;
};

const ChatPanel = dynamic(
  () => import("./chat-panel").then((mod) => mod.ChatPanel),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[min(70vh,32rem)] animate-pulse rounded-2xl border border-border bg-surface-1"
        aria-busy="true"
        aria-label="Loading chat"
      />
    ),
  },
);

function subscribeHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getAskHash(): boolean {
  return window.location.hash === "#ask";
}

export function ChatMount({ lang, copy, work, heading }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const hashActive = useSyncExternalStore(subscribeHash, getAskHash, () => false);
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
      { rootMargin: "80% 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return (
    <section ref={sectionRef} id="ask" className={`${CONTAINER} ${SECTION}`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-title font-semibold tracking-tight">{heading}</h2>
        <p className={cn("mt-3 max-w-[52ch] text-sm leading-relaxed sm:text-base", TEXT.subtle)}>
          {copy.emptyHint}
        </p>
      </div>

      <div className="mt-10">
        {active ? (
          <ChatPanel lang={lang} copy={copy} work={work} />
        ) : (
          <div
            className={cn(
              "flex min-h-[min(70vh,32rem)] items-center justify-center rounded-2xl border border-border bg-surface-1 p-6",
              "font-mono text-sm text-muted-foreground",
            )}
          >
            {copy.open}
          </div>
        )}
      </div>
    </section>
  );
}
