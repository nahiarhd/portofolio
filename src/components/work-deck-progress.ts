/**
 * Map a pinned-deck scrub (0-1) onto a slide index.
 *
 * Clicking a tab uses the inverse so the two stay on the same slide.
 * Equal bands: [0, 1/n) → 0, …, last index clamped at 1.
 */
export function deckIndexFromProgress(progress: number, total: number): number {
  if (total <= 1) return 0;
  if (progress <= 0) return 0;
  if (progress >= 1) return total - 1;
  return Math.min(total - 1, Math.floor(progress * total));
}

/** Scroll position inside a pin that lands on `index`. */
export function progressFromDeckIndex(index: number, total: number): number {
  if (total <= 1) return 0;
  const clamped = Math.min(total - 1, Math.max(0, index));
  return clamped / (total - 1);
}

export function padDeckIndex(value: number): string {
  return String(value).padStart(2, "0");
}
