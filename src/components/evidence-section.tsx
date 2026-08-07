import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  GITHUB_URL,
  HUGGINGFACE_URL,
  certifications,
  publications,
  publishedModels,
} from "@/content/profile";
import { BUTTON, CONTAINER, EYEBROW, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
import { RedactLine } from "./redact-line";

/**
 * The answer to the site's central problem: four of six case studies are under
 * NDA and unprovable. Everything in this section is public and checkable in one
 * click, which is the only thing that converts an assertion into evidence.
 *
 * Ordered by strength, not by convention: published models first (strangers
 * chose to use them), then the paper, then code, then certifications.
 */
export function EvidenceSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["evidence"];
}) {
  return (
    <section id="evidence" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight">
          <RedactLine>{dictionary.heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.lead}
        </p>
      </div>

      {/* Models — the strongest claim, so it leads. */}
      <div data-anim="stagger" className="mt-16">
        <p className={EYEBROW}>{dictionary.modelsHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.modelsLead}
        </p>

        <ul className="mt-8 grid gap-x-8 gap-y-px sm:grid-cols-2">
          {publishedModels.map((model) => (
            <li key={model.id} className="border-t border-border">
              <a
                href={`https://huggingface.co/${model.id}`}
                rel="noreferrer"
                target="_blank"
                className="group flex items-baseline justify-between gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm text-foreground transition-colors group-hover:text-primary">
                    {model.id.replace("nahiar/", "")}
                  </span>
                  <span className={cn("mt-1 block text-sm", TEXT.subtle)}>
                    {model.task[lang]}
                    {model.baseModel ? ` · ${model.baseModel}` : null}
                  </span>
                </span>
                {model.likes ? (
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {model.likes} {dictionary.likes}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={HUGGINGFACE_URL}
          rel="noreferrer"
          target="_blank"
          className={cn(BUTTON.secondary, "mt-8")}
        >
          {dictionary.modelsAll} &#8599;
        </a>
      </div>

      {/* Publication. */}
      {publications.map((paper) => (
        <div key={paper.doi} data-anim="stagger" className="mt-20 border-t border-border pt-10">
          <p className={EYEBROW}>{dictionary.paperHeading}</p>
          <h3 className="mt-4 max-w-[46ch] font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            {paper.title}
          </h3>
          <p className={cn("mt-3 max-w-[52ch] text-sm leading-relaxed", TEXT.subtle)}>
            {paper.venue}, {paper.year} ·{" "}
            {dictionary.paperAuthor
              .replace("{position}", String(paper.authorPosition))
              .replace("{count}", String(paper.authorCount))}
          </p>
          <p className={cn("mt-4 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
            {paper.contribution[lang]}
          </p>
          <a
            href={paper.doi}
            rel="noreferrer"
            target="_blank"
            className={cn(BUTTON.secondary, "mt-6")}
          >
            {dictionary.paperRead} &#8599;
          </a>
        </div>
      ))}

      {/* Code. */}
      <div data-anim="stagger" className="mt-20 border-t border-border pt-10">
        <p className={EYEBROW}>{dictionary.codeHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.codeLead}
        </p>
        <a
          href={GITHUB_URL}
          rel="noreferrer"
          target="_blank"
          className={cn(BUTTON.secondary, "mt-6")}
        >
          github.com/raihanhd12 &#8599;
        </a>
      </div>

      {/* Certifications — ruled rows, not a card grid: a certificate is one
       * line of information, and six in a three-column grid ends on a gap. */}
      <div data-anim="stagger" className="mt-20 border-t border-border pt-10">
        <p className={EYEBROW}>{dictionary.certificationsHeading}</p>

        <ul className="mt-8">
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
      </div>
    </section>
  );
}
