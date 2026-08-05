/**
 * Design tokens — class combinations that repeat.
 * Colour values live in `globals.css` (Ink & Signal).
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
  /** Flat surface: elevation from luminance, not glass (prefer for long lists). */
  flat: "rounded-2xl border border-border bg-surface-1",
  inset: "rounded-xl border border-border/80 bg-white/5",
  pill: "nav-pill",
} as const;

export const BUTTON = {
  primary:
    "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-[transform,filter] duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  secondary:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface-1 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 hover:border-primary/45 hover:bg-surface-2 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  ghost:
    "inline-flex min-h-11 items-center justify-center rounded-full px-2 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors duration-200 hover:text-primary active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
} as const;

export const CONTAINER = "relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8";

/** Shared section vertical rhythm — cinematic breathing room between stages. */
export const SECTION =
  "scroll-mt-28 border-t border-border/40 py-24 sm:py-32 lg:py-36";
