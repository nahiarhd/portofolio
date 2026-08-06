# Operator Console Rebuild

> Concept one-pager. Produced via `idea-refine`, 2026-08-06.
> Supersedes the *presentation* of [`agent-graph-portfolio.md`](./agent-graph-portfolio.md);
> its core bet — chat-driven graph as NDA-proof evidence — is unchanged and
> restored here.

## Problem Statement

**How might we** convince a peer audience that Raihan builds production AI
systems — when the page repeats itself, the palette is applied too timidly to
carry energy, and the one mechanic that actually proved the claim has been
disconnected from the page?

Audience is **peers and community**, not recruiters. Memorability outranks
conversion. That licenses boldness the recruiter framing would not.

## Recommended Direction

Four moves, stacked, in dependency order. The first is not a direction — it is
the floor everything else stands on.

**Floor · Reconnect the wire.** `GraphActivityProvider` is mounted in
[`layout.tsx`](../../src/app/[lang]/layout.tsx), `chat-panel.tsx` publishes to
it on every `showProject` tool call, and `graph/canvas.tsx` consumes it to light
the mapped node. `canvas.tsx` is never rendered — `knip` reports it, plus
`hero-graph.tsx` and `graph-still.tsx`, as unused files. The chat has been
broadcasting to nobody. Rendering `HeroGraph` restores the site's only
uncopyable idea at near-zero cost.

**1 · Delete the duplicate, then spend the space.**
[`page.tsx`](../../src/app/[lang]/page.tsx) renders the same six projects twice:
`WorkStage` ("Selected work", a six-item R3F carousel) then `WorkIndex` ("All
work", the same six as a list). *Selected* is *All*. Cut the stage. Spend the
reclaimed vertical on one **architecture diagram per case study** — six system
diagrams is substance, six one-line cards is a directory. This is also the fix
for "every project reads as *something AI, for someone secret*", which is the
real reason the page feels thin.

**2 · The graph becomes the spine, not a hero ornament.** One persistent object
that lives through the whole scroll, shrinking into a dock as you descend.
Scroll position and chat activity both drive it through the *same*
`GraphActivityProvider` — two inputs, one object. This satisfies "more 3D"
while still obeying the original rule that 3D appears in exactly one place.

**3 · Change the register from magazine to operator console.** The hero claims
Raihan builds *"the operator-facing surfaces that make agents usable"*, and the
site currently argues the opposite — it is a beautifully set print magazine.
Make the portfolio one of those surfaces: job-state chrome, streaming
indicators, real latency on the chat, the graph read as a live pipeline view.
Editorial typography stays; the instrumentation becomes the voice.

**4 · Contrast surgery — same palette, more voltage.** Bone/ink is genuinely
uncommon and worth keeping; it is applied too softly to register.
`--background: #e4e1d8` against `--surface-2: #f5f4f0` is roughly a 4% luminance
delta carrying a `0.04`-alpha shadow, so plates never lift. Cobalt `#1c39bb`
appears only in a scroll line, a focus ring, and a hover underline — nowhere the
eye lands. Grain at `0.055` over grid at `0.045` mushes what separation remains.

### Why this order

**Move 1 pays for move 2.** Neither `Canvas` sets `frameloop`, so both default
to `"always"`, and `canvas.tsx` only skips its per-instance loop when idle —
rotation and edge opacity still update every frame. The S2 result (58fps on the
Redmi Note 11) measured **one** canvas in a hero that scrolls away. Move 2 makes
that canvas permanent; move 1 deletes `work-stage-canvas.tsx`, the second
continuous canvas. Sequenced the other way, move 2 is measured against a budget
that has not been freed.

## Key Assumptions to Validate

- [ ] **Deleting `WorkStage` frees enough budget for a persistent canvas.**
      Riskiest technical bet. *Test:* ship the deletion as the first commit and
      measure on the Redmi Note 11 before any docking choreography exists.
      Floor is the S2 number, 58fps. If a persistent canvas cannot hold it,
      move 2 degrades to hero-only and the dock is abandoned — not optimised
      around.
- [ ] **Six NDA-safe architecture diagrams have real substance.** *Test:* write
      exactly one, for `scan-to-structure document retrieval`. If it renders as
      a generic boxes-and-arrows OCR pipeline that any engineer could draw
      without knowing the project, move 1 points at nothing and the carousel
      stays. Must pass the `src/content/` denylist in `content.test.ts`.
- [ ] **Instrument chrome reads as craft, not costume.** With a peer audience
      this is a one-strike bet: a portfolio that displays *invented* latency to
      an engineer is worse than one that displays none. *Test:* every number on
      screen must trace to something the page actually did. A number that
      cannot be real does not ship.
- [ ] **Contrast can rise without breaking AA.** `--muted-foreground` and
      `--muted-foreground-faint` currently clear 6.1:1 and 5.1:1 against
      `#e4e1d8`, and the faint tier carries 10–11px mono with no headroom.
      *Test:* recompute both tiers after every change to the ground.
- [ ] **Scroll-driven graph activity survives touch.** `state.pointer` parallax
      in `canvas.tsx` is inert on the mobile-heavy target audience. *Test:*
      drive the dock from scroll alone and confirm it still reads on a phone.

## MVP Scope

**In:**

- `WorkStage` + `work-stage-canvas.tsx` deleted; `WorkIndex` becomes the single
  work section
- `HeroGraph` rendered — floor restored, chat lights nodes again
- One architecture diagram, for one case study, as the proof of the pattern
- Persistent graph dock driven by scroll, **only if** the device measurement
  clears 58fps
- Contrast pass across `globals.css` tokens, AA re-verified
- Operator chrome on the chat surface only: real streaming state, real token
  count, real latency

**Out of MVP:**

- The remaining five architecture diagrams (until the first one proves the form)
- Instrument chrome outside the chat surface
- Any change to `projects.ts` shape — it feeds the pages and the `showProject`
  tool, and stays the single source of truth

## Not Doing (and Why)

- **Black / white / purple.** Dark ground plus violet accent is the default
  palette of current AI tooling. Adopting it would make a distinctive site look
  templated. Decided against by Raihan after review, not vetoed.
- **The graph as real navigation.** It is `aria-hidden` with
  `pointerEvents: none`, and the site must work fully with WebGL blocked. It
  stays an *indicator* of state, never the affordance that carries it.
- **Pointer parallax as a primary effect.** Inert on touch, and the audience is
  mobile-heavy. Keep it as desktop garnish; never let it carry meaning.
- **3D on every section.** One object, two inputs. Ambient 3D behind every
  block is what makes WebGL read as cheap.
- **Fake telemetry.** See the third assumption. This is the failure mode that
  would cost the most with exactly the audience being targeted.
- **A second `Canvas`.** The budget supports one. This is the constraint that
  makes the whole plan sequence.
- **A database, CMS, or auth.** Unchanged from `docs/spec.md`. Nothing here
  needs one.

## Open Questions

- Does the docked graph persist across the route change into
  `/work/[slug]`, or is it homepage-only? Persisting it is the stronger idea and
  the harder one — it means the canvas survives navigation.
- What replaces the "Selected work" *label* in the page's narrative? Removing
  the section removes an editorial beat, not just a component.
- `canvas.tsx:44` still falls back to `#c084fc` — a leftover from the
  pre-editorial design. Fold into the contrast pass or fix immediately?
- Do the architecture diagrams belong in `src/content/` as typed data (so the
  chatbot can describe them too) or as static SVG assets?
