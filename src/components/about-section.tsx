import type { Dictionary } from "@/app/[lang]/dictionaries";
import { certifications, education, experience } from "@/content/profile";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
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
      className={`${CONTAINER} scroll-mt-20 border-t border-border py-16 sm:py-24`}
    >
      <Reveal>
        <h2 className="text-title font-semibold">{heading}</h2>
      </Reveal>

      <div className="mt-10 grid gap-12 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h3 className={cn(EYEBROW, "mb-6")}>{dictionary.experience}</h3>
          <ol className="space-y-8">
            {experience.map((entry) => (
              <li key={`${entry.organization}-${entry.start}`}>
                <p className={cn("font-mono text-eyebrow", TEXT.faint)}>
                  {formatRange(entry.start, entry.end, lang, dictionary.present)} ·{" "}
                  {entry.location}
                </p>
                <p className="mt-2 font-medium">{entry.role[lang]}</p>
                <p className={cn("text-sm", TEXT.subtle)}>{entry.organization}</p>
                <ul className={cn("mt-3 space-y-1.5 text-sm", TEXT.subtle)}>
                  {entry.highlights.map((highlight) => (
                    <li key={highlight.en} className="flex gap-2.5">
                      {/* Marker is a plain rule, not a bullet glyph: it lines up
                          with the hairlines used everywhere else. */}
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-px w-3 shrink-0 bg-border"
                      />
                      <span>{highlight[lang]}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className={cn(EYEBROW, "mb-6")}>{dictionary.education}</h3>
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

          <div>
            <h3 className={cn(EYEBROW, "mb-6")}>{dictionary.certifications}</h3>
            <ul className={cn("space-y-2 text-sm", TEXT.subtle)}>
              {certifications.map((certification) => (
                <li key={certification}>{certification}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
