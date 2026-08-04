import { describe, expect, it } from "vitest";

import { formatMonth, formatRange } from "./format";

/**
 * Assertions deliberately avoid exact month spellings: those come from the
 * runtime's ICU data and shift between Node versions, which would make this a
 * test of the platform rather than of our code.
 */
describe("formatMonth", () => {
  it("keeps the year", () => {
    expect(formatMonth("2024-08", "en")).toContain("2024");
    expect(formatMonth("2024-08", "id")).toContain("2024");
  });

  it("does not slip a month across a timezone boundary", () => {
    // January is the case that breaks when UTC is not pinned: a negative
    // offset would render it as the previous December.
    expect(formatMonth("2025-01", "en")).toContain("2025");
    expect(formatMonth("2025-01", "en")).toMatch(/jan/i);
    expect(formatMonth("2025-12", "en")).toMatch(/dec/i);
  });

  it("localizes — the two locales do not produce identical output", () => {
    // Indonesian abbreviates several months differently from English
    // (Ags/Okt/Des), so at least one of these must differ.
    const differing = ["2024-08", "2024-10", "2024-12"].filter(
      (month) => formatMonth(month, "en") !== formatMonth(month, "id"),
    );
    expect(differing.length).toBeGreaterThan(0);
  });
});

describe("formatRange", () => {
  it("joins a closed range", () => {
    const range = formatRange("2023-08", "2023-12", "en", "Present");
    expect(range).toContain("2023");
    expect(range).toContain("—");
    expect(range).not.toContain("Present");
  });

  it("uses the supplied label when a role is current", () => {
    expect(formatRange("2024-08", undefined, "en", "Present")).toContain("Present");
    expect(formatRange("2024-08", undefined, "id", "Sekarang")).toContain("Sekarang");
  });
});
