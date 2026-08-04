import { profile } from "@/content/profile";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { GraphStill } from "./graph-still";

export function Hero({ lang }: { lang: Locale }) {
  return (
    <section className={`${CONTAINER} pb-16 pt-14 sm:pb-24 sm:pt-20`}>
      <p className={cn(EYEBROW, "mb-8")}>{profile.location[lang]}</p>

      <h1 className="max-w-[16ch] text-display font-semibold">{profile.name}</h1>

      <p className={cn("mt-8 max-w-[52ch] text-lead", TEXT.subtle)}>{profile.bio[lang]}</p>

      {/*
        The graph's final home. T13 replaces `GraphStill` with the R3F canvas at
        exactly these dimensions, so the swap costs no layout shift — and the
        still stays as the fallback for blocked WebGL and reduced motion.
        `aspect-ratio` rather than a fixed height: the SVG viewBox is 800×480,
        and a mismatched box would letterbox it.
      */}
      <div className="mt-14 aspect-[800/480] w-full text-foreground">
        <GraphStill className="h-full w-full" />
      </div>
    </section>
  );
}
