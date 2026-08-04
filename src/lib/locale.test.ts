import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, resolveLocale } from "./locale";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("id")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of ["fr", "EN", "en-US", "", "constructor", "toString"]) {
      expect(isLocale(value), value).toBe(false);
    }
  });
});

describe("resolveLocale", () => {
  it("falls back when the header is missing or unusable", () => {
    for (const header of [null, undefined, "", "   ", "*"]) {
      expect(resolveLocale(header)).toBe(DEFAULT_LOCALE);
    }
  });

  it("matches an exact tag", () => {
    expect(resolveLocale("id")).toBe("id");
    expect(resolveLocale("en")).toBe("en");
  });

  it("matches a regional variant by its primary subtag", () => {
    expect(resolveLocale("id-ID")).toBe("id");
    expect(resolveLocale("en-GB,en")).toBe("en");
  });

  it("respects quality ordering rather than header order", () => {
    expect(resolveLocale("en;q=0.4,id;q=0.9")).toBe("id");
    expect(resolveLocale("id;q=0.2,en;q=0.8")).toBe("en");
  });

  it("treats a missing q as the highest priority", () => {
    expect(resolveLocale("id,en;q=0.9")).toBe("id");
  });

  it("ignores languages it does not support", () => {
    expect(resolveLocale("fr-FR,de;q=0.8,id;q=0.5")).toBe("id");
    expect(resolveLocale("fr-FR,de;q=0.8")).toBe(DEFAULT_LOCALE);
  });

  it("ignores entries explicitly refused with q=0", () => {
    expect(resolveLocale("id;q=0,en;q=0.5")).toBe("en");
  });

  it("is case-insensitive", () => {
    expect(resolveLocale("ID-id")).toBe("id");
  });

  it("survives a malformed header instead of throwing", () => {
    expect(resolveLocale(";;;,,,")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("id;q=banana")).toBe(DEFAULT_LOCALE);
  });
});
