import Image from "next/image";

import { profile } from "@/content/profile";
import { BUTTON, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";
import { RedactLine } from "./redact-line";

/**
 * Paper chapter. The page's one theme switch, and the only place the portrait
 * appears, so the drop into ink at the next section reads as a cut.
 *
 * Headline spans the full container rather than a column, which is what buys
 * the display size. The portrait is inset on the right and the type overlaps
 * it at the baseline; the crop keeps the face clear of the overlap.
 *
 * Server component. GSAP wipes the headline in from `scroll-choreography`;
 * with no JS the copy is simply there.
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
      {/* The live graph is the persistent world canvas behind the whole page
       * (world.tsx, mounted from the layout) — the paper chapter is
       * translucent so it composites through. This layer only hosts the
       * static SVG still for the no-WebGL / reduced-motion fallback, at the
       * strength the live canvas used to carry, so the fallback reads the
       * same. */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60" aria-hidden>
        <HeroGraph className="h-full w-full" />
      </div>

      {/* Portrait sits behind the type on wide viewports and above it below lg,
       * so the headline never lands on the face. */}
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
              /* Raised well above mid-grey — the inverse of what the ink hero
               * needed. The headline crosses the shirt and jacket as dark type
               * now, so the portrait has to stay in the light half of the
               * range for the outline stroke to read over it. */
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
        className="relative z-10 mx-auto w-full max-w-[77.5rem] px-5 pb-14 pt-28 sm:px-8 sm:pb-20"
      >
        {/* Portrait for narrow viewports, where the overlap composition fails. */}
        <div className="mb-10 w-40 border border-border-strong p-1.5 sm:w-48 lg:hidden">
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

        <h1 className="font-display text-display font-medium text-foreground">
          <RedactLine className="block">{copy.titleLine1}</RedactLine>
          <RedactLine className="text-outline mt-1 block pb-2">
            {copy.titleLine2}
          </RedactLine>
        </h1>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            data-anim="hero-copy"
            className={cn("max-w-[42ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}
          >
            {copy.body}
          </p>

          <div data-anim="hero-copy" className="flex flex-wrap items-center gap-3">
            <a href="#work" className={BUTTON.primary}>
              {copy.ctaPrimary}
            </a>
            <a href="#contact" className={BUTTON.secondary}>
              {copy.ctaSecondary}
            </a>
          </div>
        </div>

        <p
          data-anim="hero-copy"
          className="mt-10 flex items-center gap-2.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary"
        >
          {/* Real availability state, not decoration. */}
          <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden />
          {copy.status}
        </p>
      </div>

      {/* Marks where the paper chapter ends, for the header's token flip. */}
      <span
        data-hero-chapter-end
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        aria-hidden
      />
    </section>
  );
}
