import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";
import { MediaFrame } from "./media-frame";

export function Hero({ lang }: { lang: Locale }) {
  return (
    <section className={`${CONTAINER} relative pb-16 pt-24 sm:pb-24 sm:pt-32`}>
      {/* Identity strip — data only, one accent family (no emerald “live” dot). */}
      <div className="hero-cinematic flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-primary">
          {profile.name}
        </p>
        <p className={cn("font-mono text-eyebrow uppercase tracking-[0.16em]", TEXT.faint)}>
          {profile.location[lang]}
        </p>
      </div>

      {/* Thesis + identity — graph is the signature visual below, not a third card here. */}
      <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-14">
        <div className="hero-cinematic min-w-0">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,6.5vw,4.75rem)] font-bold leading-[0.96] tracking-tight text-foreground">
            {profile.tagline[lang]}
          </h1>

          <p className={cn("mt-6 max-w-[48ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}>
            {profile.bio[lang]}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#work" className={BUTTON.primary}>
              {lang === "en" ? "Explore work" : "Lihat karya"}
            </a>
            <a href="#contact" className={BUTTON.ghost}>
              {lang === "en" ? "Contact" : "Kontak"}
            </a>
          </div>
        </div>

        <div
          className="hero-cinematic relative mx-auto w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-1 sm:w-44 lg:mx-0 lg:w-full"
          style={{ animationDelay: "0.2s" }}
        >
          {/*
            Portrait assets often ship with warm/orange backdrops that fight
            Ink & Signal. Neutral frame + monochrome treatment keeps mass black
            and signal purple; swap to a re-exported B&W crop when available.
          */}
          <MediaFrame
            src={profile.portrait.src}
            alt={profile.portrait.alt[lang]}
            label="Portrait"
            aspectClassName="aspect-[4/5]"
            className="rounded-none border-0 object-cover grayscale contrast-[1.05] saturate-0"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-primary/5"
            aria-hidden
          />
        </div>
      </div>

      {/* Signature: agent signal mesh — full-width stage, minimal chrome. */}
      <div
        className="hero-cinematic relative mt-12 overflow-hidden rounded-2xl border border-border bg-surface-1 sm:mt-16"
        style={{ animationDelay: "0.35s" }}
      >
        <div className="aspect-[16/10] w-full md:aspect-[21/9]">
          <HeroGraph className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent"
          aria-hidden
        />
        <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground-faint sm:left-6">
          {lang === "en" ? "Signal mesh" : "Mesh sinyal"}
          <span className="text-primary/70"> · </span>
          {lang === "en" ? "reacts while the assistant works" : "bereaksi saat asisten bekerja"}
        </p>
      </div>
    </section>
  );
}
