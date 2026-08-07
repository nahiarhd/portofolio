import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/locale";

import {
  GITHUB_URL,
  HUGGINGFACE_URL,
  certifications,
  education,
  experience,
  profile,
  publications,
  publishedModels,
} from "./profile";
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
 *
 * IMPORTANT — how terms are matched. `containsForbidden` splits text on every
 * non-alphanumeric character and hashes each token separately, so **only single
 * tokens can ever match**. A hash of a domain or a run-together name will not
 * catch the same name written with spaces. When adding an organisation, add
 * every distinctive token it can be spelled with, not just its canonical form.
 * That gap is what let a protected employer name sit in `profile.ts` while its
 * domain form was already on this list.
 *
 * Three tiers, per docs/spec-repositioning.md § Confidentiality Policy Change:
 * employer names are ALLOWED, client names are FORBIDDEN, product and module
 * names are FORBIDDEN. This list holds tiers 2 and 3 only. Adding an employer
 * token here would be a regression, not a tightening.
 */
const FORBIDDEN_HASHES = new Set([
  "ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b",
  "2ce6ab9fc84f9e761269d907b91c5df9a35c297cec8e36391c12b621cdbf1532",
  "563f77ba16279d08ca5e70eb14f470de6c72b0eeb697447dc53f84bc3bb9e934",
  "1ddcf9d6eb81598bcfa50718e13a7bea01ba9cfdd8d47635c164c8edcc0a6b61",
  "1aef5ea8211ecde355d626694c368130b5bc3c4422c0a877b6012a91c499ff5c",
  "2eb8b8eca57b9361b698897b165f8ea3bc19288b8f54bbcd5bf40ad5b2f339f2",
  "b6e1557a1ed3900d7be8e28bb5f137d91812f31e59a90ceddac0276bc532d18e",
  "a5565adcb845bebf12b6cc83e868f875d6b3fc12757220d818c288d77465f066",
  "9ba6e703507e96918784e6d48182356636fe331e310104e59c10ba4319f634a1",
  "45e285133b891bc3bc022fdd5eda0726b15b609396e5b8e734078ab9f5ccdd6b",
  "b1ebbb22e5b223e129c82202dca80429970cbd0d181dcec88254e36f111943df",
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
  ...collectStrings(publications, "publications"),
  ...collectStrings(publishedModels, "publishedModels"),
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

  it("no longer guards the employer", () => {
    // Tier 1 is allowed as of docs/spec-repositioning.md § Confidentiality
    // Policy Change. Safe to write in the clear: it is publishable now.
    expect(containsForbidden("ads", FORBIDDEN_HASHES)).toBe(false);
  });

  it("holds every tier-2 and tier-3 term", () => {
    // The client spellings are deliberately NOT written here in the clear.
    // A test file listing them would be exactly the leak this list exists to
    // prevent — the same reason the terms are stored as hashes at all.
    //
    // Six product/module terms (unchanged) + five client spellings = 11.
    // Change this number only when adding or removing a term on purpose.
    expect(FORBIDDEN_HASHES.size).toBe(11);
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

  it("has exactly one current role", () => {
    const current = experience.filter((entry) => !entry.end);
    expect(current.length, "exactly one role should be open-ended").toBe(1);
  });

  it("accounts for every month a case study claims work", () => {
    // The failure this guards: `experience` ended Dec 2024 while the work
    // index showed case studies dated Jan–Apr 2025, so the page claimed six
    // projects from a period that listed no employment.
    //
    // Deliberately NOT a "no gaps anywhere" check. Feb 2024 – Jul 2024 is a
    // real gap (finishing the degree, which `education` covers), and roles
    // legitimately overlap — the mentorship ran alongside the ARMS start.
    const covered = (month: string) =>
      experience.some(
        (entry) => entry.start <= month && (entry.end ?? "9999-99") >= month,
      );

    for (const project of projects) {
      expect(
        covered(project.started),
        `${project.slug} (${project.started}) falls inside no role`,
      ).toBe(true);
    }
  });
});

describe("evidence", () => {
  it("gives every publication a resolvable DOI and an honest author position", () => {
    expect(publications.length).toBeGreaterThan(0);
    for (const paper of publications) {
      expect(paper.doi, paper.title).toMatch(/^https:\/\/doi\.org\/10\./);
      expect(paper.authorPosition, paper.title).toBeGreaterThan(0);
      expect(paper.authorPosition, paper.title).toBeLessThanOrEqual(paper.authorCount);
    }
  });

  it("namespaces every published model under the real account", () => {
    expect(publishedModels.length).toBeGreaterThan(0);
    for (const model of publishedModels) {
      expect(model.id, model.id).toMatch(/^nahiar\/[\w.-]+$/);
    }
  });

  it("points the profile links at https", () => {
    for (const url of [HUGGINGFACE_URL, GITHUB_URL]) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("keeps every certification's optional fields well-formed", () => {
    // `issued` stays optional: an unknown date is omitted, never invented.
    // What this guards is that whatever IS present is internally consistent —
    // a verify link with no credential id behind it is the real failure mode.
    for (const cert of certifications) {
      expect(cert.issuer.trim(), cert.name).toBeTruthy();
      if (cert.issued) {
        expect(cert.issued, cert.name).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      }
      if (cert.verifyUrl) {
        expect(cert.verifyUrl, cert.name).toMatch(/^https:\/\//);
        expect(cert.credentialId?.trim(), `${cert.name} links without an id`).toBeTruthy();
        expect(cert.verifyUrl, `${cert.name} link must carry its own id`).toContain(
          cert.credentialId!,
        );
      }
    }
  });

  it("lists all six Dataiku certificates, each dated and verifiable", () => {
    const dataiku = certifications.filter((c) => c.issuer === "Dataiku");
    expect(dataiku).toHaveLength(6);
    expect(new Set(dataiku.map((c) => c.credentialId)).size, "duplicate ids").toBe(6);
    for (const cert of dataiku) {
      expect(cert.issued, cert.name).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(cert.verifyUrl, cert.name).toBeTruthy();
    }
  });
});
