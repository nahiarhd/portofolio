# Animation plans

Plans are self-contained specs for any executor. **Do not implement from an
audit conversation — implement from these files.**

Batches:

- 001–002: produced against commit `d80c0df` on `refactor/single-canvas-baseline`.
- 003–007: produced against commit `ac1c838` on `feat/repositioning`.

## Status

| # | Plan | Severity | Status | Depends on |
|---|---|---|---|---|
| 001 | [Pause hero graph WebGL when off-screen](./001-pause-hero-graph-offscreen.md) | HIGH | DONE | — |
| 002 | [Snap certification hover lift into UI duration budget](./002-cert-hover-duration.md) | HIGH | DONE | — |
| 003 | [Graph: one-shot camera dolly-in on load](./003-graph-camera-dolly-in.md) | LOW | DONE | — |
| 004 | [Graph: ease node highlights instead of snapping](./004-graph-eased-highlights.md) | MEDIUM | DONE | — |
| 005 | [Mobile nav panel: entrance instead of a hard pop](./005-mobile-nav-entrance.md) | MEDIUM | DONE | — |
| 006 | [Button press easing token; delete dead `.reveal` CSS](./006-button-press-easing-dead-css.md) | LOW | DONE | — |
| 007 | [Grain layer: drop the blend mode on touch devices](./007-grain-blend-gate.md) | MEDIUM | RETIRED | — |

003–006 landed 2026-08-11 (executor run, diff-reviewed, `pnpm verify` green at
122 tests). 007 was retired by the owner's frame-budget decision the same day —
it reduced mobile fidelity for performance, which became anti-goal.

## Recommended execution order

1. **005** — one CSS block, zero JS risk; validates the plan→verify loop.
2. **006** — small string edits in three files; run after 005 so the two
   globals.css edits stay sequential.
3. **007** — also globals.css; sequential with 006, independent otherwise.
4. **003** — additive graph component; independent of the CSS plans.
5. **004** — riskiest (touches the S2-budgeted `useFrame`); run last, review
   the diff carefully, and give it the on-device attention the graph deserves.

No hard data dependencies. 006 and 007 both edit `globals.css`, and 003/004
both edit `canvas.tsx` — keep each pair sequential to avoid conflicts.

## How to execute

```text
improve-animations execute plans/005-mobile-nav-entrance.md
# or hand the plan file to any agent with instruction: implement exactly, then pnpm verify
```

After a plan lands and verifies, mark its **Status** `DONE` in this table and
in the plan file header.

## Out of scope (not planned yet)

From both audits, still open if wanted later:

- MEDIUM: touch-gated hover transforms (`@media (hover: hover)` on hover
  motion), link-underline via `scaleX` instead of `background-size`
- LOW: marquee `will-change` review, reduced-motion nuclear-option nuance
- Missed opportunities: chat message enter refinement, graph↔chat spatial
  story, home ↔ case-study page transition
- The on-device fps pass that used to sit here was **retired 2026-08-11**
  with the frame budget — see `tasks/todo.md`. Motion is now verified by eye.
