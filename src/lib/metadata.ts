/**
 * Shared page metadata — titles, descriptions, hreflang, Open Graph, Twitter.
 * Built only from `src/content/`, so the content denylist covers metadata too.
 */

import type { Metadata } from "next";

import { profile } from "@/content/profile";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locale";
import { siteUrl } from "./site";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  id: "id_ID",
};

/**
 * @param pathAfterLocale - "" for home, "/work/slug" for a case study
 * @param ogType - Open Graph object type. Defaults to "website": that's
 *   correct for the home page and for index/listing pages like `/work`.
 *   Only a page that *is* one piece of content — a case study — should pass
 *   "article".
 */
export function buildPageMetadata({
  lang,
  pathAfterLocale,
  title,
  description,
  ogType = "website",
}: {
  lang: Locale;
  pathAfterLocale: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
}): Metadata {
  const suffix =
    pathAfterLocale === "" || pathAfterLocale === "/"
      ? ""
      : pathAfterLocale.startsWith("/")
        ? pathAfterLocale
        : `/${pathAfterLocale}`;

  const pathname = `/${lang}${suffix}`;
  const languages: Record<string, string> = { "x-default": `/${DEFAULT_LOCALE}${suffix}` };
  for (const locale of LOCALES) {
    languages[locale] = `/${locale}${suffix}`;
  }

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: {
      canonical: pathname,
      languages,
    },
    openGraph: {
      type: ogType,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((locale) => locale !== lang).map(
        (locale) => OG_LOCALE[locale],
      ),
      url: pathname,
      siteName: profile.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Layout default title template: case studies become "Title · Name". */
export const titleTemplate: Metadata["title"] = {
  default: profile.name,
  template: `%s · ${profile.name}`,
};
