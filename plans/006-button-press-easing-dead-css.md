# 006 — Button press feedback on the easing token; delete dead `.reveal` CSS

- **Status**: DONE
- **Commit**: ac1c838
- **Severity**: LOW
- **Category**: Easing & duration + Cohesion & tokens (merged: same fix pattern)
- **Estimated scope**: 3 files (`src/lib/design.ts`, `src/components/ui/button.tsx`, `src/app/globals.css`), small string edits + one block deleted

## Problem

Two button systems exist, and both press states ride the CSS default easing at
200ms — or nothing at all:

```ts
/* src/lib/design.ts — current */
primary: `... transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.98] ${FOCUS}`,
secondary: `... transition-colors duration-200 hover:border-primary hover:text-primary active:scale-[0.98] ${FOCUS}`,
ghost: `... transition-opacity duration-200 hover:opacity-70 active:scale-[0.98] ${FOCUS}`,
```

- `primary` animates the press scale with the default `ease` curve — the repo
  has an easing token for exactly this and does not use it.
- `secondary` and `ghost` declare `active:scale-[0.98]` but their transition
  lists omit `transform` — **their press snaps with no animation at all**.
- 200ms is above the AUDIT budget for press feedback (100–160ms).

```tsx
/* src/components/ui/button.tsx — current cva base (chat buttons) */
"... transition-[transform,filter,background-color,border-color,color] duration-200 ... active:scale-[0.98]"
```

Same gap: default easing, 200ms.

Additionally, `globals.css` carries a dead block: the `.reveal` /
`.reveal-visible` fade system belonged to an IntersectionObserver entrance
that GSAP stagger replaced (see the comment on the `stagger` block in
`src/components/scroll-choreography.tsx`: "Replaces the IntersectionObserver
fade"). No component uses the `reveal` class; knip cannot see CSS.

## Target

| Property | From | To |
|---|---|---|
| Press/hover duration (all buttons) | `duration-200` | `duration-150` (AUDIT press budget 100–160ms) |
| Timing function | CSS default `ease` (or none for transform) | `[transition-timing-function:var(--ease-out-quart)]` — existing token, `cubic-bezier(0.25, 1, 0.5, 1)` |
| `secondary` transition list | `transition-colors` (no transform) | `transition-[color,border-color,transform]` |
| `ghost` transition list | `transition-opacity` (no transform) | `transition-[opacity,transform]` |
| `.reveal` block in globals.css | present, unused | deleted |

Do not invent new cubic-beziers; the token already exists in
`src/app/globals.css` `:root` (`--ease-out-quart`).

## Repo conventions to follow

- Easing tokens live in `src/app/globals.css` `:root`; components reference
  them via arbitrary properties — exemplar: the chat suggestion buttons in
  `src/components/chat/chat-panel.tsx` use
  `[transition-timing-function:var(--ease-out-quart)]`.
- `design.ts` is the single place page-level buttons are styled; keep the
  strings whole (they are template literals composed with `${FOCUS}`).
- `ui/button.tsx` is the cva variant used by the chat panel.

## Steps

1. In `src/lib/design.ts`, change the three `BUTTON` strings exactly:

   - `primary`: replace `transition-[transform,opacity] duration-200` with
     `transition-[transform,opacity] duration-150 [transition-timing-function:var(--ease-out-quart)]`
   - `secondary`: replace `transition-colors duration-200` with
     `transition-[color,border-color,transform] duration-150 [transition-timing-function:var(--ease-out-quart)]`
   - `ghost`: replace `transition-opacity duration-200` with
     `transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-out-quart)]`

   Change nothing else in these strings (`active:scale-[0.98]`, hovers,
   `${FOCUS}` all stay).

2. In `src/components/ui/button.tsx`, in the `cva` base string, replace
   `duration-200` with `duration-150 [transition-timing-function:var(--ease-out-quart)]`
   (the transition property list already includes `transform` — leave it).

3. Confirm the `.reveal` block is truly orphaned before deleting: search
   `src/` for `reveal-visible` (expect zero hits) and for `className` values
   containing a bare `reveal` class (expect zero; `data-anim="reveal-head"`
   is a GSAP selector attribute and must remain untouched). If any real
   consumer exists, STOP and report.

4. In `src/app/globals.css`, delete exactly this block (both rules):

```css
.reveal {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  .reveal:not(.reveal-visible) {
    opacity: 0;
    transform: translateY(1rem);
  }

  .reveal.reveal-visible {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.6s var(--ease-cinematic),
      transform 0.6s var(--ease-cinematic);
  }
}
```

   Do not touch `.redact-line`, `.marquee-track`, or anything else nearby.

5. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT change copy, layout, colours, or focus rings.
- Do NOT touch the chat suggestion buttons' own transition strings (they are
  already on the token at 200ms — acceptable; out of scope).
- Do NOT rename or delete `--ease-cinematic` (used elsewhere).
- Do NOT touch `data-anim="reveal-head"` attributes anywhere.
- If the `.reveal` deletion leaves an unexpected double blank line, normalise
  to one — no other formatting changes.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect green; diff limited to the three files.

- **Feel check**:
  1. `pnpm dev`. Press and hold the hero primary CTA ("View work"): the scale
     lands promptly (~150ms) with a strong ease-out, no mushy tail.
  2. Press the "Browse all work" secondary button: the press now **animates**
     (previously it snapped). Same family as primary.
  3. Chat buttons (Send / Stop) feel identical in family.
  4. Keyboard-tab to a button and press Space: same feedback, no layout shift.
  5. Toggle `prefers-reduced-motion`: feedback instant (global rule), fine.

- **Done when**: every button press animates at 150ms on
  `--ease-out-quart`, `.reveal` is gone from globals.css, and `pnpm verify`
  passes.
