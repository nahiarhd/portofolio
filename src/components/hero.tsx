import { profile } from "@/content/profile";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { HeroGraph } from "./graph/hero-graph";

export function Hero({ lang }: { lang: Locale }) {
  return (
    <section className={`${CONTAINER} pb-16 pt-14 sm:pb-24 sm:pt-20`}>
      <p className={cn(EYEBROW, "mb-8")}>{profile.location[lang]}</p>

      <h1 className="max-w-[16ch] text-display font-semibold">{profile.name}</h1>

      <p className={cn("mt-8 max-w-[52ch] text-lead", TEXT.subtle)}>{profile.bio[lang]}</p>

      {/*
        Exact final dimensions for the graph. Still and canvas share this box —
        no layout shift when the live scene mounts or when WebGL is blocked.
        `aspect-ratio` matches the SVG viewBox (800×480). The R3F canvas is
        dynamically imported with ssr:false inside HeroGraph (client island);
        Next 16 forbids that option on Server Components.
      */}
      <div className="mt-14 aspect-[800/480] w-full text-foreground">
        <HeroGraph className="h-full w-full" />
      </div>
    </section>
  );
}
