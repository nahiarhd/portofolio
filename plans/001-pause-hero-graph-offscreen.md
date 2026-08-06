# 001 — Pause hero graph WebGL when off-screen

- **Status**: DONE
- **Commit**: d80c0df
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (`src/components/graph/canvas.tsx`), ~40 lines

## Problem

The hero graph is a continuous WebGL scene. After the work-stage canvas was removed, it is the site's only live 3D surface — and it is meant to stay light enough for the reference device (Redmi Note 11, S2 floor 58fps).

Today the rAF loop never stops. `useFrame` always spins the group and pulses edge opacity, even when the hero is fully scrolled off-screen (most of a visit: work list, statement pin, chat, about). Chat-driven node pulses also run while the graph is invisible.

```tsx
/* src/components/graph/canvas.tsx:95–116 — current (excerpt) */
useFrame((state, delta) => {
  const g = group.current;
  const instance = mesh.current;
  if (!g || !instance) return;

  const active = streamingRef.current;
  // ...
  const spin = active ? 0.14 : 0.06;
  g.rotation.y += delta * spin;
  // rotation.x / .z lerps + edgeMaterial.opacity pulse every frame
  // instance matrix rewrites only when active/highlights — idle still pays
  // for spin + edge pulse + full rAF + GPU clear/draw
});
```

```tsx
/* src/components/graph/canvas.tsx:204–216 — current */
export function GraphCanvas({ className }: { className?: string }) {
  return (
    <Canvas
      className={className}
      aria-hidden
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.35, 7.2], fov: 42, near: 0.1, far: 50 }}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <IdleScene />
    </Canvas>
  );
}
```

Why it matters:

- `dpr={[1, 2]}` lets a DPR-2 phone render at full resolution every frame.
- Multiple GSAP ScrollTriggers (statement pin, parallax, scrub) now compete for the same frame budget mid-page while WebGL still runs in the background.
- Frame-rate claims for this project are only valid on the Redmi Note 11; desktop readings and in-app browser panes do not count.

## Target

1. **Stop the R3F render loop when the canvas is not intersecting the viewport.** Use R3F's built-in `frameloop` prop:
   - Visible → `frameloop="always"` (current idle spin behaviour unchanged).
   - Not visible → `frameloop="never"` (no rAF, no GPU redraw).
2. **Cap device pixel ratio** so phones do not render at 2×:
   - Coarse pointer (typical phone/tablet): `dpr={1}` (fixed).
   - Fine pointer (desktop): `dpr={[1, 1.5]}` (was `[1, 2]`).
3. **Do not change** node count, geometry, materials, chat activity wiring, or the reduced-motion → `GraphStill` path in `hero-graph.tsx`.
4. **Do not change** antialias / camera / idle spin rates while visible — visual identity of the live scene stays the same; only when it runs and how expensive each frame is on mobile.

IntersectionObserver settings (exact):

```ts
new IntersectionObserver(callback, {
  root: null,
  rootMargin: "12% 0px", // resume slightly before fully on-screen
  threshold: 0,
});
```

Initial `visible` state: `true` so the first paint still animates before the observer fires (avoids a frozen first frame on load).

## Repo conventions to follow

- Graph code is client-only; `GraphCanvas` is already `"use client"`.
- Visibility / capability hooks in this area use React refs + effects (see `hero-graph.tsx` reduced-motion / WebGL detection) — prefer the same style, not a new library.
- Frame budget is sacred: comments in `canvas.tsx` and `Agents.md` reference S2 (400 nodes, Redmi Note 11). Any change must stay measurable on that device.
- Site must work with WebGL blocked; this plan only touches the live canvas path.
- Exemplar for observer lifecycle cleanup: `src/components/site-header.tsx` IntersectionObserver for the hero chapter sentinel (observe + disconnect in effect cleanup).
- Exemplar for media-query capability: `src/components/graph/hero-graph.tsx` `matchMedia` usage.

Do **not** add `three` helpers, `drei`, or a second canvas.

## Steps

1. Open `src/components/graph/canvas.tsx`. Confirm `GraphCanvas` and `IdleScene` still match the excerpts above (commit stamp `d80c0df`). If the file has drifted substantially, STOP and report.

2. At the top of the file, ensure React imports include what you need (`useEffect`, `useRef`, `useState` are already imported; keep them).

3. Replace `GraphCanvas` with a visibility-aware wrapper. Exact behaviour:

```tsx
export function GraphCanvas({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  // true until measured so first paint still animates
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.5]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: "12% 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const apply = () => {
      // Phones/tablets: fixed 1×. Desktop: allow up to 1.5× (was 2×).
      setDpr(coarse.matches ? 1 : [1, 1.5]);
    };
    apply();
    coarse.addEventListener("change", apply);
    return () => coarse.removeEventListener("change", apply);
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        aria-hidden
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0.35, 7.2], fov: 42, near: 0.1, far: 50 }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <IdleScene />
      </Canvas>
    </div>
  );
}
```

Notes for the executor:

- Move `className` from `Canvas` onto the outer `div` so `h-full w-full` from `HeroGraph` still sizes the island. `Canvas` keeps explicit 100% width/height styles.
- Leave `IdleScene` and `useFrame` logic unchanged. Pausing is entirely via `frameloop="never"`.
- Do not call `gl.setAnimationLoop` manually; R3F owns that through `frameloop`.

4. Update the file-level comment block at the top of `canvas.tsx` with one short sentence that the loop pauses when the hero is off-screen and DPR is capped on coarse pointers — so the next agent does not "optimize" by removing the observer.

5. Run verification (below). Do not commit unless asked.

## Boundaries

- Do NOT edit `hero-graph.tsx`, `activity.tsx`, `geometry.ts`, `project-nodes.ts`, or `graph-still.tsx`.
- Do NOT change node count, edge count, materials, spin rates, or accent/highlight behaviour inside `useFrame`.
- Do NOT set `frameloop="demand"` with manual `invalidate()` for this plan — visibility pause is enough and simpler.
- Do NOT remove chat → graph wiring; when the user scrolls back to the hero while streaming, the next frames will pick up `streamingRef` / highlights as today.
- Do NOT add dependencies.
- Do NOT change reduced-motion behaviour (already handled upstream).
- If `Canvas` in this R3F version rejects `frameloop` (type error), STOP and report the type error — do not invent a custom rAF gate without checking docs under `node_modules/@react-three/fiber`.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect: typecheck + lint clean, 97 tests (or current suite count) passing. No new unused-export lint errors.

- **Feel / performance check** (required for this plan):
  1. `pnpm build && pnpm start -H 0.0.0.0` (or `pnpm dev` for a first pass; **claims about FPS only count on production build on the Redmi Note 11**).
  2. Open `/en` on desktop first: hero graph still drifts slowly; no freeze on load.
  3. Scroll so the hero is fully above the viewport. In Chrome DevTools → Performance or Rendering → "Frame Rendering Stats" / Performance monitor: GPU/rAF work from the canvas should drop (no continuous WebGL clear). Optionally log: with React DevTools or a temporary `console` in `useFrame` — **remove any debug log before finish**.
  4. Scroll back to hero: spin resumes without a stuck frame longer than one refresh.
  5. Open chat, send a message that triggers `showProject`, scroll to hero: highlighted nodes still work when the canvas is visible.
  6. Toggle `prefers-reduced-motion: reduce` — still gets `GraphStill` (unchanged path in `hero-graph.tsx`).
  7. **Reference device (required before calling FPS done):** Redmi Note 11, production build, measure:
     - Hero fully on screen (idle).
     - Scrolled to `#ask` or statement pin (graph off-screen).
     Off-screen should not keep the device warm/busy from WebGL. Idle on-screen should remain at or above the historical 58fps floor; if it drops below, report numbers — do not "fix" by deleting the graph.

- **Done when**:
  - `frameloop` is `"never"` when the hero root is not intersecting (with 12% rootMargin).
  - Coarse pointer uses `dpr={1}`; fine pointer max 1.5.
  - `pnpm verify` green.
  - No intentional visual change to the on-screen idle graph besides possible slight softness on desktop at 1.5× vs old 2× (acceptable).
