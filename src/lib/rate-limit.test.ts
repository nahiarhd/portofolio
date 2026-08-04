import { describe, expect, it } from "vitest";

import { clientKey, createRateLimiter } from "./rate-limit";

/**
 * `now` is injected everywhere rather than faking timers: the limiter's whole
 * job is time arithmetic, and passing the clock in keeps these tests
 * deterministic and instant.
 */
describe("createRateLimiter", () => {
  it("allows up to the limit and refuses the next request", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });

    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 1).allowed).toBe(true);
    expect(check("a", 2).allowed).toBe(true);
    expect(check("a", 3).allowed).toBe(false);
  });

  it("keeps buckets separate per key", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 1).allowed).toBe(false);
    // A different caller is unaffected by the first one being throttled.
    expect(check("b", 1).allowed).toBe(true);
  });

  it("lets the window slide rather than resetting in fixed buckets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1_000 });

    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 500).allowed).toBe(true);
    expect(check("a", 900).allowed).toBe(false);

    // The first hit has now aged out, so exactly one slot frees up.
    expect(check("a", 1_001).allowed).toBe(true);
    expect(check("a", 1_002).allowed).toBe(false);
  });

  it("reports a usable retry-after", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 10_000 });

    check("a", 0);
    const refused = check("a", 4_000);
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfterSeconds).toBe(6);
  });

  it("never reports a retry-after below one second", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000 });

    check("a", 0);
    // 1ms left on the window would round to 0 and invite an instant retry.
    expect(check("a", 999).retryAfterSeconds).toBe(1);
  });

  it("does not let a refused request extend its own penalty", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000 });

    check("a", 0);
    check("a", 500);
    check("a", 800);
    // Hammering must not keep pushing the window out, or a throttled caller
    // could never recover.
    expect(check("a", 1_001).allowed).toBe(true);
  });

  it("frees memory once keys go quiet, instead of growing without bound", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000, maxTrackedKeys: 5 });

    for (let i = 0; i < 20; i++) check(`key-${i}`, 0);
    // Well past the window: the next call prunes expired entries rather than
    // holding every address that ever called.
    expect(check("fresh", 10_000).allowed).toBe(true);
    // The pruned keys are genuinely gone — an old caller starts clean.
    expect(check("key-0", 10_001).allowed).toBe(true);
  });

  it("evicts oldest-first when every tracked key is still live", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, maxTrackedKeys: 3 });

    for (let i = 0; i < 10; i++) check(`key-${i}`, i);
    // The most recent caller is still throttled, so eviction did not simply
    // wipe the whole map and hand everyone a free pass.
    expect(check("key-9", 20).allowed).toBe(false);
  });
});

describe("clientKey", () => {
  const withHeaders = (headers: Record<string, string>) =>
    new Request("https://example.test/api/chat", { headers });

  it("takes the original client from x-forwarded-for", () => {
    expect(clientKey(withHeaders({ "x-forwarded-for": "203.0.113.5" }))).toBe(
      "203.0.113.5",
    );
  });

  it("ignores proxies appended after the client", () => {
    expect(
      clientKey(withHeaders({ "x-forwarded-for": "203.0.113.5, 70.41.3.18, 10.0.0.1" })),
    ).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(withHeaders({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("falls back to a shared bucket when no header is present", () => {
    expect(clientKey(withHeaders({}))).toBe("local");
  });

  it("does not return an empty key when the header is blank", () => {
    // An empty key would put every anonymous caller in one bucket silently.
    expect(clientKey(withHeaders({ "x-forwarded-for": "  " }))).toBe("local");
  });
});
