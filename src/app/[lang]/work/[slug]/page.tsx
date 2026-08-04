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
    <main id="content" className={`${CONTAINER} flex-1 py-28 sm:py-32`}>
      <Link
        href={`/${lang}#work`}
        className={cn(EYEBROW, "transition-colors hover:text-primary")}
      >
        ← {copy.back}
      </Link>

      <header className="mt-10 max-w-[42rem]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="hud-pulse size-1.5 rounded-full bg-primary" aria-hidden />
          <span className={EYEBROW}>
            {copy.pillars[project.pillar]} · {formatMonth(project.started, lang)}
          </span>
          {project.confidential ? (
            <span
              className={cn(
                EYEBROW,
                "rounded-full border border-border px-2 py-0.5 text-primary/90",
              )}
            >
              {copy.confidential}
            </span>
          ) : null}
        </div>

        <h1 className="mt-5 font-display text-title font-semibold tracking-tight text-glow">
          {project.title[lang]}
        </h1>
        <p className={cn("mt-6 text-lead", TEXT.subtle)}>{project.summary[lang]}</p>
      </header>

      <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <section key={section.label} className={cn(SURFACE.panel, "p-6 sm:p-8")}>
              <p className={cn(EYEBROW, "text-primary/90")}>
                {String(index + 1).padStart(2, "0")} · {section.label}
              </p>
              <p className="mt-4 max-w-[62ch] text-lead leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className={cn(SURFACE.panelStrong, "p-5")}>
            <h2 className={cn(EYEBROW, "mb-4 text-primary/90")}>{copy.stack}</h2>
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
