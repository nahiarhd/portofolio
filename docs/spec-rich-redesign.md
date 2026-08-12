# Spec: Rich Redesign — R1, The Persistent Graph

Status: **approved 2026-08-11** · Supersedes the frame-budget era of
[`docs/spec.md`](./spec.md) · Mission: [`tasks/todo.md`](../tasks/todo.md)

---

## Why

Owner decision, 2026-08-11: the frame-rate budget is retired. The site stops
optimizing for a low-end phone floor and starts optimizing for the richest
result — deeper 3D, more motion, more premium UI. R1 is the 3D centrepiece:
the graph stops being a dim backdrop behind the hero and becomes the world the
site is built on.

## Decisions

Recorded so they are not relitigated. All confirmed by Raihan 2026-08-11.

| # | Decision | Chosen |
|---|---|---|
| 1 | Where the graph lives | **Persistent world** — one full-page canvas behind the entire site, bright under the paper hero, dimmed to a ghost under the ink chapters |
| 2 | Network density | **Denser + deeper** — ~650 nodes / ~1,000 edges, deeper z spread with fog |
| 3 | Glow | **Real bloom** via `@react-three/postprocessing` (new dependency, approved) |
| 4 | What survives the retirement | WebGL-blocked and reduced-motion fallbacks; confidentiality tiers; `pnpm verify`; env-swappable provider |

## Architecture

**One global canvas.** `GraphCanvas` moves from the hero island to
`[lang]/layout`: fixed, inset-0, behind everything (`-z-10`),
`pointer-events: none`, `aria-hidden`. The hero stops rendering its own
live-canvas layer; it keeps only the `GraphStill` fallback.

**The canvas paints the ground.** A fullscreen quad inside the scene carries
the page background — white under the paper hero, ink under the body — lerped
by chapter. *First attempt was translucent chapter backgrounds composited over
the canvas; that can never render crisp paper, so the canvas owns the ground.*
The hero's CSS paper surface turns off only while the live canvas runs
(`body[data-world="live"]`), so the WebGL-off / reduced-motion fallback keeps
its opaque white hero.

**One scroll-aware palette.** Node, edge, fog, ground, and bloom intensity all
lerp between the ink and paper ramps. The lerp keys off the
`data-hero-chapter-end` sentinel the header already watches — the nav's token
flip and the graph share one notion of which chapter the reader is in. Under
ink the scene steps back (presence 0.6: smaller nodes, fainter edges, base
nodes dimmed under the bloom threshold); under paper it prints at full
strength with bloom near-off so the white ground doesn't smear the print.

*Implementation note:* `THREE.Color` math is linear-space. A "0.22" grey is
~0.5 sRGB — bright enough to bloom. Ink base strength is 0.06 linear.

## Scene

- **Geometry** — the seeded LCG literal regenerates to ~650 nodes / ~1,000
  edges with a deeper z spread. `project-nodes` mapping and the geometry tests
  regenerate with it. Nothing computes at render (React Compiler purity).
- **Bloom** — `@react-three/postprocessing`, mipmap blur. Threshold tuned so
  only accent, wake, and signal light blooms; base nodes render dimmed under
  ink. Glow lives in the ink world; on paper the nodes stay printed.
- **Traveling signals** — ~24 instanced additive packets riding random edges:
  messages crossing the network. Chat streaming → more packets, faster.
  `showProject` → packets converge on the highlighted node.
- **Pointer field** — window-level `pointermove`; nodes near the cursor wake
  (brighten + swell), reusing the per-node weight mechanism from plans/004.
  The canvas never takes pointer events — scroll is never stolen.
- **Depth** — `FogExp2` matched to the ink ground. The plans/003 camera
  dolly-in stays.

## Fallbacks — not negotiable

WebGL blocked or `prefers-reduced-motion: reduce` → no global canvas. The hero
keeps `GraphStill` exactly as today; ink chapters run flat-dark. The chat
works; the graph is enhancement, never dependency.

## Chat wiring

`GraphActivityProvider` API unchanged. Its effects become site-wide:
streaming brightens the world under the reader's feet, not just behind the
hero.

## Out of scope for R1

Named so they are not silently absorbed:

- Route transitions, case-study scroll choreography → R2.
- UI richness pass (materials, hover craft, type moments) → R3.
- Scroll-driven camera drift → R2 candidate.
- Any change to content, dictionaries, or the confidentiality gate.

## Success criteria

| Criterion | How verified |
|---|---|
| Graph visible behind every chapter, brightest under the hero | Look |
| Palette transitions crossing the paper↔ink boundary | Look, scroll slowly |
| Signals travel edges; multiply while chat streams; converge on `showProject` | Look, chat with the site |
| Pointer wake follows the cursor without stealing scroll | Look, phone + desktop |
| WebGL blocked / reduced motion → GraphStill hero, full site otherwise | Browser flags |
| No confidential term anywhere new | `pnpm test:unit` denylist |
| `pnpm verify` passes | CI |

Frame-rate targets are deliberately absent. Smoothness is judged by eye on the
machines Raihan actually uses.
