import { projects } from "@/content/projects";

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
          className="flex shrink-0 items-center gap-10 whitespace-nowrap px-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {term}
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary/60" />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      className="marquee overflow-hidden border-t border-border py-5"
      aria-label="Technologies used across the case studies"
    >
      {/* The visible track is decorative repetition; this carries the content. */}
      <p className="sr-only">{CAPABILITIES.join(", ")}</p>
      {row}
    </section>
  );
}
