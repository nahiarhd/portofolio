import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
 *
 * EXCEPTION (owner-authorised, recorded): the hash of "adma" was removed here.
 * It named the legal entity of the employer, which the owner reclassified
 * from unresolved to tier 1 (allowed) after confirming it against the MSIB
 * certificate himself — see docs/spec-repositioning.md and
 * .superpowers/sdd/task-4-report.md. This is the one deliberate exception to
 * "only Task 1 touches FORBIDDEN_HASHES": a tier reclassification by the
 * owner, not a weakening to make content pass.
 */
const FORBIDDEN_HASHES = new Set([
  "4f062d0a078692326192961e6cd832e0e025d4327171fe19a6ad78aaf4fc76a9",
  "ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b",
  "2ce6ab9fc84f9e761269d907b91c5df9a35c297cec8e36391c12b621cdbf1532",
  "563f77ba16279d08ca5e70eb14f470de6c72b0eeb697447dc53f84bc3bb9e934",
  "1ddcf9d6eb81598bcfa50718e13a7bea01ba9cfdd8d47635c164c8edcc0a6b61",
  "1aef5ea8211ecde355d626694c368130b5bc3c4422c0a877b6012a91c499ff5c",
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
    // Six product/module terms + five client spellings = 11, minus the one
    // employer-entity hash reclassified to tier 1 (see the EXCEPTION note
    // above FORBIDDEN_HASHES) = 10.
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

/**
 * The block above only walks the exported values of src/content/*.ts. Twice
 * on this branch a client-name token reached the repository outside that
 * surface — once in a test file (src/lib/chat-prompt.test.ts), once in a
 * planning doc (tasks/plan-repositioning.md) — and neither was caught,
 * because nothing scanned dictionaries, tests, or docs. This walks every
 * git-tracked text file under the directories where that class of leak
 * actually happened, reusing the same FORBIDDEN_HASHES and containsForbidden
 * above — never a second, drifting copy of the denylist.
 */
describe("confidentiality (whole repository)", () => {
  const REPO_ROOT = process.cwd();
  const SCAN_ROOTS = ["src", "docs", "tasks"];
  // This file holds the hash constants and the detector itself — it is the
  // checker, not content to check, so it is excluded from the file list
  // rather than scanned for its own hash literals.
  const SELF_PATH = "src/content/content.test.ts";
  const BINARY_EXT = /\.(ico|png|jpe?g|gif|webp|avif|woff2?|ttf|eot)$/i;

  /** Every git-tracked file under SCAN_ROOTS, minus this file and binaries. */
  function trackedFiles(): string[] {
    const out = execFileSync("git", ["ls-files"], { cwd: REPO_ROOT, encoding: "utf8" });
    return out
      .split("\n")
      .filter(Boolean)
      .filter((path) => SCAN_ROOTS.some((root) => path === root || path.startsWith(`${root}/`)))
      .filter((path) => path !== SELF_PATH && !BINARY_EXT.test(path));
  }

  /** Read each file from disk and flag it if any token hashes to a forbidden term. */
  function scan(absolutePaths: string[], hashes: ReadonlySet<string>): string[] {
    return absolutePaths.filter((path) => containsForbidden(readFileSync(path, "utf8"), hashes));
  }

  it("scans a non-trivial number of tracked files under src, docs, and tasks", () => {
    // Guards against a refactor — or a git-less shell — that silently empties
    // the file list. A scanner that scans nothing always passes.
    const files = trackedFiles();
    expect(files.length).toBeGreaterThan(50);
    expect(files).not.toContain(SELF_PATH);
    expect(files.some((p) => p.startsWith("node_modules/") || p.startsWith(".next/"))).toBe(
      false,
    );
  });

  it("detects a forbidden term planted in a real file on disk", () => {
    // The control test at the top of this file proves `containsForbidden`
    // works on an in-memory string. This proves the other half — that
    // `scan` actually reads a real file from disk and catches it — using a
    // fake term (never the real denylist) written to a file outside the
    // repo, so it can never appear in the production file list above.
    const dir = mkdtempSync(join(tmpdir(), "confidentiality-guard-"));
    const planted = join(dir, "planted.md");
    const control = new Set([sha256("banana")]);

    try {
      writeFileSync(planted, "This paragraph mentions Banana in passing.");
      expect(scan([planted], control)).toEqual([planted]);
      // The fake term is not on the real denylist — sanity check that the
      // two sets aren't accidentally being conflated.
      expect(scan([planted], FORBIDDEN_HASHES)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("contains no forbidden term in any tracked file under src, docs, or tasks", () => {
    const offenders = scan(
      trackedFiles().map((path) => join(REPO_ROOT, path)),
      FORBIDDEN_HASHES,
    );

    // Report the path only, relative to the repo root. Echoing the
    // offending text would print the term.
    expect(offenders.map((path) => path.slice(REPO_ROOT.length + 1))).toEqual([]);
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

  it("features exactly three projects, led by AI", () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured).toHaveLength(3);
    expect(featured.filter((p) => p.pillar === "ai").length).toBeGreaterThanOrEqual(2);
    // At least one featured project must be checkable. Three redacted cards in
    // a row reads as "he can show me nothing".
    expect(featured.some((p) => !p.confidential), "all featured work is redacted").toBe(true);
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
  it("gives every publication a well-formed DOI URL and an honest author position", () => {
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

  it("pins each Dataiku credential id to the certificate that carries it", () => {
    // Read off the certificates themselves. A swap between two entries would
    // pass every other test here while publishing a checkable falsehood.
    const expected: Record<string, string> = {
      "MLOps Practitioner Certificate": "rriyymrx88zz",
      "Developer Certificate": "7pj8jh3ruaue",
      "Generative AI Practitioner Certificate": "tuj5pxkizvjo",
      "ML Practitioner Certificate": "bwqycmmtuced",
      "Advanced Designer Certificate": "v439v63i2daa",
      "Core Designer Certificate": "6uqybt6jajtr",
    };

    for (const [name, credentialId] of Object.entries(expected)) {
      const cert = certifications.find((c) => c.name === name);
      expect(cert, `missing: ${name}`).toBeDefined();
      expect(cert!.credentialId, name).toBe(credentialId);
    }
  });
});
