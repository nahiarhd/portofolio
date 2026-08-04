/**
 * The site's locales, declared once. Content types and the dictionary loader
 * both import from here so a third locale is a one-line change, and so the
 * compiler rejects content that is missing a translation.
 */
export const LOCALES = ["en", "id"] as const;

export type Locale = (typeof LOCALES)[number];

/** Text that must exist in every locale. Missing one is a type error. */
export type Localized = Record<Locale, string>;
