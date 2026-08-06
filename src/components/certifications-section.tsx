import type { Dictionary } from "@/app/[lang]/dictionaries";
import { certifications } from "@/content/profile";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
import { RedactLine } from "./redact-line";

/**
 * Ruled rows, not a card grid. Five credentials in a three-column grid always
 * ends on an empty cell, and a certificate is one line of information.
 */
export function CertificationsSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["certifications"];
}) {
  return (
    <section id="certifications" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight">
          <RedactLine>{dictionary.heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.lead}
        </p>
      </div>

      <ul data-anim="stagger" className="mt-14">
        {certifications.map((certification) => (
          <li
            key={certification.name}
            className="group border-t border-border transition-colors duration-300 last:border-b hover:border-primary"
          >
              <article className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:gap-8">
                <MediaFrame
                  src={resolvePublicMedia(certification.image)}
                  alt=""
                  label={dictionary.certificate}
                  slot={mediaDropHint(certification.image)}
                  aspectClassName="aspect-[8/5]"
                  sizes="10rem"
                  className="w-40 shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:-translate-y-0.5"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-medium leading-snug tracking-tight sm:text-xl">
                    {certification.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {certification.issuer}
                    {certification.issued
                      ? ` · ${formatMonth(certification.issued, lang)}`
                      : null}
                  </p>
                  {certification.credentialId ? (
                    <p className={cn("mt-2 break-all font-mono text-[0.65rem]", TEXT.faint)}>
                      {dictionary.credentialId}: {certification.credentialId}
                    </p>
                  ) : null}
                </div>

                {certification.verifyUrl ? (
                  <a
                    href={certification.verifyUrl}
                    rel="noreferrer"
                    target="_blank"
                    className={cn(
                      "shrink-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary",
                      "transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    )}
                  >
                    {dictionary.verify} &#8599;
                    <span className="sr-only"> ({certification.name}, opens in a new tab)</span>
                  </a>
                ) : null}
              </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
