"use client";

import { profile } from "@/content/profile";
import { CONTAINER } from "@/lib/design";
import type { Locale } from "@/lib/locale";

import { ScrambleText } from "./ui/scramble-text";
import { TextRevealOnScroll } from "./ui/text-reveal-on-scroll";

/**
 * Typographic statement beat between the work and the chat.
 * Upgraded with Framer-inspired spring-smoothed scroll progressive text illumination.
 */
export function Statement({ lang }: { lang: Locale }) {
  const fullStatement = profile.tagline[lang];

  return (
    <section
      id="statement"
      data-anim="statement"
      className="work-chapter relative flex min-h-[100dvh] items-center border-t border-border pt-28 pb-20"
    >
      {/* Ambient radial violet glow centered behind the typography */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(184,131,236,0.14),transparent_75%)]"
        aria-hidden
      />

      <div className={CONTAINER}>
        {/* Technical Eyebrow Meta Stamp with ScrambleText */}
        <div className="mb-8 flex items-center gap-3" data-anim="statement-badge">
          <span className="chapter-stamp chapter-stamp--classified !text-[0.6rem] tracking-widest">
            <ScrambleText text={lang === "id" ? "PRINSIP TEKNIS" : "ENGINEERING ETHOS"} />
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground">
            <ScrambleText text={lang === "id" ? "FILOSOFI ARSITEKTUR" : "ARCHITECTURAL DISCIPLINE"} />
          </span>
        </div>

        {/* Buttery Smooth Text Reveal on Scroll */}
        <h2 className="font-display text-[clamp(2.75rem,7.5vw,6rem)] font-medium leading-[0.96] tracking-[-0.04em]">
          <TextRevealOnScroll
            text={fullStatement}
            mutedColor="rgba(255, 255, 255, 0.18)"
            primaryColor="rgba(255, 255, 255, 0.98)"
            accentColor="#b883ec"
            accentWords={
              lang === "id"
                ? ["sistem", "arsitektur", "privasi", "aman", "firewall"]
                : ["systems", "privacy", "zero", "firewall", "production"]
            }
          />
        </h2>

        {/* Architectural Pillars Subtitle */}
        <div
          data-anim="statement-meta"
          className="mt-12 flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden />
            <span>AIR-GAPPED COMPLIANCE</span>
          </span>
          <span className="text-muted-foreground-faint">•</span>
          <span>ZERO DATA EGRESS</span>
          <span className="text-muted-foreground-faint">•</span>
          <span>DETERMINISTIC AGENTS</span>
        </div>
      </div>
    </section>
  );
}
