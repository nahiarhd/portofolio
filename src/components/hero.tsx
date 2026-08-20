import Image from "next/image";

import { profile } from "@/content/profile";
import { BUTTON, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";
import { RedactLine } from "./redact-line";
import { MagneticPill } from "./ui/magnetic-pill";
import { ScrambleText } from "./ui/scramble-text";

/**
 * Paper chapter (Hero). Pure white archival ground with a dynamic technical
 * drawing graph and high-impact editorial typography.
 */
export function Hero({
  lang,
  copy,
}: {
  lang: Locale;
  copy: {
    titleLine1: string;
    titleLine2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    status: string;
  };
}) {
  const portraitSrc =
    resolvePublicMedia("/portrait-cutout") ??
    resolvePublicMedia(profile.portrait.src) ??
    resolvePublicMedia("/portrait");

  return (
    <section
      id="cover"
      data-anim="hero"
      className="chapter-paper relative flex min-h-[100dvh] flex-col justify-end overflow-clip"
      aria-label={profile.name}
    >
      {/* Technical drawing graph layer on archival white paper. */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60" aria-hidden>
        <HeroGraph className="h-full w-full" />
      </div>

      {/* Portrait sits behind the type on wide viewports and above it below lg */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] max-w-[34rem] lg:block"
        data-anim="hero-portrait"
      >
        <div className="relative h-full w-full overflow-clip">
          {portraitSrc ? (
            <Image
              src={portraitSrc}
              alt={profile.portrait.alt[lang]}
              fill
              priority
              sizes="46vw"
              className="object-cover object-top grayscale brightness-[1.35] contrast-[0.85]"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--background)_18%,color-mix(in_srgb,var(--background)_55%,transparent)_58%,transparent_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_6%,transparent_52%)]"
            aria-hidden
          />
        </div>
      </div>

      <div
        data-anim="hero-body"
        className="relative z-10 mx-auto w-full max-w-[77.5rem] px-5 pb-10 pt-28 sm:px-8 sm:pb-16"
      >
        {/* Technical Eyebrow Metadata Badge */}
        <div className="mb-6 flex flex-wrap items-center gap-3" data-anim="hero-copy">
          <span className="chapter-stamp chapter-stamp--classified !text-[0.6rem] tracking-widest cursor-pointer">
            <ScrambleText
              text={lang === "id" ? "DOSIR 2026 · TERDEKLASIFIKASI" : "2026 DOSSIER · DECLASSIFIED"}
            />
          </span>
          <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {profile.tagline[lang]}
          </span>
        </div>

        {/* Portrait for narrow viewports */}
        <div className="mb-8 w-40 border border-border-strong p-1.5 sm:w-48 lg:hidden">
          <div className="relative aspect-[4/5] w-full overflow-clip bg-surface-3">
            {portraitSrc ? (
              <Image
                src={portraitSrc}
                alt=""
                fill
                priority
                sizes="12rem"
                className="object-cover object-top grayscale"
              />
            ) : null}
          </div>
        </div>

        {/* High-Impact Headline */}
        <h1 className="font-display text-display font-medium text-foreground tracking-tight">
          <RedactLine className="block">{copy.titleLine1}</RedactLine>
          <RedactLine className="mt-1.5 block pb-2 text-primary font-bold">
            {copy.titleLine2}
          </RedactLine>
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            data-anim="hero-copy"
            className={cn("max-w-[44ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}
          >
            {copy.body}
          </p>

          <div data-anim="hero-copy" className="flex flex-wrap items-center gap-3">
            <MagneticPill strength={0.3}>
              <a href="#work" className={cn(BUTTON.primary, "group shadow-[0_0_24px_rgba(184,131,236,0.3)] hover:shadow-[0_0_32px_rgba(184,131,236,0.5)]")}>
                <span>{copy.ctaPrimary}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
                  &#8594;
                </span>
              </a>
            </MagneticPill>
            <MagneticPill strength={0.2}>
              <a href="#contact" className={BUTTON.secondary}>
                {copy.ctaSecondary}
              </a>
            </MagneticPill>
          </div>
        </div>

        {/* Technical Dossier Telemetry Footer Bar */}
        <div
          data-anim="hero-copy"
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse" aria-hidden />
            <span className="font-bold text-foreground">{copy.status}</span>
          </div>
          <div className="hidden items-center gap-5 text-muted-foreground-faint sm:flex">
            <span>CORE: ON-PREM AGENT LOOPS</span>
            <span>•</span>
            <span>AIR-GAPPED COMPLIANT</span>
            <span>•</span>
            <span>06 CASE STUDIES</span>
          </div>
          <a href="#work" className="transition-colors hover:text-primary">
            [EXPLORE WORK &#8595;]
          </a>
        </div>
      </div>

      {/* Sentinel where the paper chapter ends */}
      <span
        data-hero-chapter-end
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        aria-hidden
      />
    </section>
  );
}
