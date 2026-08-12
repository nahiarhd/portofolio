/**
 * Design tokens — editorial ink/paper language.
 * Colour values live in `globals.css`.
 *
 * Shape rule, applied everywhere: plates and cards are square, interactive
 * controls are pills. Mixing the two is what makes a page look assembled
 * rather than designed.
 */

export const TEXT = {
  base: "text-foreground",
  subtle: "text-muted-foreground",
  faint: "text-muted-foreground-faint",
} as const;

export const EYEBROW =
  "font-mono text-eyebrow uppercase tracking-[0.16em] text-muted-foreground-faint";

export const SURFACE = {
  /** Raised paper plate — hairline shadow. */
  panel: "panel",
  /** Plate that lifts off the page (overlays, sticky dossiers, chat). */
  panelStrong: "panel-strong",
  /** Flat block with the same hairline language as `.panel`. */
  flat: "border border-border bg-surface-1 shadow-[var(--shadow-hairline)]",
  /** Recessed well — inset shadow, opposite of a plate. */
  inset: "surface-inset",
  pill: "nav-pill",
} as const;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const BUTTON = {
  /** Ink pill — the one primary action per view. */
  primary: `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-cta px-6 py-2.5 text-sm font-medium tracking-tight text-cta-foreground transition-[transform,opacity] duration-150 [transition-timing-function:var(--ease-out-quart)] hover:opacity-90 active:scale-[0.98] ${FOCUS}`,
  /** Outlined pill. */
  secondary: `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-border-strong px-6 py-2.5 text-sm font-medium tracking-tight text-foreground transition-[color,border-color,transform] duration-150 [transition-timing-function:var(--ease-out-quart)] hover:border-primary hover:text-primary active:scale-[0.98] ${FOCUS}`,
  /** Text action. */
  ghost: `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-2 py-2.5 text-sm font-medium text-primary transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-out-quart)] hover:opacity-70 active:scale-[0.98] ${FOCUS}`,
} as const;

export const CONTAINER = "relative z-10 mx-auto w-full max-w-[77.5rem] px-5 sm:px-8";

export const SECTION = "scroll-mt-24 border-t border-border py-20 sm:py-24 lg:py-28";
