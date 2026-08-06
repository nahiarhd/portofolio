import type { Dictionary } from "@/app/[lang]/dictionaries";
import { education, experience } from "@/content/profile";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import { formatRange } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
import { RedactLine } from "./redact-line";

/**
 * Ruled editorial list rather than cards: the work section already owns the
 * card layout, and a CV reads better as dated rows than as tiles.
 */
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
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight">
          <RedactLine>{heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.lead}
        </p>
      </div>

      <ol data-anim="stagger" className="mt-16">
        {experience.map((entry) => (
          <li key={`${entry.organization}-${entry.start}`} className="border-t border-border">
              <article className="grid gap-4 py-10 sm:gap-8 md:grid-cols-12">
                <div className="md:col-span-4 lg:col-span-3">
                  <p
                    className={cn(
                      "font-mono text-eyebrow uppercase tracking-[0.14em]",
                      TEXT.faint,
                    )}
                  >
                    {formatRange(entry.start, entry.end, lang, dictionary.present)}
                  </p>
                  <p className={cn("mt-1.5 text-sm", TEXT.faint)}>{entry.location}</p>
                </div>

                <div className="md:col-span-8 lg:col-span-9">
                  <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                    {entry.role[lang]}
                  </h3>
                  <p className={cn("mt-1.5 text-base", TEXT.subtle)}>{entry.organization}</p>

                  <ul
                    className={cn(
                      "mt-6 grid gap-x-10 gap-y-3 text-sm leading-relaxed sm:grid-cols-2",
                      TEXT.subtle,
                    )}
                  >
                    {entry.highlights.map((highlight) => (
                      <li key={highlight.en} className="flex gap-3">
                        <span
                          className="mt-2.5 h-px w-3 shrink-0 bg-border-strong"
                          aria-hidden
                        />
                        <span>{highlight[lang]}</span>
                      </li>
                    ))}
                  </ul>

                  {entry.photo ? (
                    <MediaFrame
                      src={resolvePublicMedia(entry.photo.src)}
                      alt={entry.photo.alt[lang]}
                      label={dictionary.photo}
                      slot={mediaDropHint(entry.photo.src)}
                      aspectClassName="aspect-[3/2]"
                      sizes="(max-width: 768px) 100vw, 28rem"
                      className="mt-8 max-w-md"
                    />
                  ) : null}
                </div>
              </article>
          </li>
        ))}
      </ol>

      {/* Same two-column measure as the experience rows above, so a single
       * education entry does not sit in a three-column grid with two holes. */}
      <div>
        <div className="grid gap-4 border-t border-border py-10 sm:gap-8 md:grid-cols-12">
          <h3
            className={cn(
              "font-mono text-eyebrow uppercase tracking-[0.14em] md:col-span-4 lg:col-span-3",
              TEXT.faint,
            )}
          >
            {dictionary.education}
          </h3>
          <div className="grid gap-8 md:col-span-8 sm:grid-cols-2 lg:col-span-9">
            {education.map((entry) => (
              <div key={entry.institution}>
                <p className="font-display text-xl font-medium tracking-tight">
                  {entry.institution}
                </p>
                <p className={cn("mt-1 text-sm", TEXT.subtle)}>{entry.degree[lang]}</p>
                <p
                  className={cn(
                    "mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em]",
                    TEXT.faint,
                  )}
                >
                  {formatRange(entry.start, entry.end, lang, dictionary.present)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
