# 007 — Grain layer: drop the blend mode on touch devices

- **Status**: RETIRED (2026-08-11 — owner retired the frame budget; this plan reduced mobile fidelity for performance, which is now anti-goal; applied once by the executor, then fully reverted)
- **Commit**: ac1c838
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`src/app/globals.css`), one rule split

## Problem

The paper-grain overlay is a full-viewport, viewport-fixed layer composited
with `mix-blend-mode: soft-light` on every frame of every scroll:

```css
/* src/app/globals.css — current */
.bg-grain {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 40;
  opacity: 0.22;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' ...");
}
```

Full-screen blend compositing is a known scroll-jank cost on low-end mobile
GPUs — and this project's frame budget is defined by exactly one of those
(Redmi Note 11). The layer was tuned on desktop; it has never been measured on
the reference device. This plan removes the blend cost from phones while
keeping the desktop look byte-identical.

## Target

| Pointer | Opacity | Blend mode |
|---|---|---|
| `coarse` (phones/tablets) | `0.12` | none (plain overlay) |
| `fine` (desktop) | `0.22` (unchanged) | `soft-light` (unchanged) |

Rationale: a plain low-opacity noise tile still reads as paper grain on both
chapters; it simply lacks the mid-point hold of soft-light, so it runs at
lower opacity to compensate. Desktop keeps exactly what was tuned.

## Repo conventions to follow

- Capability splits in this codebase use standard media queries on CSS custom
  layers (see the `prefers-reduced-transparency` block for `.nav-bar`) and
  `matchMedia("(pointer: coarse)")` in `src/components/graph/canvas.tsx` — the
  same coarse/fine distinction, so the split is consistent across CSS and JS.
- Comments in `globals.css` explain *why* a compositing choice exists (see the
  existing grain comment). Update the comment to match the new behaviour.

## Steps

1. Open `src/app/globals.css`. Locate the `.bg-grain` rule and its comment
   block (commit stamp `ac1c838`). If it has drifted, STOP and report.

2. Replace the comment block and the `.bg-grain` rule with:

```css
/* Paper texture. Fixed + pointer-events:none so it never repaints on scroll.
 *
 * `soft-light`, not `multiply` — this layer crosses both chapters; multiply
 * is invisible on the dark ground and screen is invisible on the white hero.
 * The blend is gated behind `pointer: fine`: full-screen blend compositing is
 * a scroll-jank risk on the reference phone's GPU, so coarse pointers get a
 * plain low-opacity overlay that reads as the same grain without the cost. */
.bg-grain {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 40;
  opacity: 0.12;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (pointer: fine) {
  .bg-grain {
    opacity: 0.22;
    mix-blend-mode: soft-light;
  }
}
```

   Copy the `background-image` data URI from the existing rule verbatim — do
   not retype it from this plan if it differs from what you find; the file is
   authoritative.

3. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT change the SVG noise tile itself (frequency, octaves, size).
- Do NOT change z-index, fixed positioning, or pointer-events.
- Do NOT touch `.bg-grid-lines` or any other layer.
- Do NOT remove the layer on mobile — the texture stays; only the blend cost
  goes.
- If the data URI in the file differs from the excerpt, keep the file's URI.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect green; diff limited to `globals.css`.

- **Feel check**:
  1. `pnpm dev` on desktop (fine pointer): both chapters must look exactly as
     before — same grain strength on the white hero and the ink body. Toggle
     DevTools → Rendering → "Emulate CSS media feature: pointer" to coarse and
     confirm the grain is still visible but subtler (no blend).
  2. DevTools → Layers panel (or `chrome://gpu`): with pointer emulated
     coarse, the grain layer must no longer create a blend/compositing pass.
  3. **Reference device (the point of this plan):** on the Redmi Note 11,
     production build, scroll the full home page slowly and quickly — the
     grain must not cost visible frames. This check belongs to the same
     on-device pass as the still-open T13/T14 fps measurements; if the device
     is not at hand, note "device check pending" rather than claiming done.

- **Done when**: no `mix-blend-mode` applies under a coarse pointer, desktop
  rendering is unchanged, `pnpm verify` passes, and the device check is either
  performed or explicitly marked pending.
