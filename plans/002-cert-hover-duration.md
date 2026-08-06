# 002 — Snap certification hover lift into UI duration budget

- **Status**: DONE
- **Commit**: d80c0df
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`src/components/certifications-section.tsx`), 1 className string

## Problem

Certification row thumbnails lift on hover with a **500ms cinematic** curve. That is marketing-scroll timing applied to a control users scan repeatedly. UI hover feedback should feel immediate (under 300ms, typically 150–200ms) with a strong ease-out — not a slow glide.

```tsx
/* src/components/certifications-section.tsx:41–49 — current */
<MediaFrame
  src={resolvePublicMedia(certification.image)}
  alt=""
  label={dictionary.certificate}
  slot={mediaDropHint(certification.image)}
  aspectClassName="aspect-[8/5]"
  sizes="10rem"
  className="w-40 shrink-0 transition-transform duration-500 [transition-timing-function:var(--ease-cinematic)] group-hover:-translate-y-1"
/>
```

Related tokens already in the repo:

```css
/* src/app/globals.css:118–119 — current */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
```

`--ease-cinematic` is correct for long scroll/hero motion. `--ease-out-quart` is the UI ease-out token and is currently **unused** anywhere else — this fix should use it so the token earns its keep.

Why it matters: every pass over the certifications list pays a half-second lag before the lift settles. On a crisp editorial portfolio that reads as soft or unresponsive next to 200ms button presses.

## Target

Replace the thumbnail `className` with:

```tsx
className="w-40 shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:-translate-y-0.5"
```

Exact values:

| Property | From | To |
|---|---|---|
| Duration | `duration-500` (500ms) | `duration-200` (200ms) |
| Easing | `var(--ease-cinematic)` → `cubic-bezier(0.16, 1, 0.3, 1)` | `var(--ease-out-quart)` → `cubic-bezier(0.25, 1, 0.5, 1)` |
| Travel | `-translate-y-1` (4px in default Tailwind) | `-translate-y-0.5` (2px) — keep press/hover subtle (AUDIT range for press is scale 0.95–0.98; for hover lift, 2–4px max) |

Do **not** invent a new cubic-bezier. Prefer the existing CSS variable so tokens stay the single source of truth.

Do **not** add `@media (hover: hover)` in this plan — that is a separate MEDIUM accessibility finding. Scope is duration/easing/travel only.

## Repo conventions to follow

- Motion tokens live in `src/app/globals.css` under `:root` (`--ease-out-quart`, `--ease-cinematic`). Do not hardcode a one-off cubic-bezier in the component if a token already matches.
- Interactive press timing elsewhere is **200ms** with transform:

```ts
/* src/lib/design.ts:36 — exemplar */
primary: `... transition-[transform,opacity] duration-200 ... active:scale-[0.98] ...`
```

- Work index hover arrows use `duration-300` + default easing for a 4px nudge (`work-index.tsx`); after this change, certs should feel **equal or snappier** than that arrow, not slower.
- Shape/layout of `MediaFrame` stays untouched; only the `className` string on this call site changes.

## Steps

1. Open `src/components/certifications-section.tsx`. Locate the `MediaFrame` inside the certifications map (around line 41). Confirm the `className` still matches the "current" excerpt above. If it has already been changed, STOP and report.

2. Replace only that `className` string:

```tsx
className="w-40 shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:-translate-y-0.5"
```

3. Confirm `globals.css` still defines `--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);`. Do not rename or delete `--ease-cinematic` (still used by nav-bar, link-underline, etc.).

4. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT edit other hover transitions (work index, header, chat chips) in this plan.
- Do NOT change certification layout, `MediaFrame` props other than `className`, copy, or data.
- Do NOT add `ease-in` anywhere.
- Do NOT use `transition-all`.
- Do NOT change reduced-motion global rules.
- Do NOT introduce Framer Motion / GSAP for this hover.
- If Tailwind in this project does not support `duration-200` or `-translate-y-0.5` (it does under standard Tailwind 3/4 scales), STOP and report rather than inventing arbitrary values.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect green typecheck, lint, unit tests. No file other than `certifications-section.tsx` in the diff.

- **Feel check**:
  1. Run the site (`pnpm dev` is fine for hover feel).
  2. Scroll to `#certifications`.
  3. Hover a row thumbnail with a mouse:
     - Lift starts immediately (no 500ms "ease into moving").
     - Settles by ~200ms; does not keep drifting after the pointer is still.
     - Travel is subtle (about 2px), not a floaty jump.
  4. Move quickly across several rows: lifts should track the pointer without stacking a long cinematic tail.
  5. In DevTools → Animations (or Rendering), set slowdown to 10% and confirm the active transition is **transform only**, duration **200ms**, timing function **cubic-bezier(0.25, 1, 0.5, 1)** (the resolved `--ease-out-quart`).
  6. Toggle `prefers-reduced-motion: reduce`: global rules already force transition-duration to ~0; hover should not animate. That existing behaviour is enough for this plan.

- **Done when**:
  - The MediaFrame className uses `duration-200`, `var(--ease-out-quart)`, and `-translate-y-0.5`.
  - No other files changed.
  - `pnpm verify` passes.
  - Hover feels snappy and in family with the 200ms buttons.
