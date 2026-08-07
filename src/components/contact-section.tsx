import type { Dictionary } from "@/app/[lang]/dictionaries";
import { GITHUB_URL, HUGGINGFACE_URL, engagement, profile } from "@/content/profile";
import { BUTTON, CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";

/**
 * Two blocks, not one message. A freelance buyer wants scope, capacity and a
 * price floor; someone hiring wants to know whether he is movable at all.
 * Merging them produces copy that answers neither.
 *
 * Left-aligned, unlike the centred closing statement it replaces: this section
 * now carries structured detail, and centred text with four facts in it reads
 * as a poster rather than something to act on.
 */
export function ContactSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["contact"];
}) {
  const capacity = dictionary.freelanceCapacity
    .replace("{from}", String(engagement.hoursPerWeek.from))
    .replace("{to}", String(engagement.hoursPerWeek.to));

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
      <div className={CONTAINER}>
        <div data-anim="reveal-head">
          <h2 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-medium leading-[1.05] tracking-tight">
            <RedactLine>{dictionary.heading}</RedactLine>
          </h2>
        </div>

        <div data-anim="stagger" className="mt-14 grid gap-12 border-t border-border pt-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <p className={EYEBROW}>{dictionary.freelanceHeading}</p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>
              {dictionary.freelanceScope}
            </p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>{capacity}</p>

            {/* Omitted entirely until a real figure exists. A placeholder rate
             * is worse than no rate. */}
            {engagement.projectMinimumUsd ? (
              <p className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                {dictionary.freelanceRate.replace(
                  "{minimum}",
                  engagement.projectMinimumUsd.toLocaleString("en-US"),
                )}
              </p>
            ) : null}

            <p className={cn("mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
              {dictionary.freelanceResponse.replace("{hours}", String(engagement.responseHours))}
            </p>
          </div>

          <div>
            <p className={EYEBROW}>{dictionary.fulltimeHeading}</p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>
              {dictionary.fulltimeBody}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className={BUTTON.primary}>
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            rel="me noreferrer"
            target="_blank"
            aria-label="LinkedIn (opens in a new tab)"
            className={BUTTON.secondary}
          >
            LinkedIn
          </a>
          <a
            href={GITHUB_URL}
            rel="me noreferrer"
            target="_blank"
            aria-label="GitHub (opens in a new tab)"
            className={BUTTON.secondary}
          >
            GitHub
          </a>
          <a
            href={HUGGINGFACE_URL}
            rel="me noreferrer"
            target="_blank"
            aria-label="Hugging Face (opens in a new tab)"
            className={BUTTON.secondary}
          >
            Hugging Face
          </a>
        </div>

        <p className={cn("mt-8 font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
          {profile.location[lang]}
        </p>
      </div>
    </section>
  );
}
