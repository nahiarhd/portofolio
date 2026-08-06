/**
 * Chat tools. The only tool today is `showProject` — it returns a card payload
 * drawn from `projects.ts`, so the bot cannot invent a project the site does
 * not have.
 *
 * Input validation is a trust boundary: the model supplies the slug. The zod
 * schema accepts only known slugs; execute double-checks and never returns a
 * card for junk.
 */

import { tool } from "ai";
import { z } from "zod";

import { projects } from "@/content/projects";

import type { Locale } from "./locale";
import { stripRedactionMarkers } from "./redaction";

const slugList = projects.map((project) => project.slug);

if (slugList.length === 0) {
  throw new Error("projects.ts is empty — showProject has nothing to expose.");
}

/** Every published project slug. Used by the schema and by tests. */
export const PROJECT_SLUGS = slugList as [string, ...string[]];

/**
 * Trust-boundary schema. Accepts only slugs that exist in `projects.ts`.
 * Export for unit tests; the tool wires the same object.
 */
export const showProjectInputSchema = z.object({
  slug: z
    .enum(PROJECT_SLUGS)
    .describe("Exact project slug from the portfolio project list."),
});

export type ShowProjectOutput =
  | {
      ok: true;
      slug: string;
      title: string;
      summary: string;
      pillar: "ai" | "blockchain" | "data";
      confidential: boolean;
    }
  | { ok: false; error: "unknown_slug" };

export function resolveShowProject(
  slug: string,
  locale: Locale,
): ShowProjectOutput {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) {
    return { ok: false, error: "unknown_slug" };
  }
  return {
    ok: true,
    slug: project.slug,
    title: project.title[locale],
    summary: stripRedactionMarkers(project.summary[locale]),
    pillar: project.pillar,
    confidential: project.confidential,
  };
}

/**
 * Server-side tool. Locale is fixed per request so the card text matches the
 * page the visitor is reading.
 */
export function createShowProjectTool(locale: Locale) {
  return tool({
    description:
      "Show a clickable project card to the visitor for one known project. " +
      "Call this whenever you discuss or recommend a specific project so they " +
      "can open its case study. Use only a slug from the Projects list.",
    inputSchema: showProjectInputSchema,
    execute: async ({ slug }): Promise<ShowProjectOutput> =>
      resolveShowProject(slug, locale),
  });
}
