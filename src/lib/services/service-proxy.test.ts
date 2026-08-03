import { describe, expect, it } from "vitest";

import { stripEnvQuotes } from "./service-proxy";

describe("stripEnvQuotes", () => {
  it("removes matched surrounding quotes", () => {
    expect(stripEnvQuotes('"secret"')).toBe("secret");
    expect(stripEnvQuotes("'secret'")).toBe("secret");
  });

  it("leaves unquoted and mismatched values alone", () => {
    expect(stripEnvQuotes("secret")).toBe("secret");
    expect(stripEnvQuotes("\"secret'")).toBe("\"secret'");
  });

  it("trims surrounding whitespace", () => {
    expect(stripEnvQuotes('  "secret"  ')).toBe("secret");
  });

  it("does not strip quotes that are part of the value", () => {
    expect(stripEnvQuotes('a"b')).toBe('a"b');
  });

  it("handles empty input", () => {
    expect(stripEnvQuotes("")).toBe("");
    expect(stripEnvQuotes('""')).toBe("");
  });
});
