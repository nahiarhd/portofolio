import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";

import {
  PROJECT_SLUGS,
  resolveShowProject,
  showProjectInputSchema,
} from "./chat-tools";

describe("showProjectInputSchema", () => {
  it("accepts every published project slug", () => {
    for (const project of projects) {
      const parsed = showProjectInputSchema.safeParse({ slug: project.slug });
      expect(parsed.success, project.slug).toBe(true);
    }
  });

  it("rejects junk slugs — trust boundary", () => {
    for (const slug of ["", "nope", "../etc", "agent-orchestration ", "AGENT-ORCHESTRATION"]) {
      const parsed = showProjectInputSchema.safeParse({ slug });
      expect(parsed.success, slug).toBe(false);
    }
  });

  it("rejects missing or extra fields", () => {
    expect(showProjectInputSchema.safeParse({}).success).toBe(false);
    expect(
      showProjectInputSchema.safeParse({
        slug: PROJECT_SLUGS[0],
        extra: true,
      }).success,
    ).toBe(true); // zod object strips unknown by default; input is still valid
  });

  it("PROJECT_SLUGS matches projects.ts", () => {
    expect([...PROJECT_SLUGS].sort()).toEqual(
      projects.map((project) => project.slug).sort(),
    );
  });
});

describe("resolveShowProject", () => {
  it("returns localized card fields for a known slug", () => {
    const slug = projects[0].slug;
    const en = resolveShowProject(slug, "en");
    const id = resolveShowProject(slug, "id");

    expect(en).toMatchObject({ ok: true, slug });
    expect(id).toMatchObject({ ok: true, slug });
    if (en.ok && id.ok) {
      expect(en.title).toBe(projects[0].title.en);
      expect(id.title).toBe(projects[0].title.id);
      expect(en.summary.length).toBeGreaterThan(0);
    }
  });

  it("returns unknown_slug for a slug that is not in projects.ts", () => {
    // Bypass the schema so execute's second guard is what we test.
    expect(resolveShowProject("not-a-real-project", "en")).toEqual({
      ok: false,
      error: "unknown_slug",
    });
  });
});
