import { GraphStill } from "@/components/graph-still";
import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";

/**
 * Editorial hero for One Object Portfolio.
 * Immersive 3D lives on #shelf only.
 *
 * Signal strip uses GraphStill (SVG), not R3F Canvas: three@0.185 deprecates
 * THREE.Clock for THREE.Timer, but @react-three/fiber@9.7.0 still constructs
 * Clock on every Canvas mount (upstream: pmndrs/react-three-fiber#3741).
 * Sources: three Clock.js @deprecated r183; threejs.org docs Timer.
 */
export function Hero({ lang }: { lang: Locale }) {
  const portraitSrc = resolvePublicMedia(profile.portrait.src);
  const isPhoto = Boolean(portraitSrc && !portraitSrc.endsWith(".svg"));

  return (
    <section className={`${CONTAINER} relative pb-14 pt-24 sm:pb-20 sm:pt-32`}>
      <div className="hero-cinematic flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-primary">
          {profile.name}
        </p>
        <p className={cn("font-mono text-eyebrow uppercase tracking-[0.16em]", TEXT.faint)}>
          {profile.location[lang]}
        </p>
      </div>

      <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_12.5rem] lg:gap-14">
        <div className="hero-cinematic min-w-0">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,6.5vw,4.75rem)] font-bold leading-[0.96] tracking-tight text-foreground">
            {profile.tagline[lang]}
          </h1>

          <p className={cn("mt-6 max-w-[48ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}>
            {profile.bio[lang]}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#shelf" className={BUTTON.primary}>
              {lang === "en" ? "Enter the shelf" : "Masuk ke rak"}
            </a>
            <a href="#work" className={BUTTON.ghost}>
              {lang === "en" ? "Work as a list" : "Karya sebagai daftar"}
            </a>
          </div>
        </div>

        <div
          className="hero-cinematic relative mx-auto w-36 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-1 sm:w-40 lg:mx-0 lg:w-full"
          style={{ animationDelay: "0.2s" }}
        >
          <MediaFrame
            src={portraitSrc}
            alt={profile.portrait.alt[lang]}
            label="Portrait"
            slot={mediaDropHint(profile.portrait.src)}
            aspectClassName="aspect-[4/5]"
            priority
            sizes="200px"
            className={cn(
              "rounded-none border-0",
              !isPhoto && "grayscale contrast-[1.05] saturate-0",
            )}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-primary/5"
            aria-hidden
          />
        </div>
      </div>

      {/* Static signal mark — not a live R3F canvas (avoids Clock deprecation noise). */}
      <div
        className="hero-cinematic relative mt-10 overflow-hidden rounded-xl border border-border bg-surface-1 text-foreground"
        style={{ animationDelay: "0.3s" }}
        aria-hidden
      >
        <div className="h-16 w-full opacity-70 sm:h-20">
          <GraphStill className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
