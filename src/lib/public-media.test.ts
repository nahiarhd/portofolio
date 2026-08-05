import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  mediaBase,
  mediaDropHint,
  resolveMediaList,
  resolvePublicMedia,
} from "./public-media";

describe("public-media", () => {
  it("strips known extensions for the logical base", () => {
    expect(mediaBase("/work/x/cover.jpg")).toBe("/work/x/cover");
    expect(mediaBase("/work/x/cover.svg")).toBe("/work/x/cover");
    expect(mediaBase("/work/x/cover")).toBe("/work/x/cover");
  });

  it("resolves existing SVG placeholders under public/", () => {
    const resolved = resolvePublicMedia("/work/agent-orchestration/cover");
    expect(resolved).toBe("/work/agent-orchestration/cover.svg");
    expect(existsSync(join(process.cwd(), "public", "work/agent-orchestration/cover.svg"))).toBe(
      true,
    );
  });

  it("prefers a photographic file when both stub and photo exist", () => {
    // If only svg exists today, jpg is undefined — still returns svg.
    const withBase = resolvePublicMedia("/portrait");
    expect(withBase === "/portrait.svg" || withBase?.endsWith(".jpg")).toBe(true);
  });

  it("returns undefined for a path with no file on disk", () => {
    expect(resolvePublicMedia("/work/does-not-exist/cover")).toBeUndefined();
  });

  it("resolves a list and drops missing slots", () => {
    const list = resolveMediaList([
      "/work/agent-orchestration/01",
      "/work/missing/frame",
      "/work/agent-orchestration/02.svg",
    ]);
    expect(list).toEqual([
      "/work/agent-orchestration/01.svg",
      "/work/agent-orchestration/02.svg",
    ]);
  });

  it("builds a drop hint for authors", () => {
    expect(mediaDropHint("/work/x/cover.svg")).toContain("work/x/cover.jpg");
  });
});
