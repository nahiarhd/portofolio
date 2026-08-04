import { profile } from "@/content/profile";
import { CONTAINER, EYEBROW, SURFACE, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";

export function Hero({ lang }: { lang: Locale }) {
  return (
    <section className={`${CONTAINER} pb-20 pt-28 sm:pb-28 sm:pt-36`}>
      <p className={cn(EYEBROW, "hero-cinematic")}>{profile.location[lang]}</p>

      <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:gap-12">
        <div className="hero-cinematic min-w-0">
          <h1 className="max-w-[12ch] font-display text-display font-semibold tracking-tight text-glow">
            {profile.name.split(" ").slice(0, 1).join(" ")}
            <span className="mt-1 block text-muted-foreground/90">
              {profile.name.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className={cn("mt-4 text-lead", TEXT.subtle)}>{profile.tagline[lang]}</p>
        </div>

        <div
          className={cn(SURFACE.panelStrong, "hero-cinematic p-6 sm:p-7")}
          style={{ animationDelay: "0.35s" }}
        >
          <p className={cn("text-lead", TEXT.subtle)}>{profile.bio[lang]}</p>
        </div>
      </div>

      <div className="hero-cinematic relative mt-14 aspect-[800/480] w-full overflow-hidden rounded-2xl border border-border glass">
        <div className="absolute inset-0 text-foreground">
          <HeroGraph className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
