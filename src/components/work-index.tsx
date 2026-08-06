import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MediaFrame } from "@/components/media-frame";
import { withRedactions } from "@/components/redaction";
import { projects } from "@/content/projects";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";

const PILLAR_ORDER = ["ai", "blockchain", "data"] as const;

/**
 * Full work list — the crawlable, no-WebGL path to every case study.
 * Two columns rather than three: six projects fill 3x2 exactly, so the grid
 * never ends on a dangling empty cell.
 */
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

  return (
    <section id="work" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight text-foreground">
          <RedactLine>{heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.listLead}
        </p>
      </div>

      <ul data-anim="stagger" className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {ordered.map((project, i) => (
          <li key={project.slug}>
              <Link
                href={`/${lang}/work/${project.slug}`}
                className="group flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <MediaFrame
                  src={resolvePublicMedia(project.coverImage)}
                  alt={project.title[lang]}
                  label={dictionary.cover}
                  slot={mediaDropHint(project.coverImage)}
                  aspectClassName="aspect-[16/10]"
                  priority={i < 2}
                  sizes="(max-width: 640px) 100vw, 44vw"
                  parallax
                  className="w-full border-border-strong transition-colors duration-300 group-hover:border-primary"
                />

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {dictionary.pillars[project.pillar]}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {formatMonth(project.started, lang)}
                  </span>
                  {project.confidential ? (
                    <span className="chapter-stamp chapter-stamp--classified">
                      {dictionary.confidential}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  <span className="link-underline">{project.title[lang]}</span>
                </h3>

                <p className={cn("mt-2 flex-1 text-sm leading-relaxed", TEXT.subtle)}>
                  {project.confidential
                    ? withRedactions(project.summary[lang], dictionary.redacted)
                    : project.summary[lang]}
                </p>

                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {dictionary.read}
                  <span
                    aria-hidden
                    className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &#8594;
                  </span>
                </p>
              </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
