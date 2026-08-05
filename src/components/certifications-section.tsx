import type { Dictionary } from "@/app/[lang]/dictionaries";
import { certifications } from "@/content/profile";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
import { Reveal } from "./reveal";

export function CertificationsSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["certifications"];
}) {
  return (
    <section id="certifications" className={`${CONTAINER} ${SECTION}`}>
      <Reveal>
        <h2 className="font-display text-title font-semibold tracking-tight">
          {dictionary.heading}
        </h2>
      </Reveal>

      <ul className="mt-10 divide-y divide-border/70 border-y border-border/70">
        {certifications.map((certification) => (
          <li key={certification.name}>
            <Reveal>
              <article className="grid gap-5 py-7 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8">
                {certification.image ? (
                  <MediaFrame
                    src={certification.image}
                    alt=""
                    label={dictionary.certificate}
                    aspectClassName="aspect-[4/3]"
                    className="w-full max-w-[12rem] rounded-lg border-0 object-cover sm:max-w-none"
                  />
                ) : (
                  <div
                    className="hidden aspect-square rounded-lg border border-border bg-surface-1 sm:block"
                    aria-hidden
                  />
                )}

                <div className="min-w-0">
                  <p className={cn("font-mono text-eyebrow uppercase tracking-[0.14em]", TEXT.faint)}>
                    {certification.issuer}
                    {certification.issued
                      ? ` · ${formatMonth(certification.issued, lang)}`
                      : null}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-medium leading-snug tracking-tight">
                    {certification.name}
                  </h3>
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
                      "inline-flex min-h-10 items-center font-mono text-xs font-semibold uppercase tracking-wider text-primary",
                      "transition-opacity hover:opacity-80",
                    )}
                  >
                    {dictionary.verify} ↗
                    <span className="sr-only"> ({certification.name}, opens in a new tab)</span>
                  </a>
                ) : null}
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
