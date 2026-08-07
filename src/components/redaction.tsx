import { Fragment } from "react";

import { REDACTION_MARKER } from "@/lib/redaction";

/**
 * Theatrical redaction bar. Nothing real is ever behind it — hover/focus
 * (and reduced-motion) show the NDA label only. See docs/ideas/declassified-dossier.md.
 *
 * `label` is the visual chip; `announced` is what a screen reader reads in
 * place of the concealed words. They differ on purpose: "Redacted · Nda" is
 * legible as a stamp but is announced as "Redacted, N-D-A" mid-sentence, which
 * does not parse. The announced string has to be a phrase that fits the clause.
 */
function Redaction({ label, announced }: { label: string; announced: string }) {
  return (
    <span className="redaction" tabIndex={0}>
      <span className="redaction__bar" aria-hidden>
        ████████
      </span>
      <span className="redaction__label" aria-hidden>
        [{label}]
      </span>
      <span className="sr-only">{announced}</span>
    </span>
  );
}

/** Split content on `{{redacted}}` and interleave redaction bars. */
export function withRedactions(text: string, label: string, announced: string) {
  if (!text.includes(REDACTION_MARKER)) return text;

  const parts = text.split(REDACTION_MARKER);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <Redaction label={label} announced={announced} /> : null}
    </Fragment>
  ));
}
