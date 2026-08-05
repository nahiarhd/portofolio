/**
 * Resolve media under `/public` without hardcoding extensions.
 *
 * Content stores a logical path (with or without extension). At runtime we pick
 * the first file that exists, preferring photographic formats over SVG stubs.
 *
 * Drop real assets next to the placeholders, e.g.:
 *   public/work/agent-orchestration/cover.jpg  // wins over cover.svg
 *   public/portrait.png
 *
 * Server-only (uses node:fs). Call from Server Components or pure server modules
 * that pass the final URL into client leaves.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

/** Preference order: real photos first, SVG placeholders last. */
export const MEDIA_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".svg",
] as const;

const EXT_RE = /\.(jpe?g|png|webp|avif|svg)$/i;

function publicRoot(): string {
  return join(process.cwd(), "public");
}

/** Strip a known media extension so we can re-resolve. */
export function mediaBase(path: string): string {
  return path.replace(EXT_RE, "");
}

/**
 * Return a site-root path (`/work/.../cover.jpg`) for the best file on disk,
 * or `undefined` if nothing is there.
 */
export function resolvePublicMedia(pathOrBase: string | undefined): string | undefined {
  if (!pathOrBase) return undefined;

  const base = mediaBase(pathOrBase).replace(/^\//, "");
  const root = publicRoot();

  // Exact path with extension still wins if that file exists.
  if (EXT_RE.test(pathOrBase)) {
    const exact = pathOrBase.replace(/^\//, "");
    if (existsSync(join(root, exact))) return `/${exact}`;
  }

  for (const ext of MEDIA_EXTENSIONS) {
    const rel = `${base}${ext}`;
    if (existsSync(join(root, rel))) return `/${rel}`;
  }

  return undefined;
}

/** Dev hint: where to drop a real file for this logical slot. */
export function mediaDropHint(pathOrBase: string | undefined): string | undefined {
  if (!pathOrBase) return undefined;
  const base = mediaBase(pathOrBase).replace(/^\//, "");
  return `${base}.jpg (or .png / .webp — wins over .svg)`;
}

export function resolveMediaList(
  paths: readonly string[] | undefined,
): string[] {
  if (!paths?.length) return [];
  return paths
    .map((p) => resolvePublicMedia(p))
    .filter((p): p is string => Boolean(p));
}
