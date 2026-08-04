import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";

import { buildSystemPrompt } from "./chat-prompt";
import { LOCALES } from "./locale";

/**
 * Same hashed denylist as the content test — the prompt is published surface
 * too. A model can only leak a name that reached its context, so the strongest
 * guarantee is that no forbidden term is ever interpolated into the prompt.
 */
const FORBIDDEN_HASHES = new Set([
  "ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b",
  "2ce6ab9fc84f9e761269d907b91c5df9a35c297cec8e36391c12b621cdbf1532",
  "563f77ba16279d08ca5e70eb14f470de6c72b0eeb697447dc53f84bc3bb9e934",
  "1ddcf9d6eb81598bcfa50718e13a7bea01ba9cfdd8d47635c164c8edcc0a6b61",
  "1aef5ea8211ecde355d626694c368130b5bc3c4422c0a877b6012a91c499ff5c",
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

  it("instructs the model to refuse naming the employer", () => {
    const prompt = buildSystemPrompt("en").toLowerCase();
    expect(prompt).toContain("nda");
    expect(prompt).toContain("never name his employer");
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
