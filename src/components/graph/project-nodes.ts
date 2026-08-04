/**
 * Maps a project slug to a stable node index in the idle graph.
 *
 * Deterministic (no Math.random) so the same project always lights the same
 * point. Index 0 is reserved for the idle signal accent.
 */

import { NODE_COUNT, SIGNAL_INDEX } from "./geometry";

/** FNV-1a 32-bit — short, pure, good enough to scatter slugs across the cloud. */
export function nodeIndexForSlug(slug: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const span = NODE_COUNT - 1; // leave SIGNAL_INDEX free when possible
  const index = 1 + ((hash >>> 0) % span);
  return index === SIGNAL_INDEX ? 1 : index;
}

export function nodeIndicesForSlugs(slugs: readonly string[]): number[] {
  const indices = new Set<number>();
  for (const slug of slugs) {
    indices.add(nodeIndexForSlug(slug));
  }
  return [...indices];
}
