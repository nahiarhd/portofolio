"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MediaFrame } from "@/components/media-frame";
import { withRedactions } from "@/components/redaction";
import { useGraphActivity } from "@/components/graph/activity";
import {
  usePrefersReducedMotion,
  useWebGLAvailable,
} from "@/components/graph/use-graph-runtime";
import type { Project } from "@/content/projects";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { WorkCardLink } from "./work-card-link";
import { padDeckIndex } from "./work-deck-progress";

const WorkDeckStage = dynamic(
  () => import("./work-deck-stage").then((mod) => mod.WorkDeckStage),
  { ssr: false },
);

export type DeckProject = Project & {
  resolvedCoverImage?: string;
  mediaSlot?: string;
};

type Props = {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["work"];
  projects: readonly DeckProject[];
  moreProjects?: readonly DeckProject[];
  viewAllHref: string;
};

function TitleWords({ text, start = 2 }: { text: string; start?: number }) {
  const words = text.split(" ").filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="work-k inline-block pr-[0.28em] last:pr-0"
          style={{ "--i": start + index } as CSSProperties}
        >
          {word}
        </span>
      ))}
    </>
  );
}

export function WorkDeck({
  lang,
  heading,
  dictionary,
  projects,
  moreProjects = [],
  viewAllHref,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const { setHighlightSlugs } = useGraphActivity();
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();
  const router = useRouter();
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  const projectCount = projects.length;
  const chapterCount = projectCount + 1;
  const onSeeAll = activeIdx >= projectCount;
  const active = projects[Math.min(activeIdx, Math.max(projectCount - 1, 0))];
  const showStage = !reduced && webgl && Boolean(active) && !onSeeAll;

  const stageCards = useMemo(
    () =>
      projects.map((project) => ({
        slug: project.slug,
        cover: project.resolvedCoverImage,
      })),
    [projects],
  );

  useEffect(() => {
    const nodes = chapterRefs.current.filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!top) return;
        const next = Number((top.target as HTMLElement).dataset.workIndex);
        if (!Number.isFinite(next)) return;
        setActiveIdx((prev) => (prev === next ? prev : next));
      },
      { threshold: [0.45, 0.6, 0.8], rootMargin: "-10% 0px -10% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [chapterCount]);

  useEffect(() => {
    if (!active || onSeeAll) {
      setHighlightSlugs([]);
      return;
    }
    setHighlightSlugs([active.slug]);
    return () => {
      setHighlightSlugs([]);
    };
  }, [active, onSeeAll, setHighlightSlugs]);

  const goTo = (index: number) => {
    const next = Math.min(chapterCount - 1, Math.max(0, index));
    chapterRefs.current[next]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    playSound("tick");
  };

  if (!active) return null;

  return (
    <div data-anim="work-deck" className="work-stack">
      <div className="relative">
        {showStage ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[46%] lg:block">
            <div className="pointer-events-auto sticky top-0 flex h-[100dvh] items-center px-8 pt-16">
              <div className="work-stage w-full overflow-clip border border-border-strong">
                <WorkDeckStage
                  cards={stageCards}
                  activeIdx={Math.min(activeIdx, projectCount - 1)}
                  onSelect={goTo}
                  onOpen={() => router.push(`/${lang}/work/${active.slug}`)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {projects.map((project, index) => {
          const isActive = !onSeeAll && index === activeIdx;
          return (
            <article
              key={project.slug}
              ref={(node) => {
                chapterRefs.current[index] = node;
              }}
              data-work-index={index}
              data-active={isActive}
              className="work-chapter"
            >
              <div className="work-chapter-glow" aria-hidden />
              <div
                className={cn(
                  CONTAINER,
                  "relative flex min-h-[100dvh] w-full flex-col justify-center gap-10 pt-28 pb-16 lg:flex-row lg:items-center lg:justify-between",
                )}
              >
                <div className={cn("lg:max-w-[50%]", showStage && "lg:pr-6")}>
                  <p
                    className="work-k font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                    style={{ "--i": 0 } as CSSProperties}
                  >
                    <span className="text-primary">{heading}</span>
                    <span className="mx-3 text-muted-foreground-faint">·</span>
                    <span>
                      {padDeckIndex(index + 1)} / {padDeckIndex(projectCount)}
                    </span>
                  </p>

                  <div
                    className="work-k mt-5 flex flex-wrap items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                    style={{ "--i": 1 } as CSSProperties}
                  >
                    <span className="font-bold text-primary">
                      {dictionary.pillars[project.pillar]}
                    </span>
                    <span className="text-muted-foreground-faint">·</span>
                    <span>{formatMonth(project.started, lang)}</span>
                    {project.confidential ? (
                      <span className="chapter-stamp chapter-stamp--classified">
                        {dictionary.confidential}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-6 font-display text-[clamp(2.1rem,5.8vw,4.6rem)] font-medium leading-[0.96] tracking-[-0.045em] text-pretty text-foreground">
                    <Link
                      href={`/${lang}/work/${project.slug}`}
                      className="transition-colors duration-150 hover:text-primary"
                    >
                      <TitleWords text={project.title[lang]} />
                    </Link>
                  </h3>

                  <p
                    className={cn(
                      "work-k mt-6 max-w-[38ch] text-base leading-relaxed sm:text-lg",
                      TEXT.subtle,
                    )}
                    style={{ "--i": 6 } as CSSProperties}
                  >
                    {project.confidential
                      ? withRedactions(
                          project.summary[lang],
                          dictionary.redacted,
                          dictionary.redactedAnnounced,
                        )
                      : project.summary[lang]}
                  </p>

                  <div className="work-k mt-8" style={{ "--i": 7 } as CSSProperties}>
                    <Link
                      href={`/${lang}/work/${project.slug}`}
                      className={cn(BUTTON.primary, "group")}
                    >
                      <span>{dictionary.read}</span>
                      <span
                        className="ml-2 inline-block transition-transform duration-150 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>

                <div className={cn("w-full lg:w-[46%]", showStage && "lg:hidden")}>
                  <div className="work-k" style={{ "--i": 3 } as CSSProperties}>
                    <Link
                      href={`/${lang}/work/${project.slug}`}
                      className="group block overflow-clip border border-border-strong transition-[border-color] duration-200 hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <MediaFrame
                        src={project.resolvedCoverImage}
                        alt={project.title[lang]}
                        label={dictionary.cover}
                        slot={project.mediaSlot}
                        aspectClassName="aspect-[16/10]"
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="work-card-media w-full"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside
        ref={(node) => {
          chapterRefs.current[projectCount] = node;
        }}
        data-work-index={projectCount}
        data-active={onSeeAll}
        className="work-chapter work-chapter--index"
        aria-label={dictionary.viewAll}
      >
        <div className="work-chapter-glow" aria-hidden />
        <div
          className={cn(
            CONTAINER,
            "relative grid min-h-[100dvh] items-center gap-14 pt-28 pb-16 lg:grid-cols-12 lg:gap-16",
          )}
        >
          <div className="lg:col-span-6">
            <p
              className="work-k font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary"
              style={{ "--i": 0 } as CSSProperties}
            >
              {heading}
              <span className="mx-3 text-muted-foreground-faint">·</span>
              <span className="text-muted-foreground">{dictionary.indexHeading}</span>
            </p>
            <h3 className="mt-6 max-w-[12ch] font-display text-[clamp(2.4rem,6.4vw,5rem)] font-medium leading-[0.94] tracking-[-0.05em] text-foreground">
              <TitleWords text={dictionary.viewAll} start={1} />
            </h3>
            <p
              className={cn("work-k mt-6 max-w-[38ch]", TEXT.lead)}
              style={{ "--i": 5 } as CSSProperties}
            >
              {dictionary.listLead}
            </p>
            <div className="work-k mt-8" style={{ "--i": 6 } as CSSProperties}>
              <Link href={viewAllHref} className={cn(BUTTON.primary, "group")}>
                <span>{dictionary.back}</span>
                <span
                  className="ml-2 inline-block transition-transform duration-150 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {moreProjects.length > 0 ? (
            <ul className="divide-y divide-border border-y border-border lg:col-span-6">
              {moreProjects.map((project, index) => (
                <li
                  key={project.slug}
                  className="work-k"
                  style={{ "--i": 3 + index } as CSSProperties}
                >
                  <WorkCardLink
                    href={`/${lang}/work/${project.slug}`}
                    slug={project.slug}
                    className="work-index-row group flex items-center gap-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <div className="w-[7.25rem] shrink-0 overflow-clip border border-border-strong sm:w-36">
                      <MediaFrame
                        src={project.resolvedCoverImage}
                        alt={project.title[lang]}
                        label={dictionary.cover}
                        slot={project.mediaSlot}
                        aspectClassName="aspect-[16/10]"
                        sizes="160px"
                        className="work-card-media w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                        <span className="font-bold text-primary">
                          {dictionary.pillars[project.pillar]}
                        </span>
                        <span className="mx-2 text-muted-foreground-faint">·</span>
                        <span>{formatMonth(project.started, lang)}</span>
                      </p>
                      <p className="mt-1.5 font-display text-lg font-medium tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary sm:text-xl">
                        {project.title[lang]}
                      </p>
                    </div>
                    <span
                      className="hidden text-primary transition-transform duration-150 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1 sm:inline"
                      aria-hidden
                    >
                      →
                    </span>
                  </WorkCardLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
