"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useGraphActivity } from "@/components/graph/activity";
import { playSound } from "@/lib/sound";

export function WorkCardLink({
  href,
  slug,
  children,
  className,
}: {
  href: string;
  slug: string;
  children: ReactNode;
  className?: string;
}) {
  const { setHighlightSlugs } = useGraphActivity();

  return (
    <Link
      href={href}
      className={className}
      onPointerEnter={() => {
        setHighlightSlugs([slug]);
        playSound("tick");
      }}
      onPointerLeave={() => {
        setHighlightSlugs([]);
      }}
      onFocus={() => {
        setHighlightSlugs([slug]);
      }}
      onBlur={() => {
        setHighlightSlugs([]);
      }}
    >
      {children}
    </Link>
  );
}
