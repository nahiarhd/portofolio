import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SURFACE, TEXT } from "@/lib/design";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { getDictionary } from "./dictionaries";

/**
 * `not-found.tsx` receives no params, so it cannot know which locale was being
 * rendered. Falling back to the default locale is the honest trade: the
 * alternative is threading a locale through a component Next controls the props
 * of. Revisit only if the 404 turns out to matter for Indonesian visitors.
 */
export default async function NotFound() {
  const dictionary = await getDictionary(DEFAULT_LOCALE);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className={cn(SURFACE.panelStrong, "w-full max-w-md p-6")}>
        <h1 className="text-lg font-semibold">{dictionary.notFound.title}</h1>
        <p className={cn("mt-2 text-sm", TEXT.subtle)}>{dictionary.notFound.body}</p>
        <Link href={`/${DEFAULT_LOCALE}`} className="mt-5 inline-block">
          <Button>{dictionary.notFound.home}</Button>
        </Link>
      </div>
    </main>
  );
}
