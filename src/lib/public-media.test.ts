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

  // The point of the resolver is that dropping a real photo next to a stub
  // replaces it with no content edit. Both halves of that are asserted against
  // real files on disk, and each guards its own fixture so the assertion cannot
  // quietly become vacuous if the file is moved.
  it("prefers a photograph over the SVG stub when both exist", () => {
    const dir = join(process.cwd(), "public", "work/agent-orchestration");
    expect(existsSync(join(dir, "cover.jpg")), "photo fixture missing").toBe(true);
    expect(existsSync(join(dir, "cover.svg")), "stub fixture missing").toBe(true);

    expect(resolvePublicMedia("/work/agent-orchestration/cover")).toBe(
      "/work/agent-orchestration/cover.jpg",
    );
  });

  it("falls back to the SVG stub when no photograph exists", () => {
    const dir = join(process.cwd(), "public", "work/agent-orchestration");
    expect(existsSync(join(dir, "01.svg")), "stub fixture missing").toBe(true);
    expect(existsSync(join(dir, "01.jpg")), "unexpected photo fixture").toBe(false);

    expect(resolvePublicMedia("/work/agent-orchestration/01")).toBe(
      "/work/agent-orchestration/01.svg",
    );
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
