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
 */
export function buildPageMetadata({
  lang,
  pathAfterLocale,
  title,
  description,
}: {
  lang: Locale;
  pathAfterLocale: string;
  title: string;
  description: string;
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
      type: suffix ? "article" : "website",
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
