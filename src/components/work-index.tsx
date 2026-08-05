import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MediaFrame } from "@/components/media-frame";
import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
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

  const [featured, ...rest] = ordered;
  const counts = PILLAR_ORDER.map(
    (pillar) =>
      `${projects.filter((p) => p.pillar === pillar).length} ${dictionary.pillars[pillar]}`,
  ).join(" · ");

  return (
    <section id="work" className={`${CONTAINER} ${SECTION}`}>
      <Reveal>
        <div className="max-w-2xl">
          <p className={EYEBROW}>
            {lang === "en" ? "Also as a list" : "Juga sebagai daftar"}
          </p>
          <h2 className="mt-3 font-display text-title font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className={cn("mt-3 max-w-[52ch] text-sm leading-relaxed sm:text-base", TEXT.subtle)}>
            {lang === "en"
              ? "Same case studies without WebGL — for search, sharing, and when the shelf is off."
              : "Studi kasus yang sama tanpa WebGL — untuk pencarian, berbagi, dan saat rak nonaktif."}
          </p>
          <p className={cn(EYEBROW, "mt-5")}>{counts}</p>
          <p className="mt-4">
            <a
              href="#shelf"
              className="font-mono text-xs font-semibold uppercase tracking-wider text-primary transition-opacity hover:opacity-80"
            >
              {lang === "en" ? "Back to the shelf" : "Kembali ke rak"}
              <span aria-hidden className="ml-1">
                ↑
              </span>
            </a>
          </p>
        </div>
      </Reveal>

      {/* Featured: one large editorial row — not a glass card twin. */}
      {featured ? (
        <Reveal>
          <Link
            href={`/${lang}/work/${featured.slug}`}
            className={cn(
              "work-row group mt-12 block rounded-2xl border border-border bg-surface-1 p-4 transition-colors duration-300",
              "hover:border-primary/35 sm:p-5",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            )}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
              <MediaFrame
                src={resolvePublicMedia(featured.coverImage)}
                alt={featured.title[lang]}
                label={dictionary.cover}
                slot={mediaDropHint(featured.coverImage)}
                aspectClassName="aspect-[16/10]"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="w-full rounded-xl border-0 transition-transform duration-500 group-hover:scale-[1.015]"
              />
              <div className="min-w-0 px-1 sm:px-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold uppercase tracking-wider",
                      featured.pillar === "ai" ? "text-primary" : TEXT.subtle,
                    )}
                  >
                    {dictionary.pillars[featured.pillar]}
                  </span>
                  <span className={cn("font-mono text-[10px] uppercase tracking-wider", TEXT.faint)}>
                    {formatMonth(featured.started, lang)}
                  </span>
                  {featured.confidential ? (
                    <span className={cn("font-mono text-[10px] uppercase tracking-wider", TEXT.faint)}>
                      {dictionary.confidential}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                  {featured.title[lang]}
                </h3>
                <p className={cn("mt-3 max-w-[48ch] text-sm leading-relaxed", TEXT.subtle)}>
                  {featured.summary[lang]}
                </p>
                <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                  {dictionary.read}
                  <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </div>
          </Link>
        </Reveal>
      ) : null}

      {/* Rest: dense index rows — hierarchy by type, not six identical cards. */}
      <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {rest.map((project) => (
          <li key={project.slug}>
            <Reveal>
              <Link
                href={`/${lang}/work/${project.slug}`}
                className={cn(
                  "work-row group grid gap-4 py-6 transition-colors sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:py-7",
                  "hover:bg-surface-1/60",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                )}
              >
                <MediaFrame
                  src={resolvePublicMedia(project.coverImage)}
                  alt={project.title[lang]}
                  label={dictionary.cover}
                  slot={mediaDropHint(project.coverImage)}
                  aspectClassName="aspect-[16/10] sm:aspect-square"
                  sizes="(max-width: 640px) 100vw, 120px"
                  className="w-full max-w-[12rem] rounded-lg border-0 sm:max-w-none"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold uppercase tracking-wider",
                        project.pillar === "ai" ? "text-primary" : TEXT.faint,
                      )}
                    >
                      {dictionary.pillars[project.pillar]}
                    </span>
                    <span className={cn("font-mono text-[10px] uppercase tracking-wider", TEXT.faint)}>
                      {formatMonth(project.started, lang)}
                    </span>
                    {project.confidential ? (
                      <span className={cn("font-mono text-[10px] uppercase tracking-wider", TEXT.faint)}>
                        {dictionary.confidential}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                    {project.title[lang]}
                  </h3>
                  <p className={cn("mt-1.5 line-clamp-2 max-w-[52ch] text-sm leading-relaxed", TEXT.subtle)}>
                    {project.summary[lang]}
                  </p>
                </div>
                <span className="hidden font-mono text-xs font-semibold uppercase tracking-wider text-primary sm:inline-flex sm:items-center">
                  {dictionary.read}
                  <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
