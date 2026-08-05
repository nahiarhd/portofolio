import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `globals.css` adds four custom font sizes. tailwind-merge cannot tell
 * `text-lead` (a size) from `text-muted-foreground` (a colour) on its own, so
 * without this it treats them as conflicting and silently drops the size —
 * every eyebrow rendered at 16px instead of 11px, every lead at 16px not 20px.
 *
 * Add any new `--text-*` token here or it will be dropped the same way.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "title", "lead", "eyebrow"] }],
    },
  },
});

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
