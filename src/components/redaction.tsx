import { Fragment } from "react";

import { REDACTION_MARKER } from "@/lib/redaction";

/**
 * Theatrical redaction bar. Nothing real is ever behind it — hover/focus
 * (and reduced-motion) show the NDA label only. See docs/ideas/declassified-dossier.md.
 */
function Redaction({ label }: { label: string }) {
  return (
    <span className="redaction" tabIndex={0}>
      <span className="redaction__bar" aria-hidden>
        ████████
      </span>
      <span className="redaction__label" aria-hidden>
        [{label}]
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Split content on `{{redacted}}` and interleave redaction bars. */
export function withRedactions(text: string, label: string) {
  if (!text.includes(REDACTION_MARKER)) return text;

  const parts = text.split(REDACTION_MARKER);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <Redaction label={label} /> : null}
    </Fragment>
  ));
}
