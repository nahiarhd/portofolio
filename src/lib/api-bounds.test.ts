import { describe, expect, it } from "vitest";

import { clampInt, DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT, parseLimitParam } from "./api-bounds";

describe("clampInt", () => {
  it("keeps an in-range value", () => {
    expect(clampInt(10, { min: 1, max: 100, fallback: 50 })).toBe(10);
  });

  it("clamps to the bounds", () => {
    expect(clampInt(0, { min: 1, max: 100, fallback: 50 })).toBe(1);
    expect(clampInt(9999, { min: 1, max: 100, fallback: 50 })).toBe(100);
  });

  it("falls back on unparseable input", () => {
    expect(clampInt("abc", { min: 1, max: 100, fallback: 50 })).toBe(50);
    expect(clampInt(null, { min: 1, max: 100, fallback: 50 })).toBe(50);
    expect(clampInt(Number.NaN, { min: 1, max: 100, fallback: 50 })).toBe(50);
  });

  it("truncates rather than rounding, so a limit never exceeds max", () => {
    expect(clampInt(10.9, { min: 1, max: 100, fallback: 50 })).toBe(10);
  });
});

describe("parseLimitParam", () => {
  it("defaults when the param is absent", () => {
    expect(parseLimitParam(null)).toBe(DEFAULT_LIST_LIMIT);
  });

  it("never exceeds the hard ceiling, however large the request", () => {
    expect(parseLimitParam("100000")).toBe(MAX_LIST_LIMIT);
  });

  it("rejects a negative page size", () => {
    expect(parseLimitParam("-5")).toBe(1);
  });
});
