# 004 — Graph: ease node highlights instead of snapping

- **Status**: DONE (executor deviation: `highlightWeight` is a `useRef`, not `useMemo` — React Compiler lint forbids mutating memo values; the ref is the repo's own convention for mutable scene data)
- **Commit**: ac1c838
- **Severity**: MEDIUM
- **Category**: Physicality & origin (the flagship graph↔chat moment pops)
- **Estimated scope**: 1 file (`src/components/graph/canvas.tsx`), ~40 lines changed

## Problem

The site's signature interaction — the chat's `showProject` tool lighting a
project's node in the hero graph — snaps. Highlighted nodes jump from scale 1
to 2.2 and from base colour to full accent in a single frame, and when
activity ends a `useEffect` snaps every instance back to baseline the same
way. The moment that is supposed to feel like the graph *responds* feels like
a light switch.

```tsx
/* src/components/graph/canvas.tsx — current, inside useFrame */
    // Only rewrite instance colours/scales when something is happening — idle
    // stays on the layout effect so we don't spend the S2 headroom for nothing.
    if (!active && !hasHighlights) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

      const highlighted = highlights.has(i);
      let scale = 1;
      if (highlighted) {
        scale = 2.2;
        scratch.copy(colors.accent);
      } else if (i === signalIndex) {
        /* ... */
```

```tsx
/* src/components/graph/canvas.tsx — current snap-back effect */
  // When activity ends, snap back to the calm baseline once.
  useEffect(() => {
    if (streaming || highlightSlugs.length > 0) return;
    const instance = mesh.current;
    if (!instance) return;
    /* rewrites every instance at baseline scale/colour, then: */
    if (edgeMaterial.current) edgeMaterial.current.opacity = 0.22;
  }, [streaming, highlightSlugs, nodeCount, positions, signalIndex, colors, dummy]);
```

## Target

Per-node highlight weights eased toward 0/1, driving both scale and colour:

| Property | Value |
|---|---|
| Ease duration | ~350ms linear-ramp per direction (`step = delta / 0.35`) |
| Highlighted scale | `1 + 1.2 * weight` (1 → 2.2, the same endpoints as today) |
| Highlighted colour | `base.lerp(accent, weight)` |
| Idle cost | unchanged — weights are only scanned while something is highlighted or still settling (`weightsActive` ref); idle frames still early-return before any instance rewrite |

The streaming wave, signal node behaviour, edge pulse, spin, and the
snap-back effect's job of resetting wave-touched nodes all stay as they are.
The snap-back effect additionally zeroes the weight array so the two
mechanisms cannot fight.

## Repo conventions to follow

- All scene state lives in `IdleScene` in `src/components/graph/canvas.tsx`;
  refs + `useMemo` for mutable scene data (see `streamingRef`, `dummy`,
  `scratch`).
- Frame budget is sacred: the S2 measurement (400 nodes, Redmi Note 11) is the
  ceiling. The `weightsActive` gate is what keeps idle free — do not remove
  it.
- `THREE.Color.lerp` / `THREE.MathUtils` are already used in this file.
- No drei, no new dependencies.

## Steps

1. Open `src/components/graph/canvas.tsx`. Confirm `IdleScene`'s `useFrame`
   and the snap-back `useEffect` still match the excerpts above (commit stamp
   `ac1c838`). If the file has drifted, STOP and report.

2. Add the weight state next to the existing refs (after `highlightRef` and
   its effect):

```tsx
  // Per-node highlight weight, eased toward 0/1 so showProject slugs swell in
  // instead of popping. Scanned only while something is highlighted or still
  // settling, so idle frames stay free.
  const highlightWeight = useMemo(() => new Float32Array(nodeCount), [nodeCount]);
  const weightsActive = useRef(false);
```

3. Replace the entire `useFrame((state, delta) => { ... })` callback body with:

```tsx
  useFrame((state, delta) => {
    const g = group.current;
    const instance = mesh.current;
    if (!g || !instance) return;

    const active = streamingRef.current;
    const highlights = highlightRef.current;
    const hasHighlights = highlights.size > 0;
    const t = state.clock.elapsedTime;

    // Drift speeds up a little while the bot works — smooth pointer parallax adds depth.
    const spin = active ? 0.14 : 0.06;
    const targetX = -state.pointer.y * 0.2;
    const targetY = state.pointer.x * 0.25;

    g.rotation.y += delta * spin;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      Math.sin(g.rotation.y * 0.5) * (active ? 0.12 : 0.08) + targetX,
      0.05,
    );
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetY * 0.2, 0.05);

    if (edgeMaterial.current) {
      // Pulse travels as a breathing opacity on the hairline edges.
      edgeMaterial.current.opacity = active
        ? 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(t * 5))
        : 0.22 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2));
    }

    // Ease highlight weights toward their targets (~350ms per direction).
    if (hasHighlights || weightsActive.current) {
      const step = delta / 0.35;
      weightsActive.current = false;
      for (let i = 0; i < nodeCount; i++) {
        const target = highlights.has(i) ? 1 : 0;
        const current = highlightWeight[i];
        if (current === target) continue;
        const next =
          current < target
            ? Math.min(target, current + step)
            : Math.max(target, current - step);
        highlightWeight[i] = next;
        if (next !== target) weightsActive.current = true;
      }
    }

    // Only rewrite instance colours/scales when something is happening — idle
    // stays on the layout effect so we don't spend the S2 headroom for nothing.
    if (!active && !hasHighlights && !weightsActive.current) return;

    for (let i = 0; i < nodeCount; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

      const weight = highlightWeight[i];
      let scale = 1;
      if (weight > 0) {
        // Highlighted: swell 1 -> 2.2 and base -> accent, both on the weight.
        scale = 1 + 1.2 * weight;
        scratch.copy(colors.base).lerp(colors.accent, weight);
      } else if (i === signalIndex) {
        scale = active ? 1.6 : 1.8;
        scratch.copy(colors.accent);
      } else if (active) {
        // Brightness wave travels along +x — reads as a pulse crossing the cloud.
        const wave = 0.5 + 0.5 * Math.sin(t * 4 + positions[i * 3] * 1.8);
        scale = 0.85 + 0.35 * wave;
        scratch.copy(colors.dim).lerp(colors.pulse, 0.25 + 0.55 * wave);
      } else {
        scratch.copy(colors.base);
      }

      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, scratch);
    }

    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  });
```

4. In the snap-back `useEffect` (the one commented "When activity ends, snap
   back to the calm baseline once."), add two lines immediately after the
   `if (!instance) return;` guard:

```tsx
    highlightWeight.fill(0);
    weightsActive.current = false;
```

   and add `highlightWeight` to that effect's dependency array. (Keep the
   rest of the effect exactly as-is — it still resets wave-touched nodes.)

5. Run verification. Do not commit unless asked.

## Boundaries

- Do NOT change node/edge geometry, counts, materials, camera, spin rates,
  edge opacity curves, the wave, or the signal node's idle scale.
- Do NOT ease the streaming wave's exit — the snap-back effect keeps its
  current one-shot reset for wave-touched nodes. Only highlights ease.
- Do NOT remove the `weightsActive` gate; idle frames must not pay for a scan.
- Do NOT touch `hero-graph.tsx`, `activity.tsx`, `geometry.ts`,
  `project-nodes.ts`, `graph-still.tsx`.
- Do NOT add dependencies.
- If a step does not match the code you find, STOP and report instead of
  improvising.

## Verification

- **Mechanical**:
  ```bash
  pnpm verify
  ```
  Expect: typecheck + lint clean, all unit tests passing.

- **Feel check**:
  1. `pnpm dev`, open `/en`, open the chat, ask about a project (anything that
     triggers `showProject`). Watch the hero: the node must **swell** from
     normal size to the accent node over roughly a third of a second — not
     appear full-size in one frame.
  2. While the bot streams, the wave and edge pulse must look exactly as
     before.
  3. Highlighted nodes stay at full accent/size while their card exists in the
     thread (weights hold at 1).
  4. Reduced motion: `GraphStill` path unchanged.
  5. DevTools → Performance: with the hero visible and chat idle, confirm no
     continuous instance-matrix work (the early return still holds — record a
     few seconds and check `useFrame` does not show per-frame instance
     rewrites).

- **Done when**: highlights ease in ~350ms, idle frames rewrite nothing,
  wave/signal/edge behaviour is unchanged, and `pnpm verify` passes.
