import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, SURFACE, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import { LOCALES, isLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
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
    description: project.summary[lang],
  });
}

export default async function CaseStudyPage({ params }: Params) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  const dictionary = await getDictionary(lang);
  const copy = dictionary.work;

  const sections = [
    { label: copy.problem, body: project.problem[lang] },
    { label: copy.role, body: project.role[lang] },
    { label: copy.outcome, body: project.outcome[lang] },
  ];

  return (
    <main id="content" className={`${CONTAINER} flex-1 py-14 sm:py-20`}>
      <Link
        href={`/${lang}#work`}
        className={cn(EYEBROW, "transition-colors hover:text-foreground")}
      >
        ← {copy.back}
      </Link>

      <header className="mt-10 max-w-[40rem]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className={EYEBROW}>
            {copy.pillars[project.pillar]} · {formatMonth(project.started, lang)}
          </span>
          {project.confidential ? (
            <span
              className={cn(
                EYEBROW,
                "rounded-sm border border-border px-1.5 py-0.5",
              )}
            >
              {copy.confidential}
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-title font-semibold tracking-tight">
          {project.title[lang]}
        </h1>
        <p className={cn("mt-6 text-lead", TEXT.subtle)}>{project.summary[lang]}</p>
      </header>

      {/* Architecture-note layout: narrative + sticky meta on wide screens. */}
      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="space-y-14">
          {sections.map((section, index) => (
            <section
              key={section.label}
              className="border-t border-border pt-10 first:border-t-0 first:pt-0"
            >
              <p className={cn(EYEBROW, "mb-1", TEXT.faint)}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className={cn(EYEBROW, "mb-4 text-foreground")}>{section.label}</h2>
              <p className="max-w-[62ch] text-lead leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={cn(SURFACE.panel, "p-4")}>
            <h2 className={cn(EYEBROW, "mb-3")}>{copy.stack}</h2>
            <ul className="flex flex-col gap-2">
              {project.stack.map((item) => (
                <li
                  key={item}
                  className="border-b border-border/60 pb-2 font-mono text-eyebrow last:border-0 last:pb-0"
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
