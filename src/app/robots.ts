import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * Allow the public site; keep `/api/` out of the crawl budget (chat is not a page).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
