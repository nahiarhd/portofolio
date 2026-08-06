# Editorial portfolio

**Status:** active (2026-08-05)
**Supersedes:** the dark violet reading of this doc, and the declassified-dossier
paper/ink alternation for the homepage chrome.

## Correction, 2026-08-05

An earlier revision of this doc described the reference site
(`noema-ai-studio-74.aura.build`) as a "dark cinematic void" with a violet
`#c084fc` signal. **That reading was wrong.** The reference is a light
bone-and-black editorial page, Inter throughout, no accent colour, roughly
18,800px tall. The site was built on the incorrect reading and inherited both an
AI-purple palette and the template's copy verbatim
("Independent creative intelligence", "Enter the system").

The reference is also full of the patterns worth avoiding: section-number
eyebrows, a locale/coordinates strip, scroll cues, version stamps, three
marquees. It is a useful reference for *ambition*, not for detail.

## Design read

Developer portfolio for recruiters and engineering managers. Editorial
bone-and-ink language. One WebGL moment, everything readable without it.

Dials: `DESIGN_VARIANCE 7 · MOTION_INTENSITY 5 · VISUAL_DENSITY 3`.

## Visual system

| Role | Choice |
| --- | --- |
| Ground | Newsprint bone `#e4e1d8` |
| Ink | Warm near-black `#1a1813` |
| Signal | Cobalt `#1c39bb` — interactive and emphasis only |
| Confidentiality | Oxide `#a8321f` — the NDA stamp and nothing else |
| Display + body | Outfit (the reference uses Inter; this does not) |
| Meta | Space Mono |
| Shape | Plates and cards square, interactive controls pill |

Two colours with two jobs that never swap. Oxide is semantic state, so it does
not count against the one-accent rule.

Theme is locked to light. `color-scheme: light` keeps native controls in step
for readers whose OS prefers dark.

## Stages

1. **Hero** — asymmetric split, type left, framed grayscale portrait right.
   Server component; the entrance is a CSS cascade, so nothing above the fold
   waits on hydration.
2. **Selected work** — full-viewport WebGL plate rail. Linear layout, unlit
   materials, two trailing plates. Titles and controls are always DOM.
3. **All work** — 2-column grid, six projects filling 3x2 exactly.
4. **Ask / About / Certifications / Contact** — About and Certifications are
   ruled lists, not cards, so they do not repeat the work grid's layout family.

## Placeholder media

`scripts/generate-media-stubs.mjs` writes every plate under `public/`. They are
typographic ink plates rather than invented product screenshots: four of the six
case studies are under an NDA and can never show real UI, so the fallback has to
carry the page permanently. Each plate carries a line the surrounding markup
does not already print, so nothing renders the same string twice.

Drop a real file with the same base name and `resolvePublicMedia` prefers it.

## Constraints

- Works with the chat closed and WebGL blocked.
- `prefers-reduced-motion`: no entrance, DOM plate instead of the canvas.
- Bilingual en/id. The hero headline holds two lines in **both** locales at
  every width; Indonesian runs longer, which is why the display clamp uses a low
  viewport coefficient.
- No employer, product, or client names.
- One WebGL scene on the homepage, unlit, dpr capped.
