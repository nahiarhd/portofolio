/**
 * Minimal markdown for assistant replies. Deliberately small: no raw HTML,
 * no images, no links — the model is not a CMS, and untrusted markup must
 * never reach the DOM as HTML.
 *
 * Supported: paragraphs, soft line breaks, unordered/ordered lists,
 * **strong**, *em*, `code`.
 */

export type MdInline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string };

export type MdBlock =
  | { type: "p"; inlines: MdInline[] }
  | { type: "ul"; items: MdInline[][] }
  | { type: "ol"; items: MdInline[][] };

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

export function parseInlines(source: string): MdInline[] {
  if (!source) return [];
  const out: MdInline[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) {
      out.push({ type: "text", value: source.slice(last, index) });
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      out.push({ type: "strong", value: token.slice(2, -2) });
    } else if (token.startsWith("*") && token.endsWith("*")) {
      out.push({ type: "em", value: token.slice(1, -1) });
    } else if (token.startsWith("`") && token.endsWith("`")) {
      out.push({ type: "code", value: token.slice(1, -1) });
    }
    last = index + token.length;
  }
  if (last < source.length) {
    out.push({ type: "text", value: source.slice(last) });
  }
  return out;
}

const UL = /^[-*]\s+(.+)$/;
const OL = /^\d+[.)]\s+(.+)$/;

function flushParagraph(lines: string[], blocks: MdBlock[]): void {
  if (lines.length === 0) return;
  // Soft breaks: single newlines inside a paragraph become spaces so streaming
  // mid-sentence wraps don't read as hard breaks.
  const text = lines.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return;
  blocks.push({ type: "p", inlines: parseInlines(text) });
  lines.length = 0;
}

export function parseChatMarkdown(source: string): MdBlock[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const blocks: MdBlock[] = [];
  const para: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: MdInline[][] = [];

  const flushList = () => {
    if (!listKind || listItems.length === 0) {
      listKind = null;
      listItems = [];
      return;
    }
    blocks.push({ type: listKind, items: listItems });
    listKind = null;
    listItems = [];
  };

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(para, blocks);
      flushList();
      continue;
    }

    const ul = trimmed.match(UL);
    const ol = trimmed.match(OL);

    if (ul) {
      flushParagraph(para, blocks);
      if (listKind && listKind !== "ul") flushList();
      listKind = "ul";
      listItems.push(parseInlines(ul[1] ?? ""));
      continue;
    }

    if (ol) {
      flushParagraph(para, blocks);
      if (listKind && listKind !== "ol") flushList();
      listKind = "ol";
      listItems.push(parseInlines(ol[1] ?? ""));
      continue;
    }

    flushList();
    para.push(trimmed);
  }

  flushParagraph(para, blocks);
  flushList();
  return blocks;
}
