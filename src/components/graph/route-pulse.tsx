"use client";

/**
 * Fires the world pulse on every route change — the graph's half of the
 * page transition (the DOM half is the root view-transition crossfade).
 *
 * The pulse is *news*, not motion: something in the world changed, so the
 * network acknowledges it. Skips the initial mount — arriving on the site
 * already has its own entrance (camera dolly-in).
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useGraphActivity } from "./activity";

export function RoutePulse() {
  const pathname = usePathname();
  const { pulse } = useGraphActivity();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pulse();
  }, [pathname, pulse]);

  return null;
}
