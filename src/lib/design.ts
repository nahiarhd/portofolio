/**
 * Design tokens — declared once, never re-declared per component.
 *
 * When a component hardcodes `text-gray-500`, the next component picks a
 * slightly different grey, and six months later the app has eleven greys. Import
 * from here instead.
 */

/** Text hierarchy. Use these three; do not invent a fourth. */
export const TEXT = {
  /** Primary content. */
  base: "text-foreground",
  /** Secondary content: labels, descriptions. */
  subtle: "text-muted-foreground",
  /** Tertiary: timestamps, hints, disabled captions. */
  faint: "text-muted-foreground/70",
} as const;

/** Shared surface treatments so panels look like one system. */
export const SURFACE = {
  panel: "rounded-xl border border-border bg-card",
  panelStrong: "rounded-xl border border-border bg-card shadow-sm",
  inset: "rounded-lg border border-border/60 bg-muted/30",
} as const;
