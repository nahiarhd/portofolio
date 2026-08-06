import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A headline line that arrives by having a redaction bar pulled off it.
 *
 * The bar is inert markup here and rests at `scaleX(0)`; `scroll-choreography`
 * sets it to 1 and wipes it away. Doing it in that order means a browser with
 * JS disabled, or a failed chunk, shows plain readable copy rather than a line
 * hidden behind a black block.
 *
 * Unrelated to `Redaction` in `redaction.tsx`, which conceals confidential
 * fragments in body copy. This one only ever covers public text, briefly.
 */
export function RedactLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("redact-line", className)}>
      {children}
      <span className="redact-line__bar" data-anim="redact-bar" aria-hidden />
    </span>
  );
}
