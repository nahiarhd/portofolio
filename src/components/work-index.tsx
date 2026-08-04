import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

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
    <section id="work" className={`${CONTAINER} scroll-mt-28 border-t border-border/60 py-24 sm:py-32`}>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={EYEBROW}>{'// missions'}</p>
            <h2 className="mt-3 font-display text-title font-semibold tracking-tight">
              {heading}
            </h2>
          </div>
          <p className={EYEBROW}>{counts}</p>
        </div>
      </Reveal>

      <ul className="mt-12 space-y-3">
        {ordered.map((project, index) => (
          <li key={project.slug}>
            <Reveal>
              <Link
                href={`/${lang}/work/${project.slug}`}
                className={cn(
                  "work-row group glass block rounded-2xl px-5 py-6 pl-6 transition-all",
                  "hover:border-primary/40 hover:bg-white/[0.04]",
                  "focus-visible:border-primary/40",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className={cn(EYEBROW, TEXT.faint)}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={EYEBROW}>
                    {dictionary.pillars[project.pillar]} ·{" "}
                    {formatMonth(project.started, lang)}
                  </span>
                  {project.confidential ? (
                    <span
                      className={cn(
                        EYEBROW,
                        "rounded-full border border-border px-2 py-0.5 text-primary/90",
                      )}
                    >
                      {dictionary.confidential}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 max-w-[36ch] font-display text-xl font-medium tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                  {project.title[lang]}
                </h3>

                <p className={cn("mt-2 max-w-[62ch] text-sm leading-relaxed", TEXT.subtle)}>
                  {project.summary[lang]}
                </p>

                <p
                  className={cn(
                    "mt-4 font-mono text-eyebrow uppercase tracking-wider text-primary",
                    "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
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
