"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";

import { cn } from "@/lib/utils";

interface ScrollZoomRevealProps {
  leftText?: string;
  rightText?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc?: string;
  className?: string;
}

export function ScrollZoomReveal({
  leftText = "© 2026 // DECLASSIFIED",
  rightText = "AI SYSTEMS ARCHITECTURE",
  badge = "PORTAL // LEVEL-4 CLEARANCE",
  title = "Production AI Systems & Air-Gapped Pipelines",
  subtitle = "12 verifiable case studies in autonomous tool calling, revenue intelligence, and zero data egress architectures.",
  buttonText = "Explore Production Catalog ↗",
  buttonHref = "#work",
  imageSrc,
  className,
}: ScrollZoomRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring physics for scale and expansion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  });

  const width = useTransform(smoothProgress, [0, 0.85], ["22vw", "100vw"]);
  const height = useTransform(smoothProgress, [0, 0.85], ["10vh", "100vh"]);
  const borderRadius = useTransform(smoothProgress, [0, 0.85], ["9999px", "0px"]);
  const contentOpacity = useTransform(smoothProgress, [0.35, 0.7], [0, 1]);
  const contentY = useTransform(smoothProgress, [0.35, 0.7], [40, 0]);
  const flankingOpacity = useTransform(smoothProgress, [0.15, 0.5], [1, 0]);

  if (shouldReduceMotion) {
    return (
      <section className={cn("relative w-full py-20", className)}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
            {badge}
          </span>
          <h3 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
          <div className="mt-8">
            <a
              href={buttonHref}
              className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(184,131,236,0.4)] transition-opacity hover:opacity-90"
            >
              {buttonText}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className={cn("relative h-[240vh] w-full", className)}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Flanking Editorial Left Text */}
        <motion.div
          style={{ opacity: flankingOpacity }}
          className="pointer-events-none hidden font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:block md:w-56 md:text-right"
        >
          {leftText}
        </motion.div>

        {/* Central Expanding Capsule Portal */}
        <motion.div
          style={{
            width,
            height,
            borderRadius,
          }}
          className="relative mx-4 flex shrink-0 items-center justify-center overflow-hidden border-2 border-primary/60 bg-surface-1 shadow-[0_0_60px_rgba(184,131,236,0.3)] backdrop-blur-2xl md:mx-8"
        >
          {/* Ambient Background Grid & Glow */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(184,131,236,0.2),transparent_75%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
            aria-hidden
          />

          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          ) : null}

          {/* Fully Unfurled Content (Fades in during expansion) */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="relative z-10 mx-auto max-w-4xl px-6 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
                {badge}
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={buttonHref}
                className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(184,131,236,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(184,131,236,0.6)]"
              >
                {buttonText}
              </a>
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                [SCROLL DOWN TO REVEAL CATALOG]
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Flanking Editorial Right Text */}
        <motion.div
          style={{ opacity: flankingOpacity }}
          className="pointer-events-none hidden font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:block md:w-56 md:text-left"
        >
          {rightText}
        </motion.div>
      </div>
    </section>
  );
}

export default ScrollZoomReveal;
