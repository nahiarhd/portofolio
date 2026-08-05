# Ink & Signal

Colour-system rework. Decided 2026-08-05.

## Problem Statement

How might we make a portfolio that reads as expensive and credible to a paying
client — when the accent colour is doing six jobs, the loudest element on screen
is a missing-file path, and the best work can never be shown?

## The diagnosis

Purple was not "too much". Purple had **no job**, because it had all of them:

| Token | Old value | Job it was doing |
| --- | --- | --- |
| `--background` | `#07040f` | the ground was violet-black |
| `--muted-foreground` | `rgba(216,180,254,.72)` | body text was purple |
| `--muted-foreground-faint` | `rgba(167,139,250,.55)` | labels were purple |
| `--border` | `rgba(192,132,252,.16)` | every border was purple |
| `--primary` | `#c084fc` | the accent |
| grid, 2× glows, `text-glow`, `::selection` | purple | atmosphere |

An accent that colours the background, the text *and* the borders is wallpaper.
There was no neutral left to contrast against, so nothing on the page could
announce itself.

## Recommended Direction

**Strip every job from purple except one, and let true black carry the design.**

A neutral black base with a four-step elevation scale, a neutral grey type
scale, and purple on roughly 5% of pixels — only where something is live.
Depth comes from **luminance**, not tint. Previously every surface was the same
violet glass at the same value, which is why the page read flat.

### The accent rule

**Purple is the secondary colour: atmosphere, affordance, and identity marks.
Never mass — never the ground, the body text, or the borders of everything.**

The first pass of this rework got the rule wrong in the opposite direction. It
restricted purple to "live agentic behaviour only", which left roughly 2% of
pixels purple and *nothing at all above the fold* — a monochrome site, not a
black-and-purple one. The bug was never that purple existed. The bug was that
purple was the **mass**: the background, the paragraph text, every border.

The working distinction is mass vs. detail:

| Purple (detail) | Neutral (mass) |
| --- | --- |
| ambient glows, grid lines | the page ground |
| the hero name byline | headings and body copy |
| links, hover states, "read case study" | card and panel borders |
| the `work-row` hover bar | the shelf cloth |
| `AI` pillar chips | case-study cards |
| chat panel and streaming state | the four blacks |
| shelf foil stamping and chrome | |
| focus rings | |

Read it as: **purple is what you touch and what you breathe; black is what you
stand on.** A visitor should see purple on every screen without ever reading a
paragraph of it.

### Verified contrast (against `#08080a`)

| Token | Value | Ratio | Use |
| --- | --- | --- | --- |
| `--foreground` | `#fafafa` | 19.17:1 | headings, primary text |
| `--muted-foreground` | `#a1a1aa` | 7.81:1 | body copy |
| `--muted-foreground-faint` | `#8a8a93` | 5.85:1 | 11px mono eyebrows |
| `--primary` | `#c084fc` | 7.57:1 | live/agentic only |

`#71717a` was tested first for the faint label and lands at **4.14:1** — it fails
AA for the 11px `EYEBROW` type. `#8a8a93` is the floor; do not darken it.

`--background` is `#08080a`, not `#000000`: pure black makes `backdrop-filter`
glass edges band visibly on OLED, and the reference device (Redmi Note 11) is one.

## Key Assumptions to Validate

- [x] **Purple must be visible on every screen.** Validated the hard way: the
      first pass failed this and read as pure black-and-white. Check any
      viewport-sized crop of the site — if it contains no purple at all, the
      accent has been over-restricted again.
- [ ] **Architecture diagrams clear the confidentiality bar.** Draft one for
      `agent-orchestration` using only generic components (queue, tool router,
      model, on-prem boundary) and run it past the denylist test in
      `src/content/content.test.ts`. If a diagram cannot be drawn without naming
      something, the slot becomes typographic instead.
- [ ] **The graph still reads on a true-black ground.** `canvas.tsx` pulls
      `--primary` at runtime via `useCssColor`, so it inherits automatically — but
      node contrast against `#08080a` is untested. Verify on the Redmi Note 11,
      never on desktop and never from the in-app browser pane.

## MVP Scope

**In:**

1. Rewrite the token block in `globals.css` — neutral scale, four-step
   elevation, purple demoted to `--primary` only. Neutralise grid lines, ambient
   glow, `text-glow`, `work-row` hover bar.
2. Sweep the hardcoded `#c084fc` in `shelf-experience.tsx`, `shelf-books.ts` and
   the two OG image routes onto tokens. Typecheck after each batch.
3. Hero: remove `text-glow`, invert hierarchy so the tagline leads and the name
   supports. Add the portrait.
4. `MediaFrame` skeleton goes monochrome and stops printing the file path in
   production builds.
5. Purple re-applied as the secondary colour per the mass/detail table above.

**Out of MVP:** the architecture diagrams themselves. Land the palette first so
there is a finished frame to design them into.

## Not Doing (and Why)

- **A light mode** — doubles every surface decision and no client asked for it.
- **A second accent colour** — we already have one accent too many doing too many
  jobs. Adding a second before the first is disciplined is how we get back here.
- **Touching the graph's geometry or node count** — 400 nodes was measured, not
  guessed. Colour inherits from tokens; frame-rate headroom is not for palettes.
- **Rewriting case-study copy** — a real gap for a client audience (the contact
  CTA is a bare `mailto:` and the four AI blurbs are hard to tell apart), but
  it is a content project, not this one.

## Open Questions

- **The portrait carries orange.** The supplied headshot has an orange/grey
  geometric background, which introduces an unplanned third colour into a
  strictly black + purple system. Options: crop it out, sit it behind a neutral
  frame, or accept orange as a deliberate warm counterpoint. Unresolved.
- **Do the four AI case studies need differentiating?** They all read
  `AI · JAN 2025 · UNDER NDA` with similar framing. To a client that is one
  project told four ways.
