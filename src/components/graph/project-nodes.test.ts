import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";

import { NODE_COUNT, SIGNAL_INDEX } from "./geometry";
import { nodeIndexForSlug, nodeIndicesForSlugs } from "./project-nodes";

describe("nodeIndexForSlug", () => {
  it("is deterministic", () => {
    for (const project of projects) {
      expect(nodeIndexForSlug(project.slug)).toBe(nodeIndexForSlug(project.slug));
    }
  });

  it("stays inside the graph", () => {
    for (const project of projects) {
      const index = nodeIndexForSlug(project.slug);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(NODE_COUNT);
    }
  });

  it("avoids the idle signal index when possible", () => {
    for (const project of projects) {
      expect(nodeIndexForSlug(project.slug)).not.toBe(SIGNAL_INDEX);
    }
  });

  it("changes when the slug changes", () => {
    expect(nodeIndexForSlug("agent-orchestration")).not.toBe(
      nodeIndexForSlug("carbon-credit-tokenization"),
    );
  });
});

describe("nodeIndicesForSlugs", () => {
  it("dedupes", () => {
    const slug = projects[0].slug;
    expect(nodeIndicesForSlugs([slug, slug])).toEqual([nodeIndexForSlug(slug)]);
  });
});
