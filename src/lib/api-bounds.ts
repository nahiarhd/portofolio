/**
 * Every list/history limit in the app lives here.
 *
 * Unbounded queries are the failure this file exists to prevent: a chat replay
 * that loaded whole threads made latency and cost grow with thread length. If
 * you are about to write `findMany` without `take`, add the bound here first.
 */

/** Default page size for list endpoints. */
export const DEFAULT_LIST_LIMIT = 50;

/** Hard ceiling a caller may request. */
export const MAX_LIST_LIMIT = 200;

/** Clamp an untrusted integer into [min, max], falling back when unparseable. */
export function clampInt(
  value: unknown,
  options: { min: number; max: number; fallback: number }
): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return options.fallback;
  return Math.min(Math.max(Math.trunc(parsed), options.min), options.max);
}

/** Parse a `?limit=` query param into a bounded page size. */
export function parseLimitParam(raw: string | null): number {
  return clampInt(raw, { min: 1, max: MAX_LIST_LIMIT, fallback: DEFAULT_LIST_LIMIT });
}
