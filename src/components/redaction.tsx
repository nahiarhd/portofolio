import { Fragment } from "react";

import { REDACTION_MARKER } from "@/lib/redaction";

import { RedactionBar } from "./redaction-bar";

export { RedactionBar as Redaction } from "./redaction-bar";

/**
 * Split content on `{{redacted}}` and interleave interactive redaction bars.
 * Server-safe helper function.
 */
export function withRedactions(text: string, label: string, announced: string) {
  if (!text.includes(REDACTION_MARKER)) return text;

  const parts = text.split(REDACTION_MARKER);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <RedactionBar label={label} announced={announced} /> : null}
    </Fragment>
  ));
}
