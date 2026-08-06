/**
 * Regenerates the placeholder plates under `public/`.
 *
 * These are stubs by design: the AI case studies are covered by an NDA and
 * cannot show real product UI, so the fallback has to carry the page on its
 * own. They are typographic plates rather than invented product screenshots.
 * Drop a real file with the same base name and `resolvePublicMedia` prefers it.
 *
 * Run: node scripts/generate-media-stubs.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// Ink plate on the bone page. Values mirror globals.css.
const INK = "#1a1813";
const PAPER = "#f5f4f0";
const COBALT = "#5f78e8"; // lifted from --primary for legibility on ink
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const MONO = "ui-monospace, 'Space Mono', monospace";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Greedy wrap so long titles never overflow the plate. */
function wrap(text, maxChars) {
  const out = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > maxChars) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

function plate({ w, h, kicker, title, titleSize, pad }) {
  const lines = wrap(title, Math.floor((w - pad * 2) / (titleSize * 0.52)));
  const blockH = lines.length * titleSize * 1.08;
  const baseY = h - pad - blockH + titleSize;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${pad}" y="${baseY + i * titleSize * 1.08}">${esc(line)}</tspan>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
  <rect width="${w}" height="${h}" fill="${INK}"/>
  <path d="M${pad} ${pad}H${w - pad}" stroke="${COBALT}" stroke-width="3"/>
  <text x="${pad}" y="${pad + titleSize * 0.62}" fill="${COBALT}" font-family="${MONO}" font-size="${Math.round(titleSize * 0.34)}" letter-spacing="${Math.round(titleSize * 0.09)}">${esc(kicker)}</text>
  <text fill="${PAPER}" font-family="${SANS}" font-size="${titleSize}" font-weight="500" letter-spacing="${-titleSize * 0.03}">${tspans}</text>
</svg>
`;
}

/**
 * The plate line is a short descriptor, deliberately NOT the project title:
 * the card underneath already prints the title, and a plate that repeats it
 * word for word reads as a rendering bug.
 */
const PROJECTS = [
  ["agent-orchestration", "AI", "Behind the firewall"],
  ["media-processing", "AI", "Recording to brief"],
  ["document-ingestion", "AI", "Scan to structure"],
  ["ai-service-interfaces", "AI", "Long-running jobs"],
  ["carbon-credit-tokenization", "BLOCKCHAIN", "Permissioned chain"],
  ["social-media-analytics", "DATA", "Analytics dashboard"],
];

/**
 * Credential plates say "Certificate", not the credential name: the row next
 * to the thumbnail already prints the name. The slug still names the file, so
 * dropping in a real scan replaces the stub without a content edit.
 */
const CERTIFICATIONS = [
  ["dataiku-generative-ai-practitioner", "Dataiku"],
  ["dataiku-ml-practitioner", "Dataiku"],
  ["dataiku-advanced-designer", "Dataiku"],
  ["dataiku-developer", "Dataiku"],
  ["msib", "Kampus Merdeka"],
];

let written = 0;
const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  written += 1;
};

for (const [slug, pillar, title] of PROJECTS) {
  write(
    join(PUBLIC, "work", slug, "cover.svg"),
    plate({ w: 1600, h: 1000, kicker: pillar, title, titleSize: 96, pad: 96 }),
  );

  // Frames say "Frame 01"/"Frame 02", not the descriptor: two plates side by
  // side on the case study page would otherwise print the same line twice.
  for (const frame of ["01", "02"]) {
    write(
      join(PUBLIC, "work", slug, `${frame}.svg`),
      plate({
        w: 1200,
        h: 750,
        kicker: pillar,
        title: `Frame ${frame}`,
        titleSize: 64,
        pad: 72,
      }),
    );
  }
}

// Filename is deliberately generic: media paths end up in the rendered `src`
// attribute, so an employer name here would leak into the page source.
write(
  join(PUBLIC, "about", "agency-team.svg"),
  plate({ w: 1200, h: 800, kicker: "PHOTO", title: "Team", titleSize: 64, pad: 72 }),
);

for (const [id, issuer] of CERTIFICATIONS) {
  write(
    join(PUBLIC, "certifications", `${id}.svg`),
    plate({
      w: 1000,
      h: 625,
      kicker: issuer.toUpperCase(),
      title: "Certificate",
      titleSize: 72,
      pad: 64,
    }),
  );
}

console.log(`Wrote ${written} placeholder plates.`);
