/** Content marker — never a real secret. Stripped for plain-text surfaces. */
export const REDACTION_MARKER = "{{redacted}}";

/** Plain-text surfaces (chat, shelf, metadata) — never leak the marker. */
export function stripRedactionMarkers(text: string, replacement = "…"): string {
  return text.split(REDACTION_MARKER).join(replacement);
}
