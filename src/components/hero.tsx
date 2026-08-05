import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";

/**
 * Cinematic first frame: one full viewport, complete on open.
 * Three.js lives on #shelf (next stage) — no empty graph pill here.
 * Atmospheric depth only (gradients + grain from layout), not a second WebGL.
 */
export function Hero({ lang }: { lang: Locale }) {
  const portraitSrc = resolvePublicMedia(profile.portrait.src);
  const isPhoto = Boolean(portraitSrc && !portraitSrc.endsWith(".svg"));

  return (
    <section
      id="cinematic"
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden"
    >
      {/* Edge bleed atmosphere — cinematic, still Ink & Signal purple only. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(124, 58, 237, 0.16), transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 80%, rgba(192, 132, 252, 0.08), transparent 50%),
            linear-gradient(180deg, transparent 70%, var(--background) 100%)
          `,
        }}
      />

      <div
        className={`${CONTAINER} relative z-10 flex flex-1 flex-col justify-center py-28 sm:py-32`}
      >
        <div className="hero-cinematic flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-primary">
            {profile.name}
          </p>
          <p
            className={cn(
              "font-mono text-[0.7rem] uppercase tracking-[0.28em]",
              TEXT.faint,
            )}
          >
            {profile.location[lang]}
          </p>
        </div>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <div className="hero-cinematic min-w-0">
            <h1 className="max-w-[14ch] font-display text-[clamp(2.75rem,7.5vw,5.75rem)] font-bold leading-[0.92] tracking-[-0.04em] text-foreground">
              {profile.tagline[lang]}
            </h1>

            <p
              className={cn(
                "mt-7 max-w-[42ch] text-base leading-relaxed sm:text-lead",
                TEXT.subtle,
              )}
            >
              {profile.bio[lang]}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="#shelf" className={BUTTON.primary}>
                {lang === "en" ? "Enter the shelf" : "Masuk ke rak"}
              </a>
              <a href="#work" className={BUTTON.ghost}>
                {lang === "en" ? "Work as a list" : "Karya sebagai daftar"}
              </a>
            </div>
          </div>

          <div
            className="hero-cinematic relative mx-auto w-44 shrink-0 sm:w-52 lg:mx-0 lg:w-full lg:max-w-[18rem] lg:justify-self-end"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface-1 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <MediaFrame
                src={portraitSrc}
                alt={profile.portrait.alt[lang]}
                label="Portrait"
                slot={mediaDropHint(profile.portrait.src)}
                aspectClassName="aspect-[4/5]"
                priority
                sizes="(max-width: 1024px) 208px, 288px"
                className={cn(
                  "rounded-none border-0",
                  !isPhoto && "grayscale contrast-[1.05] saturate-0",
                )}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-primary/5"
                aria-hidden
              />
            </div>
            <p className={cn("mt-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] lg:text-right", TEXT.faint)}>
              {lang === "en" ? "AI · systems · Bekasi" : "AI · sistem · Bekasi"}
            </p>
          </div>
        </div>

        {/* Scroll cue into the Three.js stage — not a second canvas. */}
        <div className="hero-cinematic mt-16 flex items-center gap-3 sm:mt-20">
          <span className="h-px w-10 bg-primary/50" aria-hidden />
          <a
            href="#shelf"
            className={cn(
              "font-mono text-[0.65rem] uppercase tracking-[0.22em] transition-colors hover:text-primary",
              TEXT.faint,
            )}
          >
            {lang === "en" ? "Scroll into the library" : "Gulir ke perpustakaan"}
          </a>
        </div>
      </div>
    </section>
  );
}
