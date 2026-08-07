import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";

import { buildSystemPrompt } from "./chat-prompt";
import { LOCALES } from "./locale";

/**
 * Same hashed denylist as the content test — the prompt is published surface
 * too. A model can only leak a name that reached its context, so the strongest
 * guarantee is that no forbidden term is ever interpolated into the prompt.
 *
 * Three tiers, per docs/spec-repositioning.md § Confidentiality Policy Change:
 * employer names are ALLOWED, client names are FORBIDDEN, product and module
 * names are FORBIDDEN. This list holds tiers 2 and 3 only, mirroring the
 * hashes in `src/content/content.test.ts`. The client spellings are
 * deliberately NOT written here in the clear — that is the point of hashing.
 */
const FORBIDDEN_HASHES = new Set([
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

describe("buildSystemPrompt", () => {
  it("never interpolates a forbidden term", () => {
    for (const locale of LOCALES) {
      const offenders = buildSystemPrompt(locale)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .filter((token) =>
          FORBIDDEN_HASHES.has(createHash("sha256").update(token).digest("hex")),
        );
      expect(offenders, locale).toEqual([]);
    }
  });

  it("tells the model to call showProject for specific projects", () => {
    const prompt = buildSystemPrompt("en");
    expect(prompt).toContain("showProject");
    expect(prompt.toLowerCase()).toContain("slug");
  });

  it("instructs the model to refuse naming the client or product, and allows the employer", () => {
    const prompt = buildSystemPrompt("en").toLowerCase();
    expect(prompt).toContain("nda");
    expect(prompt).toContain("client");
    expect(prompt).not.toContain("never name his employer");
  });

  it("renders certifications as text, not as [object Object]", () => {
    const prompt = buildSystemPrompt("en");
    expect(prompt).not.toContain("[object Object]");
    expect(prompt).toContain("Dataiku");
  });

  it("quotes no money", () => {
    // Client names are NOT checked here. "never interpolates a forbidden term"
    // above already covers them, by hash — and spelling them out in this file
    // would be precisely the leak that hashing exists to prevent.
    for (const locale of LOCALES) {
      // Rates are conversations, not bot answers. A bot that knows the
      // project minimum will negotiate on his behalf.
      expect(buildSystemPrompt(locale), locale).not.toMatch(/\$\s?\d/);
    }
  });

  it("states the availability posture without job-hunting", () => {
    const prompt = buildSystemPrompt("en");
    expect(prompt).toContain("not actively looking");
    expect(prompt.toLowerCase()).toContain("huggingface.co/nahiar");
  });

  it("carries every project so the bot cannot miss one", () => {
    for (const locale of LOCALES) {
      const prompt = buildSystemPrompt(locale);
      for (const project of projects) {
        expect(prompt, `${project.slug} in ${locale}`).toContain(project.slug);
        expect(prompt, `${project.slug} title in ${locale}`).toContain(
          project.title[locale],
        );
      }
    }
  });

  it("marks confidential projects as confidential", () => {
    const prompt = buildSystemPrompt("en");
    for (const project of projects.filter((entry) => entry.confidential)) {
      const block = prompt.slice(prompt.indexOf(`slug: ${project.slug}`));
      expect(block.slice(0, 400), project.slug).toContain("confidential: true");
    }
  });

  it("asks for the reader's language", () => {
    expect(buildSystemPrompt("en")).toContain("English");
    expect(buildSystemPrompt("id")).toContain("Indonesian");
  });

  it("forbids inventing facts", () => {
    expect(buildSystemPrompt("en").toLowerCase()).toContain("never invent");
  });
});
