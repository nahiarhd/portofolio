import { profile } from "@/content/profile";
import { CONTAINER, EYEBROW, SURFACE, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";

export function Hero({ lang }: { lang: Locale }) {
  return (
    <section className={`${CONTAINER} pb-20 pt-28 sm:pb-28 sm:pt-36`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="hud-pulse inline-block size-1.5 rounded-full bg-primary" aria-hidden />
        <p className={EYEBROW}>{profile.location[lang]}</p>
        <p className={cn(EYEBROW, "text-primary/80")}>status · active</p>
      </div>

      <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:gap-12">
        <div className="hero-cinematic min-w-0">
          <h1 className="max-w-[12ch] font-display text-display font-semibold tracking-tight text-glow">
            {profile.name.split(" ").slice(0, 1).join(" ")}
            <span className="mt-1 block text-muted-foreground/90">
              {profile.name.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className={cn("mt-3 font-mono text-eyebrow uppercase", TEXT.faint)}>
            {profile.tagline[lang]}
          </p>
        </div>

        <div
          className={cn(
            SURFACE.panelStrong,
            "hero-cinematic relative overflow-hidden p-6 sm:p-7",
          )}
          style={{ animationDelay: "0.35s" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
            }}
            aria-hidden
          />
          <p className={EYEBROW}>{'// brief'}</p>
          <p className={cn("relative mt-4 text-lead", TEXT.subtle)}>{profile.bio[lang]}</p>
        </div>
      </div>

      <div className="hero-cinematic relative mt-14 aspect-[800/480] w-full overflow-hidden rounded-2xl border border-border glass">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3"
          aria-hidden
        >
          <span className={cn(EYEBROW, "text-primary/90")}>graph · live</span>
          <span className={EYEBROW}>400 nodes · r3f</span>
        </div>
        <div className="absolute inset-0 text-foreground">
          <HeroGraph className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
