import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SURFACE, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

/** Rendered for unmatched routes and for any `notFound()` call. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className={cn(SURFACE.panelStrong, "w-full max-w-md p-6")}>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className={cn("mt-2 text-sm", TEXT.subtle)}>
          That route does not exist, or you do not have access to it.
        </p>
        <Link href="/">
          <Button className="mt-5">Back home</Button>
        </Link>
      </div>
    </main>
  );
}
