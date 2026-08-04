/**
 * Design tokens — class combinations that repeat.
 * Colour values live in `globals.css` (Velos-adapted dark system).
 */

export const TEXT = {
  base: "text-foreground",
  subtle: "text-muted-foreground",
  faint: "text-muted-foreground-faint",
} as const;

/** Mono label for real data only — dates, counts, pillars, stack. */
export const EYEBROW =
  "font-mono text-eyebrow uppercase tracking-[0.16em] text-muted-foreground";

export const SURFACE = {
  panel: "glass rounded-2xl",
  panelStrong: "glass-strong rounded-2xl",
  inset: "rounded-xl border border-border/80 bg-white/5",
  pill: "nav-pill",
} as const;

export const CONTAINER = "relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8";
