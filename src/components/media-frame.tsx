"use client";

/**
 * Cover / screenshot slot. Shows the image when the file exists under /public;
 * otherwise a drop-in skeleton with the path so you know where to put it.
 */

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  /** Short label shown on the skeleton (e.g. "Cover", "Frame 01"). */
  label?: string;
  className?: string;
  /** Aspect ratio utility classes. Default 16/10. */
  aspectClassName?: string;
};

type LoadState = "probing" | "ready" | "missing";

export function MediaFrame({
  src,
  alt,
  label = "Image",
  className,
  aspectClassName = "aspect-[16/10]",
}: Props) {
  const [state, setState] = useState<LoadState>(src ? "probing" : "missing");

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setState("ready");
    };
    img.onerror = () => {
      if (!cancelled) setState("missing");
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // When src is absent, render skeleton without probing.
  const showImage = Boolean(src) && state === "ready";
  const showSkeleton = !src || state === "missing" || state === "probing";

  return (
    <figure
      className={cn(
        // surface-1: an image slot is a recess, one step off the page.
        "relative overflow-hidden rounded-xl border border-border bg-surface-1",
        aspectClassName,
        className,
      )}
    >
      {showImage && src ? (
        // eslint-disable-next-line @next/next/no-img-element -- path probed at runtime; next/image needs static knowledge
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {showSkeleton && !showImage ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.05),transparent_55%)] px-4 text-center"
          aria-label={`${label} placeholder`}
        >
          <div
            className={cn(
              "h-10 w-14 rounded-md border border-dashed border-white/15",
              state === "probing" && "animate-pulse bg-white/5",
            )}
            aria-hidden
          />
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground-faint">
            {label}
          </p>
          {/*
            The drop path is a note to whoever is filling the slot, not to a
            visitor. In production an unfilled slot stays quiet rather than
            advertising that the site is unfinished.
          */}
          {src && process.env.NODE_ENV !== "production" ? (
            <p className="max-w-[20rem] break-all font-mono text-[0.6rem] leading-relaxed text-muted-foreground-faint">
              Drop file at{" "}
              <span className="text-muted-foreground">{src.replace(/^\//, "")}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}
