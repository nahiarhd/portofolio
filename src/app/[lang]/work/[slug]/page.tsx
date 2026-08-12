import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaFrame } from "@/components/media-frame";
import { withRedactions } from "@/components/redaction";
import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, SURFACE, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import { LOCALES, isLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { mediaDropHint, resolveMediaList, resolvePublicMedia } from "@/lib/public-media";
import { stripRedactionMarkers } from "@/lib/redaction";
import { cn } from "@/lib/utils";

import { getDictionary } from "../../dictionaries";

type Params = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  return LOCALES.flatMap((lang) => projects.map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);
  if (!isLocale(lang) || !project) return {};

  return buildPageMetadata({
    lang,
    pathAfterLocale: `/work/${project.slug}`,
    title: project.title[lang],
    description: stripRedactionMarkers(project.summary[lang]),
    ogType: "article",
  });
}

export default async function CaseStudyPage({ params }: Params) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  const dictionary = await getDictionary(lang);
  const copy = dictionary.work;
  const coverSrc = resolvePublicMedia(project.coverImage);
  const frames = resolveMediaList(project.screenshots);

  const sections: { label: string; body: string; outcome?: boolean }[] = [
    { label: copy.problem, body: project.problem[lang] },
    { label: copy.role, body: project.role[lang] },
    { label: copy.outcome, body: project.outcome[lang], outcome: true },
  ];

  return (
    <main id="content" className="flex-1 pb-24 pt-28 sm:pb-32 sm:pt-32">
      <div className={CONTAINER}>
        <Link
          href={`/${lang}/work`}
          className={cn(
            "inline-flex min-h-10 items-center font-mono text-eyebrow uppercase tracking-[0.14em]",
            TEXT.subtle,
            "transition-colors hover:text-primary",
          )}
        >
          ← {copy.back}
        </Link>

        {/* The one page family without redaction bars — it develops through
         * a line mask instead (scroll-choreography `mask-in`). */}
        <header className="mt-8 max-w-[40rem]" data-anim="mask-in">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={cn(
                "font-mono text-eyebrow uppercase tracking-[0.14em]",
                project.pillar === "ai" ? "text-primary" : TEXT.faint,
              )}
            >
              {copy.pillars[project.pillar]}
            </span>
            <span className={cn("font-mono text-eyebrow uppercase tracking-[0.14em]", TEXT.faint)}>
              {formatMonth(project.started, lang)}
            </span>
            {project.confidential ? (
              <span className="chapter-stamp chapter-stamp--classified !text-[0.55rem]">
                {copy.confidential}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 font-display text-title font-normal tracking-tight">
            {project.title[lang]}
          </h1>
          <p className={cn("mt-5 max-w-[52ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}>
            {project.confidential
              ? withRedactions(project.summary[lang], copy.redacted, copy.redactedAnnounced)
              : project.summary[lang]}
          </p>
        </header>
      </div>

      {/* Cover is the primary media beat — full container width, not a small inset.
       * `media-in` develops it on entry: frame clips open, image settles. */}
      <div className={`${CONTAINER} mt-12`} data-anim="media-in">
        <MediaFrame
          src={coverSrc}
          alt={project.title[lang]}
          label={copy.cover}
          slot={mediaDropHint(project.coverImage)}
          aspectClassName="aspect-[16/9] sm:aspect-[21/9]"
          priority
          sizes="100vw"
          className="w-full max-w-none rounded-2xl border-border"
        />
        {process.env.NODE_ENV !== "production" ? (
          <p className={cn("mt-2 font-mono text-[0.65rem]", TEXT.faint)}>{copy.mediaHint}</p>
        ) : null}
      </div>

      {/* Frames: secondary strip under cover — smaller, equal cells, not a second gallery title dump. */}
      {frames.length > 0 ? (
        <section className={`${CONTAINER} mt-4`} aria-label={copy.frames}>
          <div
            data-anim="stagger"
            className={cn(
              "grid gap-3",
              frames.length === 1 ? "max-w-xl grid-cols-1" : "sm:grid-cols-2",
            )}
          >
            {frames.map((src, index) => (
              <MediaFrame
                key={src}
                src={src}
                alt={`${project.title[lang]} ${copy.frame} ${index + 1}`}
                label={`${copy.frame} ${String(index + 1).padStart(2, "0")}`}
                aspectClassName="aspect-[16/10]"
                sizes="(max-width: 768px) 100vw, 50vw"
                // Frames carry architecture diagrams, and `cover` crops them.
                objectFit="contain"
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className={`${CONTAINER} mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14`}>
        <div data-anim="stagger" className="divide-y divide-border/70 border-y border-border/70">
          {sections.map((section) => (
            <section key={section.label} className="py-8 sm:py-10">
              <p className={EYEBROW}>{section.label}</p>
              {section.outcome ? (
                /* The payoff gets display type and the accent bar — a case
                 * study's outcome is its pull quote, not another paragraph. */
                <p className="mt-4 max-w-[56ch] border-l-2 border-primary pl-5 font-display text-lead font-medium leading-snug tracking-tight text-foreground sm:text-heading">
                  {section.body}
                </p>
              ) : (
                <p className="mt-4 max-w-[62ch] text-base leading-relaxed sm:text-lead">
                  {section.body}
                </p>
              )}
            </section>
          ))}
        </div>

        <aside data-anim="stagger" className="lg:sticky lg:top-28 lg:self-start">
          <div className={cn(SURFACE.flat, "p-5")}>
            <h2 className={cn(EYEBROW, "mb-4")}>{copy.stack}</h2>
            <ul className="flex flex-col gap-2.5">
              {project.stack.map((item) => (
                <li
                  key={item}
                  className="border-b border-border/50 pb-2.5 font-mono text-eyebrow last:border-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {project.links ? (
            <div className="mt-4 flex flex-col gap-2 px-1">
              {project.links.repo ? (
                <a
                  href={project.links.repo}
                  rel="noreferrer"
                  target="_blank"
                  className="text-sm text-primary underline decoration-primary/30 underline-offset-4"
                >
                  Repository
                </a>
              ) : null}
              {project.links.live ? (
                <a
                  href={project.links.live}
                  rel="noreferrer"
                  target="_blank"
                  className="text-sm text-primary underline decoration-primary/30 underline-offset-4"
                >
                  Live
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
