# 003 — Graph: one-shot camera dolly-in on load

- **Status**: DONE
- **Commit**: ac1c838
- **Severity**: LOW (missed opportunity — additive)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`src/components/graph/canvas.tsx`), ~25 lines added

## Problem

The live hero graph appears already at rest. The camera is fixed at
`z = 7.2` from the first frame, so when the dynamic chunk swaps the static
`GraphStill` for the live canvas, motion simply *starts* — the site's one 3D
object has no arrival. A one-time, cheap dolly-in gives the hero an entrance
without touching the per-frame budget (it animates only `camera.position.z`;
no instance rewrites, no new draw calls).

```tsx
/* src/components/graph/canvas.tsx — current (excerpt) */
      <Canvas
        aria-hidden
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0.35, 7.2], fov: 42, near: 0.1, far: 50 }}
        ...
      >
        <IdleScene />
      </Canvas>
```

Note: `GraphStill` is a separate 2D SVG composition, not a frame-matched
render of the 3D scene — the still→live swap is already a visual cut, so a
gentle dolly on the live side reads as the cloud settling in, not as a jump.

Reduced motion needs no extra gate: `hero-graph.tsx` never mounts
`GraphCanvas` when `prefers-reduced-motion: reduce` — those readers get the
still, as today.

## Target

Camera starts at `z = 8.2` and eases to the composed resting value `z = 7.2`
once, over ~1.4s, exponential ease-out. After it settles, the component does
nothing — zero cost for the rest of the session.

Exact values:

| Property | Value |
|---|---|
| Start z | `8.2` |
| End z | `7.2` (the current resting camera z — end state identical to today) |
| Curve | exponential ease-out via `lerp(current, target, min(1, delta * 2))` — time constant 500ms, ~95% settled at ~1.5s |
| Settle epsilon | snap to `7.2` and stop when within `0.005` |

## Repo conventions to follow

- R3F scene code lives in `src/components/graph/canvas.tsx`; small scene
  helpers are plain components in the same file (see `IdleScene`).
- Frame budget is sacred (S2: 400 nodes measured on Redmi Note 11). This
  change must not add per-frame work after it settles — verify with the
  `settled` ref guard.
- No `@react-three/drei` anywhere in this project. Do not add it.
- `THREE.MathUtils.lerp` is already used in this file — reuse it.

## Steps

1. Open `src/components/graph/canvas.tsx`. Confirm `GraphCanvas` still matches
   the excerpt above (commit stamp `ac1c838`). If it has drifted, STOP and
   report.

2. Add this component in the same file, above `GraphCanvas`:

```tsx
/** One-shot dolly-in: the cloud arrives slightly pulled back and settles to
 * the composed framing. Exponential ease-out; zero work once settled. */
function CameraIntro() {
  const settled = useRef(false);
  useFrame(({ camera }, delta) => {
    if (settled.current) return;
    const next = THREE.MathUtils.lerp(camera.position.z, 7.2, Math.min(1, delta * 2));
    if (Math.abs(next - 7.2) < 0.005) {
      camera.position.z = 7.2;
      settled.current = true;
    } else {
      camera.position.z = next;
    }
  });
  return null;
}
```

3. In `GraphCanvas`, change the camera start position from `7.2` to `8.2`:

```tsx
camera={{ position: [0, 0.35, 8.2], fov: 42, near: 0.1, far: 50 }}
```

4. Mount the intro next to the scene:

```tsx
<IdleScene />
<CameraIntro />
```

5. Extend the file-level comment block by one sentence: the camera dollies in
   once on load, so a future reader does not "correct" the 8.2 start value.

6. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT change `IdleScene`, node/edge counts, materials, spin rates, DPR,
  the IntersectionObserver, or the highlight/streaming logic.
- Do NOT animate fov, x, or y — z only.
- Do NOT loop or repeat the dolly; it runs once per mount.
- Do NOT add dependencies or drei.
- Do NOT gate this on reduced motion inside `canvas.tsx` — the mount gate in
  `hero-graph.tsx` already covers it.
- If `useFrame`'s state destructuring differs in this R3F version, read
  `node_modules/@react-three/fiber` docs before adapting; do not guess.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect: typecheck + lint clean, all unit tests passing.

- **Feel check**:
  1. `pnpm dev`, open `/en`. Watch the hero on load: the graph should drift
     subtly *toward* the viewer and settle within ~1.5s. It must read as an
     arrival, not a zoom animation — if it feels like a zoom ride, the start
     value is too far; report rather than retune.
  2. After settle, the framing must be identical to the pre-change resting
     view (z = 7.2).
  3. Scroll away and back: the dolly must not replay (settled ref).
  4. Toggle `prefers-reduced-motion: reduce`: `GraphStill` renders, no motion
     anywhere.
  5. Open chat and trigger `showProject`: highlight behaviour unchanged.

- **Done when**: camera starts at z = 8.2, settles once to 7.2 with ease-out,
  costs nothing after settling, and `pnpm verify` passes.
