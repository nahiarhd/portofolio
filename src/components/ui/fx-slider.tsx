"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { AnimatedSVGUnderlink } from "@/components/ui/animated-svg-underlink";
import { BorderBeam } from "@/components/ui/border-beam";
import { playSound, updateAmbientScroll } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface FXSliderItem {
  id: string;
  title: string;
  category: string;
  featured: string;
  summary?: React.ReactNode;
  image?: string;
  href: string;
}

interface FXSliderProps {
  items: FXSliderItem[];
  headerText?: string;
  footerText?: string;
  className?: string;
}

export function FXSlider({
  items,
  headerText = "PRODUCTION ARCHITECTURES",
  footerText = "DECLASSIFIED CASE STUDIES",
  className,
}: FXSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("down");
  const shouldReduceMotion = useReducedMotion();

  const total = items.length;
  const activeItem = items[currentIdx] ?? items[0];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const progressBarWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Automatically update active project and ambient drone harmonics on scroll
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      updateAmbientScroll(latest);
      const newIndex = Math.min(
        Math.floor(latest * total),
        total - 1,
      );
      if (newIndex !== currentIdx && newIndex >= 0) {
        setDirection(newIndex > currentIdx ? "down" : "up");
        setCurrentIdx(newIndex);
        playSound("scroll");
      }
    });
  }, [scrollYProgress, total, currentIdx]);

  // Optional manual click
  const handleSelect = useCallback(
    (index: number) => {
      if (index === currentIdx || index < 0 || index >= items.length) return;
      setDirection(index > currentIdx ? "down" : "up");
      setCurrentIdx(index);
      playSound("tick");

      if (containerRef.current) {
        const top =
          containerRef.current.offsetTop +
          (index / total) * (containerRef.current.offsetHeight - window.innerHeight);
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [currentIdx, items.length, total],
  );

  if (shouldReduceMotion) {
    return (
      <div className={cn("space-y-8 py-12", className)}>
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-surface-1 p-6"
          >
            <span className="font-mono text-xs uppercase text-primary">
              {item.category}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              {item.title}
            </h3>
            <div className="mt-2 text-sm text-muted-foreground">{item.summary}</div>
            <Link
              href={item.href}
              className="mt-4 inline-block font-mono text-xs font-bold uppercase text-primary"
            >
              Inspect Case Study ↗
            </Link>
          </div>
        ))}
      </div>
    );
  }

  // Generous scroll runway height for silky smooth transitions
  const runwayHeight = `${Math.max(total * 100, 320)}vh`;

  return (
    <div
      ref={containerRef}
      style={{ height: runwayHeight }}
      className={cn("relative w-full", className)}
    >
      {/* Sticky Fullscreen Viewport Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden px-4 py-8 sm:px-8 sm:py-10">
        {/* Dynamic Background Image Vignette with Parallax Shift */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {activeItem.image ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.18, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="h-full w-full object-cover grayscale brightness-75"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(184,131,236,0.14),transparent_80%)]" />
        </div>

        {/* Top Header with Animated Underlink */}
        <div className="relative z-10 flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <AnimatedSVGUnderlink autoPlay strokeWidth={2}>
              <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
                {headerText}
              </span>
            </AnimatedSVGUnderlink>
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="text-primary font-bold">
              {String(currentIdx + 1).padStart(2, "0")}
            </span>{" "}
            / {String(items.length).padStart(2, "0")}
          </div>
        </div>

        {/* Main Stage */}
        <div className="relative z-10 my-auto grid grid-cols-1 items-center gap-8 py-4 lg:grid-cols-12">
          {/* Left Column: Project Selector List (5 Columns) */}
          <div className="space-y-3 lg:col-span-5">
            {items.map((item, idx) => {
              const isActive = idx === currentIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    "group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary cursor-pointer",
                    isActive
                      ? "border border-primary/60 bg-primary/10 shadow-[0_0_24px_rgba(184,131,236,0.25)] translate-x-2"
                      : "border border-transparent hover:border-border hover:bg-surface-2/60 opacity-45 hover:opacity-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "size-2 rounded-full transition-all",
                        isActive
                          ? "bg-primary shadow-[0_0_10px_#b883ec] scale-125"
                          : "bg-muted-foreground-faint group-hover:bg-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "font-display text-base font-medium tracking-tight transition-colors sm:text-lg",
                        isActive
                          ? "text-foreground font-bold"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>

                  <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                    0{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Case Study Card with Dynamic Border Beam (7 Columns) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: direction === "down" ? 28 : -28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: direction === "down" ? -28 : 28, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl border-2 border-primary/50 bg-surface-1/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-primary">
                    {activeItem.category}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {activeItem.featured}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {activeItem.title}
                </h3>

                {activeItem.summary ? (
                  <div className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {activeItem.summary}
                  </div>
                ) : null}

                {/* Direct Action Link to Project Case Study */}
                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/80 pt-4">
                  <Link
                    href={activeItem.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(184,131,236,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(184,131,236,0.6)]"
                  >
                    Inspect Case Study ↗
                  </Link>

                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    FULL ARCHITECTURAL SPECIFICATION
                  </span>
                </div>

                <BorderBeam size={220} duration={14} colorFrom="#b883ec" colorTo="#38bdf8" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Editorial Progress Bar with Continuous Spring-Smoothed Line */}
        <div className="relative z-10 border-t border-border/80 pt-4">
          <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <span>{footerText}</span>
            <span>[SCROLL DOWN TO ADVANCE ARCHITECTURES ↓]</span>
          </div>

          <div className="relative mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_12px_#b883ec]"
              style={{ width: progressBarWidth }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FXSlider;
