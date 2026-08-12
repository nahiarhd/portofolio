# 005 — Mobile nav panel: entrance instead of a hard pop

- **Status**: DONE
- **Commit**: ac1c838
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`src/app/globals.css`), ~15 lines added

## Problem

The mobile menu appears and disappears with zero motion. `site-header.tsx`
conditionally renders the panel:

```tsx
/* src/components/site-header.tsx — current */
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background px-5 pb-6 pt-2 md:hidden"
        >
```

A full-width panel of display-size links pops into existence under the header.
Menu opens are occasional UI — they earn a standard entrance (AUDIT budget:
150–250ms). Exit stays instant: closing either precedes navigation or is a
deliberate dismiss, and delayed-unmount machinery is not worth it here.

## Target

Entrance only: fade + 8px slide down, 180ms, on the existing UI easing token.

| Property | Value |
|---|---|
| Duration | `180ms` |
| Easing | `var(--ease-out-quart)` → `cubic-bezier(0.25, 1, 0.5, 1)` (already defined in `globals.css` `:root`) |
| From | `opacity: 0; transform: translateY(-8px)` |
| To | `opacity: 1; transform: translateY(0)` |
| Fill | `both` |

The element mounts fresh on every open, so a CSS animation on the id selector
plays each time — no JS change needed in `site-header.tsx`.

## Repo conventions to follow

- Occasional-UI keyframes live in `src/app/globals.css`, gated behind
  `@media (prefers-reduced-motion: no-preference)` — see the "Ask chat"
  block (`chat-msg-in`, `chat-busy-pulse`, `chat-caret`) as the exemplar.
- The file's final `@media (prefers-reduced-motion: reduce)` block already
  zeroes all animation durations, so PRM users get the instant panel even if
  the gate were missed — double protection, same as chat.
- Transform + opacity only; never layout properties.

## Steps

1. Open `src/app/globals.css`. Locate the "Ask chat — occasional UI motion"
   section and its `@media (prefers-reduced-motion: no-preference)` block
   ending with the `chat-caret` keyframes (commit stamp `ac1c838`). If it has
   drifted, STOP and report.

2. Insert this block immediately **after** that media block and **before** the
   final `@media (prefers-reduced-motion: reduce)` block:

```css
/* Mobile nav shelf — entrance only. Exit is instant by design: closing
   precedes navigation or is a dismiss, and unmount waits for nothing. */
@media (prefers-reduced-motion: no-preference) {
  #mobile-nav {
    animation: mobile-nav-in 180ms var(--ease-out-quart) both;
  }

  @keyframes mobile-nav-in {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

3. Do not touch `site-header.tsx`. Do not rename anything.

4. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT animate the exit (no delayed unmount, no state changes in React).
- Do NOT animate height / max-height — the panel is in flow; opacity +
  translate only.
- Do NOT animate the hamburger icon — it already transitions (200ms).
- Do NOT add media queries for hover/pointer; this is a click/tap trigger.
- Do NOT touch the chat keyframes or the reduced-motion block.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect green; diff contains only `globals.css`.

- **Feel check**:
  1. `pnpm dev`, DevTools device toolbar at 393px width.
  2. Tap the hamburger: the panel arrives in one soft motion (~180ms), sliding
     down from under the header — not a blink, not a bounce.
  3. Tap again: it vanishes instantly. That is intended.
  4. Open and close five times quickly: the entrance replays cleanly every
     time, no stuck states.
  5. Toggle `prefers-reduced-motion: reduce` (Rendering panel): open shows the
     panel instantly.
  6. At ≥768px (md) the button is hidden — confirm no desktop change.

- **Done when**: mobile menu entrance is 180ms ease-out-quart fade+slide,
  exit instant, PRM instant both ways, `pnpm verify` passes.
