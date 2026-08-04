import type { Dictionary } from "@/app/[lang]/dictionaries";
import { certifications, education, experience } from "@/content/profile";
import { CONTAINER, EYEBROW, SURFACE, TEXT } from "@/lib/design";
import { formatRange } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

export function AboutSection({
  lang,
  heading,
  dictionary,
}: {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["about"];
}) {
  return (
    <section
      id="about"
      className={`${CONTAINER} scroll-mt-28 border-t border-border/60 py-24 sm:py-32`}
    >
      <Reveal>
        <h2 className="font-display text-title font-semibold tracking-tight">
          {heading}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Reveal>
          <div className={cn(SURFACE.panel, "p-6 sm:p-8")}>
            <h3 className={cn(EYEBROW, "mb-6")}>{dictionary.experience}</h3>
            <ol className="space-y-10">
              {experience.map((entry) => (
                <li key={`${entry.organization}-${entry.start}`}>
                  <p className={cn("font-mono text-eyebrow", TEXT.faint)}>
                    {formatRange(entry.start, entry.end, lang, dictionary.present)} ·{" "}
                    {entry.location}
                  </p>
                  <p className="mt-2 font-display text-lg font-medium tracking-tight">
                    {entry.role[lang]}
                  </p>
                  <p className={cn("text-sm", TEXT.subtle)}>{entry.organization}</p>
                  <ul className={cn("mt-4 space-y-2 text-sm", TEXT.subtle)}>
                    {entry.highlights.map((highlight) => (
                      <li key={highlight.en} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 size-1 shrink-0 rounded-full bg-primary/70"
                        />
                        <span>{highlight[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <div className="space-y-6">
          <Reveal>
            <div className={cn(SURFACE.panel, "p-6")}>
              <h3 className={cn(EYEBROW, "mb-5")}>{dictionary.education}</h3>
              {education.map((entry) => (
                <div key={entry.institution}>
                  <p className={cn("font-mono text-eyebrow", TEXT.faint)}>
                    {formatRange(entry.start, entry.end, lang, dictionary.present)}
                  </p>
                  <p className="mt-2 text-sm font-medium">{entry.institution}</p>
                  <p className={cn("text-sm", TEXT.subtle)}>{entry.degree[lang]}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className={cn(SURFACE.panel, "p-6")}>
              <h3 className={cn(EYEBROW, "mb-5")}>{dictionary.certifications}</h3>
              <ul className={cn("space-y-2.5 text-sm", TEXT.subtle)}>
                {certifications.map((certification) => (
                  <li key={certification} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-white/30" />
                    {certification}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
