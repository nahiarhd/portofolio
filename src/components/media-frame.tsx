"use client";

/**
 * Cover / screenshot slot.
 *
 * Pass a path already resolved by `resolvePublicMedia` (server). When `src` is
 * missing, shows a skeleton; in development, `slot` names where to drop a file.
 */

import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  /** Site-root path that exists under /public, or undefined for empty slot. */
  src?: string;
  alt: string;
  /** Short label on the skeleton (e.g. "Cover", "Frame 01"). */
  label?: string;
  /**
   * Logical drop path for authors (e.g. `work/slug/cover.jpg`).
   * Shown only in development when `src` is missing.
   */
  slot?: string;
  className?: string;
  aspectClassName?: string;
  /** LCP-critical media (hero portrait, featured cover). */
  priority?: boolean;
  sizes?: string;
  /** object-cover default; contain for diagrams that must not crop. */
  objectFit?: "cover" | "contain";
};

export function MediaFrame({
  src,
  alt,
  label = "Image",
  slot,
  className,
  aspectClassName = "aspect-[16/10]",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 48vw",
  objectFit = "cover",
}: Props) {
  const isSvg = Boolean(src?.endsWith(".svg"));

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface-1",
        aspectClassName,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          unoptimized={isSvg}
          className={cn(
            objectFit === "contain" ? "object-contain p-2" : "object-cover",
          )}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.05),transparent_55%)] px-4 text-center"
          aria-label={`${label} placeholder`}
        >
          <div
            className="h-10 w-14 rounded-md border border-dashed border-white/15"
            aria-hidden
          />
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground-faint">
            {label}
          </p>
          {process.env.NODE_ENV !== "production" && slot ? (
            <p className="max-w-[20rem] break-all font-mono text-[0.6rem] leading-relaxed text-muted-foreground-faint">
              Drop file at{" "}
              <span className="text-muted-foreground">public/{slot}</span>
            </p>
          ) : null}
        </div>
      )}
    </figure>
  );
}
