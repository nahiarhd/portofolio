/**
 * Design tokens — declared once, never re-declared per component.
 *
 * When a component hardcodes `text-gray-500`, the next component picks a
 * slightly different grey, and six months later the app has eleven greys.
 * Import from here instead. Colour values live in `globals.css`; this file
 * names the *combinations* that repeat.
 */

/** Text hierarchy. Use these three; do not invent a fourth. */
export const TEXT = {
  /** Primary content. */
  base: "text-foreground",
  /** Secondary content: labels, descriptions. */
  subtle: "text-muted-foreground",
  /**
   * Tertiary: timestamps, hints, captions. Its own measured token rather than
   * an opacity on `subtle` — see the note in `globals.css`. All three levels
   * clear WCAG AA (4.5:1) for normal text in both colour schemes.
   */
  faint: "text-muted-foreground-faint",
} as const;

/**
 * Mono label. Only ever wraps real data — a date, a count, a pillar, a stack
 * entry. The moment it holds a decorative word ("EXPLORE", "01") it stops
 * encoding anything and becomes the template device it exists to avoid.
 */
export const EYEBROW = "font-mono text-eyebrow uppercase text-muted-foreground";

/** Shared surface treatments so panels look like one system. */
export const SURFACE = {
  panel: "rounded-lg border border-border bg-card",
  panelStrong: "rounded-lg border border-border bg-card shadow-sm",
  inset: "rounded-sm border border-border/60 bg-muted/30",
} as const;

/**
 * The page's horizontal rhythm. One definition, so the header, main content,
 * and footer cannot drift out of alignment with each other.
 */
export const CONTAINER = "mx-auto w-full max-w-5xl px-5 sm:px-8";
