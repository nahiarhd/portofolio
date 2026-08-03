"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SURFACE, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Route-level error boundary. Catches render errors below it and offers a
 * retry. Must be a client component — React error boundaries are client-only.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporter. Server-side digests are how you match
    // this to the real stack trace, which is never sent to the browser.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className={cn(SURFACE.panelStrong, "w-full max-w-md p-6")}>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className={cn("mt-2 text-sm", TEXT.subtle)}>
          The page failed to render. Retrying is usually safe.
        </p>
        {error.digest ? (
          <p className={cn("mt-2 font-mono text-xs", TEXT.faint)}>digest: {error.digest}</p>
        ) : null}
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
