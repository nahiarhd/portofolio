"use client";

/**
 * Full-viewport work browser. WebGL plates when available, DOM plate otherwise.
 * The title, summary and controls are always DOM: nothing readable or operable
 * lives inside the canvas, so the section works identically with WebGL blocked.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { withRedactions } from "@/components/redaction";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";
import type { PanelProject } from "./work-stage-canvas";

export type WorkStageItem = PanelProject & {
  summary: string;
  pillar: "ai" | "blockchain" | "data";
};

const WorkStageCanvas = dynamic(
  () => import("./work-stage-canvas").then((m) => m.WorkStageCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-40 w-64 animate-pulse border border-border bg-surface-1 sm:h-56 sm:w-96" />
      </div>
    ),
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
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => false,
  );
}

function StillPlate({
  project,
  coverLabel,
}: {
  project: WorkStageItem;
  coverLabel: string;
}) {
  return (
    <div className="relative aspect-[16/10] w-full max-w-3xl border border-border-strong bg-surface-1">
      {project.coverSrc ? (
        <Image
          key={project.slug}
          src={project.coverSrc}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 48rem"
          unoptimized={project.coverSrc.endsWith(".svg")}
          className="object-cover"
          priority
        />
      ) : (
        <div
          className={cn(
            "flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.16em]",
            TEXT.faint,
          )}
        >
          {coverLabel}
        </div>
      )}
    </div>
  );
}

export function WorkStage({
  lang,
  projects,
  dictionary,
  heading,
}: {
  lang: Locale;
  projects: readonly WorkStageItem[];
  dictionary: Dictionary["work"];
  heading: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();
  const use3d = webgl && !reduced;

  const total = projects.length;
  const project = projects[index]!;

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const arrowClass =
    "flex size-11 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <section
      id="work-stage"
      className="relative flex min-h-[100dvh] scroll-mt-16 flex-col border-t border-border"
      aria-label={heading}
    >
      <div className={`${CONTAINER} flex min-h-[100dvh] flex-col pb-10 pt-24 sm:pt-28`}>
        <h2 data-anim="reveal-head" className="font-display text-title font-medium tracking-tight">
          <RedactLine>{heading}</RedactLine>
        </h2>

        <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
          {use3d ? (
            <div className="h-[min(52dvh,30rem)] w-full sm:h-[min(62dvh,38rem)]">
              <WorkStageCanvas
                projects={projects}
                selectedIndex={index}
                onSelect={setIndex}
                className="h-full w-full"
              />
            </div>
          ) : (
            <StillPlate project={project} coverLabel={dictionary.cover} />
          )}
        </div>

        {/* Always DOM: this is the readable and operable half of the stage. */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 max-w-2xl">
              <p className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-eyebrow uppercase tracking-[0.16em]",
                    TEXT.faint,
                  )}
                >
                  {dictionary.pillars[project.pillar]}
                </span>
                {project.confidential ? (
                  <span className="chapter-stamp chapter-stamp--classified">
                    {dictionary.confidential}
                  </span>
                ) : null}
              </p>

              <h3 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-4xl">
                {project.title}
              </h3>
              <p className={cn("mt-3 text-sm leading-relaxed sm:text-base", TEXT.subtle)}>
                {project.confidential
                  ? withRedactions(project.summary, dictionary.redacted)
                  : project.summary}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link href={`/${lang}/work/${project.slug}`} className={BUTTON.primary}>
                {dictionary.read}
              </Link>
              <button type="button" onClick={prev} className={arrowClass} aria-label={dictionary.previous}>
                <span aria-hidden>&#8592;</span>
              </button>
              <button type="button" onClick={next} className={arrowClass} aria-label={dictionary.next}>
                <span aria-hidden>&#8594;</span>
              </button>
              <span
                className={cn(
                  "ml-1 font-mono text-xs tabular-nums tracking-[0.14em]",
                  TEXT.faint,
                )}
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-1.5" role="tablist" aria-label={heading}>
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={p.title}
                onClick={() => setIndex(i)}
                className="group flex h-6 flex-1 items-center"
              >
                <span
                  className={cn(
                    "block h-0.5 w-full transition-colors",
                    i === index ? "bg-primary" : "bg-border-strong group-hover:bg-primary/50",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
