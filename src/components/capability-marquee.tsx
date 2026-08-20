"use client";

import { projects } from "@/content/projects";
import { playSound } from "@/lib/sound";

/**
 * Kinetic band between the two full-viewport moments.
 *
 * Terms come from the `stack` arrays in `src/content/projects.ts` rather than a
 * hand-kept list, so the strip cannot advertise something no case study
 * actually used. The track prints the same row twice because the CSS loop
 * translates by exactly half its width.
 */
const CAPABILITIES = [...new Set(projects.flatMap((project) => project.stack))];

export function CapabilityMarquee() {
  const row = (
    <ul className="marquee-track" aria-hidden>
      {[...CAPABILITIES, ...CAPABILITIES].map((term, i) => (
        <li
          key={`${term}-${i}`}
          onMouseEnter={() => playSound("tick")}
          className="group/tag flex shrink-0 cursor-default items-center gap-10 whitespace-nowrap px-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <span className="relative transition-all duration-200 group-hover/tag:text-primary group-hover/tag:drop-shadow-[0_0_8px_rgba(184,131,236,0.6)]">
            {term}
          </span>
          <span className="size-1 shrink-0 rounded-full bg-primary/60 transition-transform duration-200 group-hover/tag:scale-150 group-hover/tag:bg-primary" />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      className="marquee relative overflow-hidden border-t border-border bg-surface-1/30 py-5 backdrop-blur-xs"
      aria-label="Technologies used across the case studies"
    >
      {/* Left/Right Edge Fades */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
        aria-hidden
      />

      {/* The visible track is decorative repetition; this carries the content. */}
      <p className="sr-only">{CAPABILITIES.join(", ")}</p>
      {row}
    </section>
  );
}
