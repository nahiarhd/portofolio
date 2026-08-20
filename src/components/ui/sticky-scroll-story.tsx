"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import React, { useRef } from "react";

import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

export interface StickyStoryProject {
  slug: string;
  title: string;
  pillar: string;
  pillarLabel: string;
  startedLabel: string;
  summary: React.ReactNode;
  coverImage?: string;
  confidential?: boolean;
  href: string;
}

interface StickyScrollStoryProps {
  projects: StickyStoryProject[];
  heading?: string;
  lead?: string;
  confidentialBadge?: string;
  readLabel?: string;
  className?: string;
}

interface StoryCardProps {
  project: StickyStoryProject;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  confidentialBadge?: string;
  readLabel?: string;
}

function StoryCard({
  project,
  index,
  total,
  scrollYProgress,
  confidentialBadge = "NDA",
  readLabel = "Read case study",
}: StoryCardProps) {
  const segment = 1 / total;
  const start = index * segment;
  const enterMid = start + segment * 0.2;
  const exitMid = start + segment * 0.8;
  const end = Math.min((index + 1) * segment, 1);

  // If it's the last item, keep it visible until scrolled out of the container
  const opacity = useTransform(
    scrollYProgress,
    index === total - 1
      ? [start, enterMid, 0.96, 1]
      : [start, enterMid, exitMid, end],
    index === total - 1 ? [0, 1, 1, 0] : [0, 1, 1, 0],
  );

  const y = useTransform(
    scrollYProgress,
    index === total - 1
      ? [start, enterMid, 0.96, 1]
      : [start, enterMid, exitMid, end],
    index === total - 1 ? [40, 0, 0, -40] : [40, 0, 0, -40],
  );

  const scale = useTransform(
    scrollYProgress,
    index === total - 1
      ? [start, enterMid, 0.96, 1]
      : [start, enterMid, exitMid, end],
    index === total - 1 ? [0.96, 1, 1, 0.96] : [0.96, 1, 1, 0.96],
  );

  return (
    <motion.div
      style={{
        opacity,
        y,
        scale,
        pointerEvents: "auto",
      }}
      className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
    >
      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-6 overflow-hidden rounded-3xl border-2 border-primary/50 bg-surface-1/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:grid-cols-12 lg:gap-10 lg:p-10">
        {/* Ambient Glow */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(184,131,236,0.18),transparent_75%)]"
          aria-hidden
        />

        {/* Left/Top Content Column (7 cols) */}
        <div className="relative z-10 space-y-4 md:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-primary">
              {project.pillarLabel}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {project.startedLabel}
            </span>
            {project.confidential ? (
              <span className="chapter-stamp chapter-stamp--classified text-[0.58rem]">
                {confidentialBadge}
              </span>
            ) : null}
          </div>

          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {project.title}
          </h3>

          <div className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {project.summary}
          </div>

          <div className="pt-4">
            <Link
              href={project.href}
              className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(184,131,236,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_36px_rgba(184,131,236,0.6)]"
            >
              {readLabel} ↗
            </Link>
          </div>
        </div>

        {/* Right/Bottom Image Column (5 cols) */}
        <div className="relative z-10 md:col-span-5">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-surface-2 shadow-xl">
            {project.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.coverImage}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
                DECLASSIFIED ARCHITECTURE
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 via-transparent to-transparent" />
            <BorderBeam size={200} duration={12} colorFrom="#b883ec" colorTo="#38bdf8" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StickyScrollStory({
  projects,
  heading = "Selected Work",
  lead,
  confidentialBadge,
  readLabel,
  className,
}: StickyScrollStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const total = projects.length;
  // Multiplier gives enough scroll runway for each project to smoothly enter, stay, and transition
  const containerHeight = `${Math.max(total * 110, 300)}vh`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return (
      <div className={cn("space-y-8 py-16", className)}>
        {projects.map((project) => (
          <div
            key={project.slug}
            className="rounded-2xl border border-border bg-surface-1 p-6"
          >
            <span className="font-mono text-xs uppercase text-primary">
              {project.pillarLabel}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              {project.title}
            </h3>
            <div className="mt-2 text-sm text-muted-foreground">{project.summary}</div>
            <Link
              href={project.href}
              className="mt-4 inline-block font-mono text-xs font-bold uppercase text-primary"
            >
              {readLabel || "Read case study"} ↗
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight }}
      className={cn("relative w-full", className)}
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden px-4 py-8 sm:px-8 sm:py-12">
        {/* Top Header & Project Counter */}
        <div className="relative z-20 flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
              {heading}
            </span>
            {lead ? (
              <p className="mt-1 hidden max-w-xl font-mono text-xs text-muted-foreground sm:block">
                {lead}
              </p>
            ) : null}
          </div>

          {/* Left Vertical Progress Dots */}
          <div className="flex items-center gap-2">
            {projects.map((_, i) => {
              const start = i / total;
              const end = (i + 1) / total;
              return (
                <DotIndicator
                  key={`dot-${i}`}
                  progress={smoothProgress}
                  range={[start, end]}
                />
              );
            })}
          </div>
        </div>

        {/* Central Kinetic Transition Stage */}
        <div className="relative my-auto flex h-[580px] w-full items-center justify-center">
          {projects.map((project, idx) => (
            <StoryCard
              key={project.slug}
              project={project}
              index={idx}
              total={total}
              scrollYProgress={smoothProgress}
              confidentialBadge={confidentialBadge}
              readLabel={readLabel}
            />
          ))}
        </div>

        {/* Bottom Editorial Footer */}
        <div className="relative z-20 flex items-center justify-between border-t border-border/80 pt-4 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <span>AIR-GAPPED COMPLIANCE · ZERO DATA EGRESS</span>
          <span>[SCROLL DOWN TO ADVANCE TIMELINE ↓]</span>
        </div>
      </div>
    </div>
  );
}

function DotIndicator({
  progress,
  range,
}: {
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const bg = useTransform(
    progress,
    [range[0], range[0] + 0.05, range[1] - 0.05, range[1]],
    [
      "rgba(255, 255, 255, 0.2)",
      "rgba(184, 131, 236, 1)",
      "rgba(184, 131, 236, 1)",
      "rgba(255, 255, 255, 0.2)",
    ],
  );

  const scale = useTransform(
    progress,
    [range[0], range[0] + 0.05, range[1] - 0.05, range[1]],
    [1, 1.4, 1.4, 1],
  );

  return (
    <motion.span
      style={{ backgroundColor: bg, scale }}
      className="size-2 rounded-full transition-shadow will-change-transform"
    />
  );
}

export default StickyScrollStory;
