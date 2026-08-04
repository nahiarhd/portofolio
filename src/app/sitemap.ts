import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locale";
import { siteUrl } from "@/lib/site";

/**
 * Every public locale path: home + case studies, with hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  const now = new Date();

  const paths = [
    "",
    ...projects.map((project) => `/work/${project.slug}`),
  ];

  return paths.flatMap((path) =>
    LOCALES.map((lang) => {
      const languages: Record<string, string> = {
        "x-default": `${origin}/${DEFAULT_LOCALE}${path}`,
      };
      for (const locale of LOCALES) {
        languages[locale] = `${origin}/${locale}${path}`;
      }

      return {
        url: `${origin}/${lang}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
        priority: path === "" ? 1 : 0.7,
        alternates: { languages },
      };
    }),
  );
}
