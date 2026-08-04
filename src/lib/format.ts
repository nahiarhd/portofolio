import type { Locale } from "./locale";

/**
 * Render an ISO month ("2024-08") in the reader's language.
 *
 * `Intl` rather than a month-name table in the dictionaries: twelve names per
 * locale is content that would have to be translated, reviewed, and kept in
 * parity forever, when the platform already knows them. UTC is pinned so the
 * month cannot slip a boundary depending on where the page is rendered.
 */
export function formatMonth(isoMonth: string, locale: Locale): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** "Aug 2023 — Dec 2023", or "Aug 2024 — Present" while a role is current. */
export function formatRange(
  start: string,
  end: string | undefined,
  locale: Locale,
  presentLabel: string,
): string {
  return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : presentLabel}`;
}
