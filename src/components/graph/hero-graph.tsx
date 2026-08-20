import { GraphStill } from "@/components/graph-still";

/**
 * Hero graph technical drawing layer for the white paper chapter.
 * Renders the crisp vector graph still on the hero surface.
 */
export function HeroGraph({ className }: { className?: string }) {
  return <GraphStill className={className} />;
}