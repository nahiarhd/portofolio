"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import type { PipelineStep } from "@/content/projects";
import { EYEBROW } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { ScrambleText } from "./ui/scramble-text";

export function ArchitecturePipeline({
  pipeline,
  lang,
}: {
  pipeline?: readonly PipelineStep[];
  lang: Locale;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  if (!pipeline || pipeline.length === 0) return null;

  const current = pipeline[activeStep] ?? pipeline[0];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    playSound("tick");
  };

  const copy = {
    title:
      lang === "id"
        ? "Arsitektur Sistem & Pipeline Data"
        : "System Architecture & Execution Pipeline",
    instruction:
      lang === "id"
        ? "Pilih tahap untuk memeriksa metrik eksekusi dan mekanisme sistem."
        : "Click a stage to inspect execution metrics and system mechanics.",
    stage: lang === "id" ? "Tahap" : "Stage",
    metric: lang === "id" ? "Spesifikasi / SLA" : "Specification / SLA",
    telemetry: lang === "id" ? "STATUS TELEMETRI" : "TELEMETRY STATUS",
    activeFlow: lang === "id" ? "ALIRAN DATA AKTIF" : "ACTIVE DATASTREAM",
  };

  return (
    <section
      className="panel-strong my-12 overflow-hidden rounded-2xl border border-border/80 p-6 sm:p-8"
      aria-label={copy.title}
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className={EYEBROW}>
            {copy.stage} 0{activeStep + 1} / 0{pipeline.length}
          </p>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {copy.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <p className="font-mono text-[0.68rem] uppercase tracking-wider text-primary">
            {copy.activeFlow}
          </p>
        </div>
      </div>

      {/* Pipeline Sequence Bar with Animated Flow */}
      <div
        role="tablist"
        aria-label={copy.title}
        className="relative mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
      >
        {pipeline.map((step, i) => {
          const isSelected = i === activeStep;
          return (
            <motion.button
              key={step.tag + i}
              type="button"
              role="tab"
              aria-selected={isSelected}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => handleStepClick(i)}
              className={cn(
                "group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                isSelected
                  ? "border-primary/80 bg-primary/15 shadow-[0_0_28px_-4px_rgba(184,131,236,0.35)]"
                  : "border-border/60 bg-surface-1/60 hover:border-border-strong hover:bg-surface-2",
              )}
            >
              {/* Animated active signal dot */}
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[0.65rem] font-bold uppercase tracking-widest transition-colors",
                    isSelected ? "text-primary font-bold" : "text-muted-foreground",
                  )}
                >
                  <ScrambleText text={step.tag} />
                </span>
                <span
                  className={cn(
                    "size-2 rounded-full transition-all duration-300",
                    isSelected
                      ? "bg-primary shadow-[0_0_10px_var(--primary)]"
                      : "bg-muted-foreground/30 group-hover:bg-muted-foreground",
                  )}
                  aria-hidden
                />
              </div>

              <span className="mt-2.5 font-display text-sm font-medium leading-snug text-foreground">
                {step.name[lang]}
              </span>

              {step.metric ? (
                <span
                  className={cn(
                    "mt-3 inline-block rounded-md border px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider transition-colors",
                    isSelected
                      ? "border-primary/50 bg-primary/20 text-foreground"
                      : "border-border/60 bg-surface-3 text-muted-foreground",
                  )}
                >
                  {step.metric}
                </span>
              ) : null}

              {/* Animated Flow Connector Arrow */}
              {i < pipeline.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-muted-foreground-faint sm:block"
                  aria-hidden
                >
                  &#8250;
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive Panel with Framer Motion AnimatePresence */}
      <div className="surface-inset mt-6 rounded-xl border border-border/80 p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  [{current.tag}]
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                  {current.name[lang]}
                </h3>
              </div>
              {current.metric ? (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground">{copy.metric}:</span>
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-bold text-primary shadow-[0_0_12px_rgba(184,131,236,0.2)]">
                    {current.metric}
                  </span>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {current.detail[lang]}
            </p>

            {/* Live Telemetry Pulse Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground-faint">
              <span>{copy.telemetry}: VERIFIED SLA</span>
              <span className="text-primary font-semibold">STAGE 0{activeStep + 1} ONLINE</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
