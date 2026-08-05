import { describe, expect, it } from "vitest";

import { cn } from "./utils";

/**
 * These sizes are custom `--text-*` tokens, not stock Tailwind. tailwind-merge
 * defaults to reading `text-lead` as a colour, which silently deletes the size
 * when a real colour follows it. That shipped: every eyebrow rendered at 16px
 * instead of 11px until `extendTailwindMerge` was configured.
 */
describe("cn", () => {
  const SIZES = ["text-display", "text-title", "text-lead", "text-eyebrow"];

  it.each(SIZES)("keeps %s when a text colour follows it", (size) => {
    const result = cn(size, "text-muted-foreground");

    expect(result).toContain(size);
    expect(result).toContain("text-muted-foreground");
  });

  it("still lets a later size override an earlier one", () => {
    expect(cn("text-lead", "text-title")).toBe("text-title");
  });

  it("still lets a later colour override an earlier one", () => {
    expect(cn("text-muted-foreground", "text-primary")).toBe("text-primary");
  });

  it("keeps the size when the colour arrives in a separate argument", () => {
    // The real-world shape: cn(EYEBROW, "mb-6") where EYEBROW bundles both.
    const result = cn("font-mono text-eyebrow text-muted-foreground", "mb-6");

    expect(result).toContain("text-eyebrow");
    expect(result).toContain("mb-6");
  });

  it("merges ordinary conflicting utilities as before", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
