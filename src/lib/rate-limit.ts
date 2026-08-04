/**
 * In-process sliding-window rate limiter.
 *
 * Chosen over Vercel's WAF rate-limiting rules and `@vercel/firewall` because
 * both are paid-plan features configured in a dashboard: they cannot run in
 * local dev or CI, so the limit would be untestable and unverifiable until
 * production. This works everywhere and adds no dependency and no Redis.
 *
 * KNOWN LIMIT: state is per instance. Fluid Compute reuses instances, but under
 * load or across regions there can be several, so the effective ceiling is
 * (limit × instances). That is a deliberate trade. It stops the realistic
 * threat — one person or script hammering the endpoint — and Vercel's own DDoS
 * protection covers volume. If cost ever becomes a real problem, replace this
 * with a shared store; the call site does not change.
 */

type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller may retry. Zero when allowed. */
  retryAfterSeconds: number;
};

export type RateLimiter = (key: string, now?: number) => RateLimitResult;

export function createRateLimiter({
  limit,
  windowMs,
  /**
   * Cap on tracked keys, so a flood of distinct addresses cannot grow the map
   * without bound. Expired entries are dropped first; if everything is still
   * live, the oldest are evicted. Injectable so the eviction path can be tested
   * without allocating ten thousand keys.
   */
  maxTrackedKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  maxTrackedKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, timestamps] of hits) {
      const live = timestamps.filter((at) => now - at < windowMs);
      if (live.length === 0) hits.delete(key);
      else hits.set(key, live);
    }
    if (hits.size <= maxTrackedKeys) return;
    // Still over budget with everything live: drop oldest-first. Map preserves
    // insertion order, so the head is the least recently created entry.
    const excess = hits.size - maxTrackedKeys;
    for (const key of [...hits.keys()].slice(0, excess)) hits.delete(key);
  }

  return function check(key: string, now = Date.now()): RateLimitResult {
    if (hits.size > maxTrackedKeys) prune(now);

    const timestamps = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      hits.set(key, timestamps);
      return {
        allowed: false,
        // Ceil so a caller retrying exactly on the boundary is not refused again.
        retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      };
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

/**
 * Identify the caller. On Vercel `x-forwarded-for` is set by the platform, so
 * it is trustworthy there; locally it is absent and every caller shares one
 * bucket, which is correct for a single developer.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  // The left-most entry is the original client; the rest are proxies.
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return ip || "local";
}
