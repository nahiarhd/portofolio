import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

export function SiteFooter({ rights }: { rights: string }) {
  return (
    <footer className="relative z-10 mt-auto border-t border-border/60">
      <div
        className={`${CONTAINER} flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between`}
      >
        <p className={cn("max-w-sm text-sm", TEXT.faint)}>© {rights}</p>

        <div className="flex flex-wrap items-center gap-5">
          <a
            href={`mailto:${profile.email}`}
            className={cn("text-sm transition-colors hover:text-primary", TEXT.subtle)}
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            rel="me noreferrer"
            target="_blank"
            aria-label="LinkedIn (opens in a new tab)"
            className={cn("text-sm transition-colors hover:text-primary", TEXT.subtle)}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
