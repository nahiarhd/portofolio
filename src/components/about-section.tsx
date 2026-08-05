import type { Dictionary } from "@/app/[lang]/dictionaries";
import { education, experience } from "@/content/profile";
import { CONTAINER, EYEBROW, SECTION, TEXT } from "@/lib/design";
import { formatRange } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
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
    <section id="about" className={`${CONTAINER} ${SECTION}`}>
      <Reveal>
        <h2 className="font-display text-title font-semibold tracking-tight">{heading}</h2>
      </Reveal>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)] lg:gap-16">
        <Reveal>
          <div>
            <h3 className={cn(EYEBROW, "mb-8")}>{dictionary.experience}</h3>
            <ol className="relative space-y-12 border-l border-border pl-6 sm:pl-8">
              {experience.map((entry) => (
                <li key={`${entry.organization}-${entry.start}`} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.54rem] top-1.5 size-2 rounded-full bg-primary sm:-left-[2.05rem]"
                  />
                  <p className={cn("font-mono text-eyebrow", TEXT.faint)}>
                    {formatRange(entry.start, entry.end, lang, dictionary.present)} ·{" "}
                    {entry.location}
                  </p>
                  <p className="mt-2 font-display text-lg font-medium tracking-tight">
                    {entry.role[lang]}
                  </p>
                  <p className={cn("text-sm", TEXT.subtle)}>{entry.organization}</p>
                  <ul className={cn("mt-4 space-y-2 text-sm leading-relaxed", TEXT.subtle)}>
                    {entry.highlights.map((highlight) => (
                      <li key={highlight.en}>{highlight[lang]}</li>
                    ))}
                  </ul>

                  {entry.photo ? (
                    <MediaFrame
                      src={entry.photo.src}
                      alt={entry.photo.alt[lang]}
                      label="Team"
                      aspectClassName="aspect-[3/2]"
                      className="mt-5 max-w-md rounded-xl"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h3 className={cn(EYEBROW, "mb-6")}>{dictionary.education}</h3>
            <div className="space-y-8 border-t border-border pt-6">
              {education.map((entry) => (
                <div key={entry.institution}>
                  <p className={cn("font-mono text-eyebrow", TEXT.faint)}>
                    {formatRange(entry.start, entry.end, lang, dictionary.present)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{entry.institution}</p>
                  <p className={cn("mt-1 text-sm", TEXT.subtle)}>{entry.degree[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
