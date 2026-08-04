import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/locale";

import { certifications, education, experience, profile } from "./profile";
import { projects } from "./projects";

/**
 * Forbidden terms are stored as SHA-256 hashes, not plaintext.
 *
 * The point of this test is that a current employer's product and internal
 * module names never appear in this repository. A test file listing those names
 * in the clear would be the leak it exists to prevent. Hashes let the check run
 * in public CI without publishing what is being checked for.
 *
 * To add a term:  node -e 'console.log(require("node:crypto").createHash("sha256").update("term").digest("hex"))'
 */
const FORBIDDEN_HASHES = new Set([
  "ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b",
  "2ce6ab9fc84f9e761269d907b91c5df9a35c297cec8e36391c12b621cdbf1532",
  "563f77ba16279d08ca5e70eb14f470de6c72b0eeb697447dc53f84bc3bb9e934",
  "1ddcf9d6eb81598bcfa50718e13a7bea01ba9cfdd8d47635c164c8edcc0a6b61",
  "1aef5ea8211ecde355d626694c368130b5bc3c4422c0a877b6012a91c499ff5c",
]);

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

/** True when any word in `text` hashes to a forbidden term. */
function containsForbidden(text: string, hashes: ReadonlySet<string>): boolean {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .some((token) => hashes.has(sha256(token)));
}

/** Every string reachable from a content value, with a path for the failure message. */
function collectStrings(value: unknown, path = ""): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectStrings(item, `${path}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      collectStrings(child, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

const allContent = [
  ...collectStrings(projects, "projects"),
  ...collectStrings(profile, "profile"),
  ...collectStrings(experience, "experience"),
  ...collectStrings(education, "education"),
  ...collectStrings(certifications, "certifications"),
];

describe("confidentiality", () => {
  // A guard that cannot fail protects nothing. This proves the detector works
  // before trusting the assertion below it.
  it("detects a forbidden term, including inside punctuation and casing", () => {
    const control = new Set([sha256("banana")]);

    expect(containsForbidden("we shipped Banana, then left", control)).toBe(true);
    expect(containsForbidden("BANANA-flavoured", control)).toBe(true);
    expect(containsForbidden("bananas are different tokens", control)).toBe(false);
    expect(containsForbidden("nothing to see here", control)).toBe(false);
  });

  it("scans a non-trivial amount of content", () => {
    // Guards against a refactor that silently empties `allContent`.
    expect(allContent.length).toBeGreaterThan(50);
  });

  it("contains no forbidden term in any content string", () => {
    const offenders = allContent.filter(({ text }) =>
      containsForbidden(text, FORBIDDEN_HASHES),
    );

    // Report the path only. Echoing the offending text would print the term.
    expect(offenders.map((o) => o.path)).toEqual([]);
  });
});

describe("projects", () => {
  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toEqual([...new Set(slugs)]);
  });

  it("uses url-safe slugs", () => {
    for (const { slug } of projects) {
      expect(slug, slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("has non-empty text in every locale", () => {
    for (const project of projects) {
      for (const field of ["title", "summary", "problem", "role", "outcome"] as const) {
        for (const locale of LOCALES) {
          expect(project[field][locale]?.trim(), `${project.slug}.${field}.${locale}`)
            .toBeTruthy();
        }
      }
    }
  });

  it("has no DRAFT placeholders left in published content", () => {
    const offenders = allContent
      .filter(({ text }) => /\bDRAFT\b/i.test(text))
      .map((o) => o.path);
    expect(offenders).toEqual([]);
  });

  it("gives confidential work no links", () => {
    for (const project of projects) {
      if (!project.confidential) continue;
      expect(project.links, `${project.slug} is confidential`).toBeUndefined();
    }
  });

  it("declares a stack for every project", () => {
    for (const project of projects) {
      expect(project.stack.length, project.slug).toBeGreaterThan(0);
    }
  });

  it("orders `started` as an ISO month", () => {
    for (const project of projects) {
      expect(project.started, project.slug).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    }
  });
});

describe("profile", () => {
  it("has non-empty text in every locale", () => {
    for (const locale of LOCALES) {
      expect(profile.tagline[locale].trim()).toBeTruthy();
      expect(profile.bio[locale].trim()).toBeTruthy();
      expect(profile.location[locale].trim()).toBeTruthy();
    }
  });

  it("localizes every experience role and highlight", () => {
    for (const entry of experience) {
      for (const locale of LOCALES) {
        expect(entry.role[locale].trim(), entry.organization).toBeTruthy();
        for (const highlight of entry.highlights) {
          expect(highlight[locale]?.trim(), entry.organization).toBeTruthy();
        }
      }
    }
  });

  it("uses ISO months, and never ends before it starts", () => {
    for (const entry of [...experience, ...education]) {
      expect(entry.start).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      if (!entry.end) continue;
      expect(entry.end).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(entry.end >= entry.start).toBe(true);
    }
  });
});
