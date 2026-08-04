import { describe, expect, it } from "vitest";

import { config } from "./proxy";

/**
 * The matcher is the proxy's real contract and it is easy to get wrong in a way
 * nothing else catches: an over-broad pattern silently redirected `POST
 * /api/chat` to `/en/api/chat`, which killed the chat endpoint and looked like
 * a routing bug rather than a proxy one.
 */
const matches = (pathname: string) =>
  config.matcher.some((pattern) => new RegExp(`^${pattern}$`).test(pathname));

describe("proxy matcher", () => {
  it("runs on pages that need a locale", () => {
    for (const path of ["/", "/work", "/work/carbon-credit-tokenization", "/about"]) {
      expect(matches(path), path).toBe(true);
    }
  });

  it("never runs on API routes", () => {
    for (const path of ["/api/chat", "/api/chat/", "/api/anything/nested"]) {
      expect(matches(path), path).toBe(false);
    }
  });

  it("never runs on Next internals", () => {
    for (const path of ["/_next/static/chunk.js", "/_next/image"]) {
      expect(matches(path), path).toBe(false);
    }
  });

  it("never runs on files with an extension", () => {
    for (const path of ["/favicon.ico", "/robots.txt", "/sitemap.xml", "/og.png"]) {
      expect(matches(path), path).toBe(false);
    }
  });
});
