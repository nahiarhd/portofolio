# Animation plans

Produced by `improve-animations` against commit `d80c0df` on `refactor/single-canvas-baseline`.

Plans are self-contained specs for any executor. **Do not implement from the audit conversation — implement from these files.**

## Status

| # | Plan | Severity | Status | Depends on |
|---|---|---|---|---|
| 001 | [Pause hero graph WebGL when off-screen](./001-pause-hero-graph-offscreen.md) | HIGH | DONE | — |
| 002 | [Snap certification hover lift into UI duration budget](./002-cert-hover-duration.md) | HIGH | DONE | — |

Only **HIGH** findings were selected for planning. MEDIUM/LOW audit items remain unplanned until requested.

## Recommended execution order

1. **002** first — one className change, low risk, immediate UI feel win; validates the plan→verify loop.
2. **001** second — performance-critical; requires device feel-check on Redmi Note 11 after `pnpm build`.

No hard dependency between the two (different files). Order is risk, not data flow.

## How to execute

```text
improve-animations execute plans/002-cert-hover-duration.md
# or hand the plan file to any agent with instruction: implement exactly, then pnpm verify
```

After a plan lands and verifies, mark its **Status** `DONE` in this table and in the plan file header.

## Out of scope (not planned yet)

From the audit, still open if wanted later:

- MEDIUM: touch-gated hover transforms, mobile nav panel enter/exit, link-underline via `scaleX`, button transition lists, token/dead-CSS cohesion
- LOW: marquee `will-change`, reduced-motion nuclear option nuance
- Missed opportunities: chat message enter, graph↔chat spatial story after stage removal
