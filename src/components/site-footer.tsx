import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

export function SiteFooter({ rights }: { rights: string }) {
  return (
    <footer className="mt-auto border-t border-border">
      <div
        className={`${CONTAINER} flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between`}
      >
        {/*
          Not EYEBROW: that treatment is reserved for real data, and a rights
          notice is boilerplate. Setting it in shouting mono would spend the
          page's one loud device on its least important sentence.

          No copyright year either — these pages are statically generated, so
          `new Date()` freezes at build time and goes quietly wrong every
          January. A stale fact is worse than an omitted one.
        */}
        <p className={cn("text-sm", TEXT.faint)}>© {rights}</p>

        <div className="flex items-center gap-5">
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
            className={cn("text-sm transition-colors hover:text-primary", TEXT.subtle)}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
