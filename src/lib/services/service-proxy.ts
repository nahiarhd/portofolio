import { NextResponse } from "next/server";

import { portalBadGateway, portalForbidden } from "@/lib/portal-http";
import { requirePortalUser } from "@/lib/portal-session";

/**
 * Server-side proxy for external APIs that need a secret key.
 *
 * The rule this enforces: **a backend API key must never reach the browser.**
 * The client calls `/api/services/<name>/...` with its session cookie; this
 * runs on the server, checks the session, attaches the key, and forwards.
 *
 * Anything named `NEXT_PUBLIC_*` is inlined into the client bundle at build
 * time. Never read a secret from one.
 */

/** Strip surrounding quotes that survive careless `.env` editing. */
export function stripEnvQuotes(value: string): string {
  const text = value.trim();
  const first = text[0];
  if (text.length >= 2 && first === text.at(-1) && (first === '"' || first === "'")) {
    return text.slice(1, -1).trim();
  }
  return text;
}

export interface ServiceTarget {
  /** Human name used in error messages, e.g. "Example". */
  label: string;
  /** Env var holding the base URL, e.g. EXAMPLE_API_URL. */
  baseUrlEnv: string;
  /** Env var holding the secret key, e.g. EXAMPLE_API_KEY. */
  apiKeyEnv: string;
}

export async function proxyServiceRequest(
  request: Request,
  target: ServiceTarget,
  path: string[]
): Promise<NextResponse> {
  const { error } = await requirePortalUser();
  if (error) return error;

  const baseUrl = stripEnvQuotes(process.env[target.baseUrlEnv] ?? "");
  const apiKey = stripEnvQuotes(process.env[target.apiKeyEnv] ?? "");

  if (!baseUrl) {
    return portalBadGateway(`${target.label} is not configured — set ${target.baseUrlEnv}`);
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/${path.join("/")}`);
  url.search = new URL(request.url).search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (apiKey) headers.set("X-API-Key", apiKey);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      // Required by undici when streaming a request body through.
      duplex: "half",
      signal: AbortSignal.timeout(30_000),
    } as RequestInit & { duplex: "half" });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : "unknown error";
    return portalBadGateway(`${target.label} is unreachable: ${reason}`);
  }

  // Turn an upstream auth failure into something actionable rather than a bare 403.
  if (upstream.status === 403) {
    return portalForbidden(
      `${target.label} rejected the API key — check ${target.apiKeyEnv} on the server`
    );
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) responseHeaders.set("content-type", upstreamType);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
