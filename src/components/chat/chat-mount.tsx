"use client";

/**
 * Defers the chat panel (and `@ai-sdk/react`) until the visitor opens it or the
 * browser is idle. Keeps first paint free of the chat client chunk — the site
 * must work completely with the chat closed, so loading it eagerly is wasted
 * LCP budget.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type Props = {
  lang: Locale;
  copy: Dictionary["chat"];
  work: Dictionary["work"];
};

const ChatPanel = dynamic(
  () => import("./chat-panel").then((mod) => mod.ChatPanel),
  { ssr: false },
);

export function ChatMount({ lang, copy, work }: Props) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    // Idle load: first open is still instant enough after a short visit, and
    // first paint never waits on the chat bundle.
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(() => setLoad(true), { timeout: 4_000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(() => setLoad(true), 2_500);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (load) {
    return <ChatPanel lang={lang} copy={copy} work={work} />;
  }

  // Lightweight launcher until the real panel chunk arrives. Same position and
  // copy so the swap does not jump.
  return (
    <button
      type="button"
      onClick={() => setLoad(true)}
      className={cn(
        "fixed bottom-5 right-5 z-50 max-w-[min(100%-2.5rem,16rem)]",
        "glass-strong rounded-full px-5 py-3 text-left text-sm font-medium",
        "transition-colors hover:border-primary/50 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {copy.open}
    </button>
  );
}
