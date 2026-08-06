import Link from "next/link";

import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

export function SiteFooter({
  rights,
  lang = "en",
}: {
  rights: string;
  lang?: string;
}) {
  const first = profile.name.split(" ")[0] ?? profile.name;

  return (
    <footer className="relative z-10 mt-auto border-t border-border">
      <div
        className={`${CONTAINER} flex flex-col gap-10 py-14 sm:flex-row sm:items-end sm:justify-between sm:py-16`}
      >
        <div className="max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
            {first}
          </p>
          <p className={cn("mt-3 text-sm leading-relaxed", TEXT.faint)}>{rights}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href={`mailto:${profile.email}`}
            className={cn(
              "inline-flex min-h-8 items-center text-sm transition-colors hover:text-primary",
              TEXT.subtle,
            )}
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            rel="me noreferrer"
            target="_blank"
            aria-label="LinkedIn (opens in a new tab)"
            className={cn(
              "inline-flex min-h-8 items-center text-sm transition-colors hover:text-primary",
              TEXT.subtle,
            )}
          >
            LinkedIn
          </a>
          <Link
            href={`/${lang}#work-stage`}
            className={cn(
              "inline-flex min-h-8 items-center text-sm transition-colors hover:text-primary",
              TEXT.subtle,
            )}
          >
            Work
          </Link>
        </div>
      </div>
    </footer>
  );
}
