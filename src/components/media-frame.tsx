"use client";

/**
 * Cover / screenshot slot.
 *
 * Pass a path already resolved by `resolvePublicMedia` (server). When `src` is
 * missing, shows a skeleton; in development, `slot` names where to drop a file.
 */

import Image from "next/image";
import type { CSSProperties } from "react";

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
  /** Marks the frame for the scroll parallax in `scroll-choreography`. */
  parallax?: boolean;
  /**
   * Shared-element name for the route view transition (cover morph from
   * work index → case study). Must be unique on the page.
   */
  transitionName?: string;
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
  parallax = false,
  transitionName,
}: Props) {
  const isSvg = Boolean(src?.endsWith(".svg"));

  return (
    <figure
      data-anim={parallax ? "parallax" : undefined}
      style={
        transitionName
          ? // `viewTransitionName` is still catching up in React's CSSProperties
            // typings across releases — cast keeps the call site clean.
            ({ viewTransitionName: transitionName } as CSSProperties)
          : undefined
      }
      className={cn(
        // `overflow-clip` rather than `hidden`: `hidden` would make the frame a
        // scroll container and freeze the parallax timeline on the image.
        "relative overflow-clip border border-border bg-surface-1",
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
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
          aria-label={`${label} placeholder`}
        >
          <div className="h-10 w-14 border border-dashed border-border-strong" aria-hidden />
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
