/**
 * The site's locales, declared once. Content types, the dictionary loader, and
 * the proxy all import from here, so a third locale is a one-line change and
 * the compiler rejects content missing a translation.
 */
export const LOCALES = ["en", "id"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Text that must exist in every locale. Missing one is a type error. */
export type Localized = Record<Locale, string>;

/**
 * Rewrite a pathname to another locale, keeping the reader where they are.
 *
 * `/en/work/agents` → `/id/work/agents`. A language switch that dumps everyone
 * on the home page is the most common i18n bug and the most annoying one.
 */
export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.length && isLocale(segments[0]) ? segments.slice(1) : segments;
  return `/${[locale, ...rest].join("/")}`;
}

/**
 * Pick the best locale from an `Accept-Language` header.
 *
 * Written by hand rather than pulling in `negotiator` +
 * `@formatjs/intl-localematcher`: two dependencies to rank two locales is a bad
 * trade, and this runs on every cold request.
 */
export function resolveLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.tag && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    // Match "id" from "id-ID", so regional variants resolve to their language.
    const primary = tag.split("-")[0];
    const match = LOCALES.find((locale) => locale === tag || locale === primary);
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}
