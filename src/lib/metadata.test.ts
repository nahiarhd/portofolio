import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

import { LOCALES } from "./locale";
import { buildPageMetadata } from "./metadata";
import { siteUrl } from "./site";

/** Same denylist as content tests — metadata is published surface too. */
const FORBIDDEN_HASHES = new Set([
  "ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b",
  "2ce6ab9fc84f9e761269d907b91c5df9a35c297cec8e36391c12b621cdbf1532",
  "563f77ba16279d08ca5e70eb14f470de6c72b0eeb697447dc53f84bc3bb9e934",
  "1ddcf9d6eb81598bcfa50718e13a7bea01ba9cfdd8d47635c164c8edcc0a6b61",
  "1aef5ea8211ecde355d626694c368130b5bc3c4422c0a877b6012a91c499ff5c",
]);

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function containsForbidden(text: string): boolean {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .some((token) => FORBIDDEN_HASHES.has(sha256(token)));
}

describe("buildPageMetadata", () => {
  it("sets hreflang for every locale plus x-default", () => {
    const meta = buildPageMetadata({
      lang: "en",
      pathAfterLocale: "",
      title: profile.name,
      description: profile.tagline.en,
    });
    const languages = meta.alternates?.languages;
    expect(languages).toBeDefined();
    for (const locale of LOCALES) {
      expect(languages?.[locale]).toBe(`/${locale}`);
    }
    expect(languages?.["x-default"]).toBe("/en");
    expect(meta.alternates?.canonical).toBe("/en");
  });

  it("keeps case-study paths under both locales", () => {
    const meta = buildPageMetadata({
      lang: "id",
      pathAfterLocale: "/work/agent-orchestration",
      title: "t",
      description: "d",
    });
    expect(meta.alternates?.canonical).toBe("/id/work/agent-orchestration");
    expect(meta.alternates?.languages?.en).toBe("/en/work/agent-orchestration");
  });

  it("labels the home page, the /work index, and a case study correctly", () => {
    // openGraph.type used to be derived from whether pathAfterLocale had a
    // suffix, which mislabeled /work — an index, not one piece of content —
    // as "article". Home and listing pages default to "website"; only a
    // case study opts into "article".
    //
    // `openGraph` is typed as a union of OG object shapes with no shared
    // `type` field, so reading it back needs a narrowing cast.
    const ogType = (og: ReturnType<typeof buildPageMetadata>["openGraph"]) =>
      (og as { type?: string } | null | undefined)?.type;

    const home = buildPageMetadata({
      lang: "en",
      pathAfterLocale: "",
      title: "t",
      description: "d",
    });
    expect(ogType(home.openGraph)).toBe("website");

    const listing = buildPageMetadata({
      lang: "en",
      pathAfterLocale: "/work",
      title: "t",
      description: "d",
    });
    expect(ogType(listing.openGraph)).toBe("website");

    const caseStudy = buildPageMetadata({
      lang: "en",
      pathAfterLocale: "/work/agent-orchestration",
      title: "t",
      description: "d",
      ogType: "article",
    });
    expect(ogType(caseStudy.openGraph)).toBe("article");
  });

  it("never puts a forbidden term in home or case-study metadata", () => {
    for (const lang of LOCALES) {
      const home = buildPageMetadata({
        lang,
        pathAfterLocale: "",
        title: profile.name,
        description: profile.tagline[lang],
      });
      for (const text of collectStrings(home)) {
        expect(containsForbidden(text), text).toBe(false);
      }

      for (const project of projects) {
        const page = buildPageMetadata({
          lang,
          pathAfterLocale: `/work/${project.slug}`,
          title: project.title[lang],
          description: project.summary[lang],
        });
        for (const text of collectStrings(page)) {
          expect(containsForbidden(text), text).toBe(false);
        }
      }
    }
  });
});

describe("siteUrl", () => {
  it("returns an absolute http(s) origin", () => {
    expect(siteUrl()).toMatch(/^https?:\/\//);
  });
});
