/**
 * Public site origin for absolute URLs (sitemap, robots, metadataBase).
 *
 * Prefers `NEXT_PUBLIC_SITE_URL` (set in production). Falls back to the Vercel
 * deployment URL, then localhost for dev. Never a secret — only the public host.
 */

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;

  return "http://localhost:3000";
}
