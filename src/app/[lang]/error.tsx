"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SURFACE, TEXT } from "@/lib/design";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import en from "./dictionaries/en.json";
import id from "./dictionaries/id.json";

/**
 * Route-level error boundary. Must be a client component — React error
 * boundaries are client-only.
 *
 * Both dictionaries are imported statically because a client component cannot
 * await `getDictionary`. They are a few hundred bytes today. If the
 * dictionaries grow, split these three strings into their own module rather
 * than shipping all UI copy to every page.
 */
const DICTIONARIES = { en, id };

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const copy = DICTIONARIES[lang].error;

  useEffect(() => {
    // Server-side digests are how this is matched to the real stack trace,
    // which is never sent to the browser.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className={cn(SURFACE.panelStrong, "w-full max-w-md p-6")}>
        <h1 className="text-lg font-semibold">{copy.title}</h1>
        <p className={cn("mt-2 text-sm", TEXT.subtle)}>{copy.body}</p>
        {error.digest ? (
          <p className={cn("mt-2 font-mono text-xs", TEXT.faint)}>
            digest: {error.digest}
          </p>
        ) : null}
        <Button className="mt-5" onClick={reset}>
          {copy.retry}
        </Button>
      </div>
    </main>
  );
}
