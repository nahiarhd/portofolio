import type { Dictionary } from "@/app/[lang]/dictionaries";
import { engagement } from "@/content/profile";
import { CONTAINER } from "@/lib/design";
import type { Locale } from "@/lib/locale";

import { ContactWidget } from "./contact-widget";
import { RedactLine } from "./redact-line";
import { ScrambleText } from "./ui/scramble-text";

/**
 * Contact / Work Together Section.
 * Upgraded with live operational status radar, Jakarta timezone clock,
 * interactive email clipboard copy, and tactile magnetic actions.
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

  const freelanceRate = engagement.projectMinimumUsd
    ? dictionary.freelanceRate.replace(
        "{minimum}",
        engagement.projectMinimumUsd.toLocaleString("en-US"),
      )
    : undefined;

  const freelanceResponse = dictionary.freelanceResponse.replace(
    "{hours}",
    String(engagement.responseHours),
  );

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
      <div className={CONTAINER}>
        <div data-anim="reveal-head" className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
              <ScrambleText
                text={
                  lang === "id"
                    ? "KOLABORASI · INISIASI PROYEK"
                    : "COLLABORATION · PROJECT INITIATION"
                }
              />
            </span>
          </div>

          <h2 className="font-display text-[clamp(2.5rem,7vw,4.75rem)] font-medium leading-[1.02] tracking-tight text-balance">
            <RedactLine>{dictionary.heading}</RedactLine>
          </h2>
        </div>

        <ContactWidget
          lang={lang}
          freelanceHeading={dictionary.freelanceHeading}
          freelanceScope={dictionary.freelanceScope}
          freelanceCapacity={capacity}
          freelanceRate={freelanceRate}
          freelanceResponse={freelanceResponse}
          fulltimeHeading={dictionary.fulltimeHeading}
          fulltimeBody={dictionary.fulltimeBody}
        />
      </div>
    </section>
  );
}
