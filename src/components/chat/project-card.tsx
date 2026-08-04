import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { EYEBROW, SURFACE, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import type { ShowProjectOutput } from "@/lib/chat-tools";

/**
 * Card rendered from a successful `showProject` tool result. Same content as
 * the work index row (title + summary from `projects.ts`), clickable through
 * to the case study. Unknown slugs never reach here — the tool rejects them.
 */
export function ProjectCard({
  lang,
  project,
  work,
}: {
  lang: Locale;
  project: Extract<ShowProjectOutput, { ok: true }>;
  work: Dictionary["work"];
}) {
  return (
    <Link
      href={`/${lang}/work/${project.slug}`}
      className={cn(
        SURFACE.panel,
        "mt-1 block px-3 py-3 transition-colors hover:border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className={EYEBROW}>{work.pillars[project.pillar]}</p>
        {project.confidential && (
          <p className={cn(EYEBROW, "text-muted-foreground")}>{work.confidential}</p>
        )}
      </div>
      <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
        {project.title}
      </p>
      <p className={cn("mt-1 text-sm", TEXT.subtle)}>{project.summary}</p>
      <p className={cn("mt-2 text-sm font-medium text-primary")}>{work.read} →</p>
    </Link>
  );
}
