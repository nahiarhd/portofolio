import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

/**
 * Pillar order, not date order. The three pillars together are the point —
 * blockchain, AI, and data in one person is the unusual part — so the list is
 * ordered to make that legible. Separate group headings were tried and read
 * badly at 4/1/1; the pillar label on each entry plus the counts line above
 * carries the same information without the lopsided structure.
 */
const PILLAR_ORDER = ["ai", "blockchain", "data"] as const;

export function WorkIndex({
  lang,
  heading,
  dictionary,
}: {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["work"];
}) {
  const ordered = [...projects].sort((a, b) => {
    const byPillar = PILLAR_ORDER.indexOf(a.pillar) - PILLAR_ORDER.indexOf(b.pillar);
    return byPillar !== 0 ? byPillar : b.started.localeCompare(a.started);
  });

  const counts = PILLAR_ORDER.map(
    (pillar) =>
      `${projects.filter((p) => p.pillar === pillar).length} ${dictionary.pillars[pillar]}`,
  ).join(" · ");

  return (
    <section id="work" className={`${CONTAINER} scroll-mt-20 border-t border-border py-16 sm:py-24`}>
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-title font-semibold">{heading}</h2>
          <p className={EYEBROW}>{counts}</p>
        </div>
      </Reveal>

      <ul className="mt-10">
        {ordered.map((project) => (
          <li key={project.slug} className="border-t border-border">
            <Reveal>
              <Link
                href={`/${lang}/work/${project.slug}`}
                className={cn(
                  "work-row group block py-7 pl-4 transition-colors hover:bg-muted/40",
                  "focus-visible:bg-muted/40",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className={EYEBROW}>
                    {dictionary.pillars[project.pillar]} ·{" "}
                    {formatMonth(project.started, lang)}
                  </span>
                  {project.confidential ? (
                    <span
                      className={cn(
                        EYEBROW,
                        "rounded-sm border border-border px-1.5 py-0.5 text-muted-foreground",
                      )}
                    >
                      {dictionary.confidential}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 max-w-[32ch] text-xl font-medium tracking-tight transition-colors group-hover:text-primary">
                  {project.title[lang]}
                </h3>

                <p className={cn("mt-2 max-w-[62ch] text-sm leading-relaxed", TEXT.subtle)}>
                  {project.summary[lang]}
                </p>

                <p
                  className={cn(
                    "mt-3 font-mono text-eyebrow uppercase tracking-wider",
                    "text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  {dictionary.read} →
                </p>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
