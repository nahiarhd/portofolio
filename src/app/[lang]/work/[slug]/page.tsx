import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects } from "@/content/projects";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import { LOCALES, isLocale } from "@/lib/locale";
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

  // Content passes the confidentiality denylist test, so titles and
  // descriptions built from it are safe to publish.
  return {
    title: project.title[lang],
    description: project.summary[lang],
  };
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

      <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={EYEBROW}>
          {copy.pillars[project.pillar]} · {formatMonth(project.started, lang)}
        </span>
        {project.confidential ? (
          <span
            className={cn(EYEBROW, "rounded-sm border border-border px-1.5 py-0.5")}
          >
            {copy.confidential}
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 max-w-[20ch] text-title font-semibold">{project.title[lang]}</h1>
      <p className={cn("mt-6 max-w-[56ch] text-lead", TEXT.subtle)}>
        {project.summary[lang]}
      </p>

      <div className="mt-16 space-y-12">
        {sections.map((section) => (
          <section key={section.label}>
            <h2 className={cn(EYEBROW, "mb-4")}>{section.label}</h2>
            <p className="max-w-[62ch] text-lead">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className={cn(EYEBROW, "mb-4")}>{copy.stack}</h2>
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <li
                key={item}
                className="rounded-sm border border-border px-2.5 py-1 font-mono text-eyebrow"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Confidential work has no links by construction — enforced by the
            content integrity test, not by a check here. */}
        {project.links ? (
          <section className="flex flex-wrap gap-x-6 gap-y-2">
            {project.links.repo ? (
              <a
                href={project.links.repo}
                rel="noreferrer"
                target="_blank"
                className="text-primary underline decoration-primary/30 underline-offset-4"
              >
                Repository
              </a>
            ) : null}
            {project.links.live ? (
              <a
                href={project.links.live}
                rel="noreferrer"
                target="_blank"
                className="text-primary underline decoration-primary/30 underline-offset-4"
              >
                Live
              </a>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
