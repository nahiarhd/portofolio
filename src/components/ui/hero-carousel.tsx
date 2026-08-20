"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { BorderBeam } from "./border-beam";
import { MagneticPill } from "./magnetic-pill";

export interface HeroCarouselItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  date?: string;
  credentialId?: string;
  verifyUrl?: string;
  media?: React.ReactNode;
}

interface HeroCarouselProps {
  items: HeroCarouselItem[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HeroCarousel({
  items,
  className,
  autoPlay = false,
  autoPlayInterval = 6000,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItem = items[activeIndex] ?? items[0];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    playSound("tick");
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    playSound("tick");
  }, [items.length]);

  const handleSelect = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    playSound("tick");
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  // Optional auto-play
  useEffect(() => {
    if (!autoPlay || shouldReduceMotion) return;
    const timer = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, handleNext, shouldReduceMotion]);

  if (!items.length) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/80 bg-surface-1 p-4 shadow-2xl backdrop-blur-md sm:p-8",
        className,
      )}
    >
      {/* Ambient background glow matching active certificate */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />

      {/* Main Unfurled Active Feature Card */}
      <div className="relative min-h-[280px] w-full rounded-2xl border border-border bg-surface-2/60 p-5 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            {/* Left: Certificate Media Preview */}
            <div className="w-full shrink-0 lg:w-72">
              <div className="overflow-hidden rounded-xl border border-border-strong bg-background/80 shadow-md">
                {activeItem.media}
              </div>
            </div>

            {/* Right: Detailed Verified Info */}
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {activeItem.badge ? (
                    <span className="chapter-stamp chapter-stamp--classified !text-[0.6rem] tracking-widest">
                      {activeItem.badge}
                    </span>
                  ) : null}
                  {activeItem.date ? (
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      {activeItem.date}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-2.5 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {activeItem.title}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-primary">
                  {activeItem.subtitle}
                </p>

                {activeItem.credentialId ? (
                  <p className="mt-3 font-mono text-[0.68rem] text-muted-foreground">
                    Credential ID:{" "}
                    <span className="text-foreground font-semibold">{activeItem.credentialId}</span>
                  </p>
                ) : null}
              </div>

              {activeItem.verifyUrl ? (
                <div className="pt-2">
                  <MagneticPill strength={0.25} className="inline-block">
                    <a
                      href={activeItem.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_16px_rgba(184,131,236,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      Verify on Skilljar &#8599;
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </MagneticPill>
                </div>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>

        <BorderBeam size={240} duration={14} colorFrom="#b883ec" colorTo="#38bdf8" />
      </div>

      {/* Filmstrip Mini-Card Selector Track */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {activeIndex + 1} / {items.length} Credentials
          </span>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous certificate"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2/80 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next certificate"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2/80 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              →
            </button>
          </div>
        </div>

        {/* Filmstrip Track */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={cn(
                  "group relative flex w-48 shrink-0 flex-col justify-between rounded-xl border p-3 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/10 shadow-[0_0_14px_rgba(184,131,236,0.25)] ring-1 ring-primary"
                    : "border-border bg-surface-2/40 opacity-70 hover:border-border-strong hover:opacity-100",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      isActive ? "bg-primary animate-pulse" : "bg-muted-foreground-faint",
                    )}
                  />
                  <span className="font-mono text-[0.58rem] uppercase tracking-wider text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 font-display text-xs font-medium leading-tight text-foreground group-hover:text-primary">
                  {item.title}
                </p>

                <p className="mt-1 truncate font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                  {item.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HeroCarousel;
