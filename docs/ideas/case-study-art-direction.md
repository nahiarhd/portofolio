# Case Study Art Direction

> Image direction for the six case study covers. Produced via
> `imagegen-frontend-web`, 2026-08-06. Palette locked to the ink/paper system
> committed in `feat(design): invert to ink ground with a paper hero`.
>
> **These are prompts, not images.** This session had no image-generation tool.
> Run each prompt in whichever model you use; the direction is what matters and
> it is model-agnostic.

## What this replaces

Every current cover is stock photography from Pexels — see
`public/work/CREDITS.md`. A concrete building, an audio studio, a library, a
road at night, a solar farm, a tunnel. Two problems:

1. **The metaphors are literal.** Documents → a library. Media → a recording
   studio. An engineer reads that as filler, and the audience for this site is
   engineers.
2. **They are stock.** Nothing about them is this work.

Every `01.svg` / `02.svg` frame is also a 596-byte generated placeholder — a
flat rect with a pillar label. Those are **not** covered by this document.
They should be authored architecture diagrams as SVG, not generated raster art:
a generated "system diagram" produces garbled labels and invented boxes. See
the open question at the end.

---

## Locked system

Everything below stays constant across all six. Variation happens in
composition and crop, never in brand.

| Axis | Locked choice |
|---|---|
| Theme paradigm | Deep dark — the page ground is `#0d0c0b` |
| Background character | Subtle technical grid / measured field |
| Typography character | Swiss rational, very strong hierarchy (matches Outfit + Space Mono in the stack) |
| Narrative spine | **Archive / dossier** — indexed, captioned, understated authority |
| Second-read moment | A narrow vertical side-rail, used **once** across the set (on `agent-orchestration`) |

**Why archive/dossier.** Four of six case studies are genuinely redacted. A
dossier is the one framing where redaction is native rather than apologetic —
the black bar belongs in a dossier. It also matches the existing
`.chapter-stamp` and `.redaction` language already in `globals.css`.

### Palette (do not deviate)

```
ink       #0d0c0b   ground
paper     #ffffff   hero chapter only
violet    #5a189a   accent on paper
violet    #b883ec   accent on ink — the covers sit on ink, so use this one
oxide     #e8674f   confidentiality only, never decorative
```

Images are **greyscale plus one accent**. The accent is `#b883ec`, used at most
once per image, on a single element. If an image needs two accents it is wrong.

### Global negative constraints

Append to every prompt:

> No text, no lettering, no numerals, no logos, no watermarks, no UI chrome, no
> readable labels. No people, no faces, no hands. No purple-to-blue tech
> gradient, no glowing orbs, no floating blobs, no neon rim light, no
> holographic surfaces, no circuit-board cliché, no glass panels floating in
> space.

**Text is banned for a reason beyond taste.** Generated lettering hallucinates,
and a hallucinated word on an NDA-bound case study is a confidentiality
incident, not a cosmetic bug. Every label on these cards is already real DOM.

---

## The six

Aspect **16:10**, matching `aspectClassName="aspect-[16/10]"` in
`work-index.tsx`. Deliver at ≥2000px wide, greyscale-graded, then drop to
`public/work/<slug>/cover.jpg`. `resolvePublicMedia` picks it up with no
content edit.

### 1 · `agent-orchestration` — Closed-loop agents behind the firewall

*Composition anchor: off-grid editorial offset. Carries the set's one
second-read moment — a narrow vertical rail down the right third.*

> Macro photograph of a machined aluminium bulkhead panel, matte anodised,
> shot at a raking angle so a single hairline seam runs the full height of the
> frame slightly off-centre. Shallow depth of field. Cold neutral grey, high
> micro-contrast, visible brushed grain in the metal. One recessed indicator
> port glows a muted violet, small, in the lower third. Studio lighting from
> hard left. Editorial product photography, not sci-fi.

**Why:** a closed loop behind a firewall is a *sealed boundary*. The seam is the
boundary; the single lit port is the one thing that crosses it.

---

### 2 · `ai-service-interfaces` — Streaming UIs for long AI jobs

*Composition anchor: image-as-canvas, quiet centre-left mass.*

> Long-exposure photograph of fine parallel filaments of light drawn across a
> matte black field, horizontal, slightly uneven in length — some complete,
> some trailing off mid-frame. Monochrome except one filament rendered in soft
> violet. Deep black background, no vignette, no bloom. Feels like a plotted
> measurement, not a light show. Fine grain.

**Why:** streaming is *partial arrival*. Unequal filament lengths say
"in progress" without a spinner or a fake progress bar.

---

### 3 · `document-ingestion` — Scan-to-structure document retrieval

*Composition anchor: top-left lead, mass falling to bottom-right.*

> Overhead macro of a dense stack of paper seen edge-on, filling the frame
> diagonally, every sheet edge crisp and individually resolved. Raking light
> from the left throws fine shadows between sheets. Cool neutral greyscale,
> paper texture clearly visible. One sheet edge deep in the stack catches a
> violet light. Sharp front to back.

**Why:** the work is turning an undifferentiated mass into addressable
structure. Edge-on, every sheet is individually resolved — that *is* the
product. Avoids the library cliché the current cover uses.

---

### 4 · `media-processing` — From recording to structured brief

*Composition anchor: centred low, generous top space.*

> Macro photograph of magnetic tape spooled loosely on a matte dark surface,
> the ribbon catching light along its length so it reads as a continuous
> curved line. Extreme shallow focus — one short segment sharp, the rest
> falling away. Monochrome, warm-neutral grade, fine grain. A single violet
> reflection on the sharp segment.

**Why:** a long recording reduced to the one part that matters. The focal
falloff is the compression, stated optically.

---

### 5 · `carbon-credit-tokenization` — Permissioned chain

*Composition anchor: stacked centre, near-symmetrical. The calmest frame in the
set — this is the mini-minimalist beat.*

> Overhead photograph of identical small machined metal blanks arranged in a
> precise grid on a matte dark surface, evenly lit, minimal shadow. Every
> blank identical, uniformly spaced, fully in focus. One blank near centre is
> anodised violet. Flat, catalogued, specimen-like. Cool greyscale.

**Why:** a token is a fungible unit on a permissioned ledger. Identical blanks
in a fixed grid, one marked. No blockchain-cube cliché, no chain links.

---

### 6 · `social-media-analytics` — Analytics website

*Composition anchor: bottom-left mass, open upper right.*

> Macro photograph of layered translucent vellum sheets stacked at slight
> offsets on a dark ground, edges overlapping so density builds where they
> coincide. Soft directional light. Monochrome, cool grade. The densest
> overlap region tinted faint violet. Tactile paper texture, no digital
> artefacts.

**Why:** analytics is accumulated overlap becoming legible. Physical layering
instead of a fake dashboard — the site should never show invented charts.

---

## Rhythm check

The six are deliberately not uniform:

- **Dense / high-detail:** 3 (paper stack), 6 (vellum layers)
- **Mid editorial:** 1 (bulkhead), 4 (tape)
- **Minimal / calm:** 2 (filaments), 5 (blank grid)

Anchors used: off-grid, image-as-canvas, top-left, centred-low, stacked-centre,
bottom-left — six distinct anchors, no repeat.

Materials used: metal, light, paper, tape, metal, paper. Two metal and two
paper frames, deliberately separated in the grid order so they never sit
adjacent. `work-index.tsx` sorts by pillar then date — check the rendered order
before shipping and swap a material if two of a kind land side by side.

---

## Open question — the twelve placeholder frames

`01.svg` and `02.svg` in all six folders are 596-byte generated placeholders.
They are the larger credibility gap and they are **not** solved by this
document.

They should be authored as SVG architecture diagrams, palette-locked to these
tokens, and probably typed into `src/content/` rather than dropped as static
assets — so the chatbot can describe an architecture as well as the page can
draw it. That decision is still open in
[`operator-console-rebuild.md`](./operator-console-rebuild.md).

Recommendation stands from that one-pager: **author exactly one** — for
`document-ingestion` — and see whether it reads as real engineering or as
generic boxes-and-arrows before committing to six.
