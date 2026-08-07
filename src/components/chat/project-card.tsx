import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { TEXT } from "@/lib/design";
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
        "chat-msg mt-1 block rounded-xl border border-border bg-background/70 px-4 py-3",
        "transition-[border-color,background-color,transform] duration-200",
        "[transition-timing-function:var(--ease-out-quart)]",
        "hover:border-primary/50 hover:bg-surface-2 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p
          className={cn(
            "font-mono text-[10px] font-semibold uppercase tracking-wider",
            project.pillar === "ai" ? "text-primary" : TEXT.faint,
          )}
        >
          {work.pillars[project.pillar]}
        </p>
        {project.confidential ? (
          <p className={cn("font-mono text-[10px] uppercase tracking-wider", TEXT.faint)}>
            {work.confidential}
          </p>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm font-semibold tracking-tight text-foreground">
        {project.title}
      </p>
      <p className={cn("mt-1 text-sm leading-relaxed", TEXT.subtle)}>{project.summary}</p>
      <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
        {work.read}
        <span aria-hidden className="ml-1">
          →
        </span>
      </p>
    </Link>
  );
}
