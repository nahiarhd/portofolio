# TODO: Rich Redesign — richer UI/UX, richer motion, richer 3D

Spec: [`docs/spec.md`](../docs/spec.md) · Repositioning:
[`docs/spec-repositioning.md`](../docs/spec-repositioning.md)

The T1–T17 build log that lived here is in git history (this file was
rewritten 2026-08-11). `tasks/plan.md` is kept as the historical record of the
first build.

---

## Owner decision, 2026-08-11 — the frame budget is retired

Raihan, verbatim: *"I don't care about the frame rate or anything again. I
want the best result and the best UI — more Three.js, rich UI/UX, rich
animation, rich 3D animation."*

So the site stops optimizing for the Redmi Note 11 floor and starts optimizing
for the richest result. Heavier scenes, postprocessing, and persistent 3D are
now on the table. Smoothness is judged **by eye on the machines Raihan
actually uses** — no measurement protocol, no device pass.

**Not retired:** graceful degradation. The site still works completely with
WebGL blocked and `prefers-reduced-motion` on. That is a build constraint, not
a performance one. Also untouched: the confidentiality tiers + denylist, the
`pnpm verify` gate, env-swappable LLM provider, no secrets in the client
bundle.

Immediate consequences already applied:

- `plans/007` (grain blend gate — a *performance* reduction of mobile
  fidelity) is **dropped**. The grain keeps its blend everywhere.
- `plans/003–006` (camera dolly, eased graph highlights, mobile nav entrance,
  button press easing) still land — they add richness.
- The T13/T14 "re-measure fps on device" obligations are deleted.

---

## Direction

The graph is the site's idea — an agent network. Today it is a dim backdrop
behind the hero. The redesign makes it the protagonist, then lifts every page
to match.

1. **3D first.** The graph becomes luminous, deep, and reactive — not texture
   behind type.
2. **Motion earns its place everywhere.** Entrances, route transitions, hover
   states. The redaction wipe stays the signature device; everything else gets
   the same care.
3. **Rich UI without slop.** Depth, layering, material contrast, big type
   moments. No generic AI-portfolio tropes — no gradient blobs, no
   glassmorphism wallpaper, no aurora backgrounds.

---

## Phase R1 — 3D: make the graph the protagonist — ✅ done 2026-08-11

`src/components/graph/canvas.tsx` was the centre of this phase. All items
landed, verified live in the browser (hero, statement, work, chat sections):

- [x] **Glow.** `@react-three/postprocessing` bloom — signals and accents
      glow under ink; bloom lerps to near-off under paper so the white ground
      doesn't smear the print.
- [x] **Traveling signals.** 24 packets (48 while streaming, 1.8× faster)
      riding random edges; `showProject` reroutes 65% of respawns onto edges
      ending at the lit node — the network visibly converges. Verified live
      with a real chat question.
- [x] **Pointer field.** Window `pointermove` → nodes near the cursor wake
      (capped below highlight strength), fading ~0.9s after the last move.
      Verified by code review; confirm by moving your own mouse — automation
      can't reliably hold a pointer.
- [x] **Depth.** `FogExp2`, density lerped per chapter (0.1 ink / 0.045
      paper), fog colour tracking the ground.
- [x] **Persistent graph.** One fixed full-page canvas behind every chapter —
      chosen over hero-only. The canvas paints the ground itself (a
      fullscreen quad lerped white↔ink); translucent chapter backgrounds were
      tried first and can never render crisp paper. Hero CSS paper turns off
      only while the canvas runs (`body[data-world="live"]`), so the
      WebGL-off / reduced-motion fallback keeps its opaque white + still.

Also fixed in passing: a pre-existing dead GSAP selector
(`[data-anim="hero"] > div:last-child` matched nothing once the chapter-end
sentinel span trailed the content) — hero scroll-out now targets
`[data-anim="hero-body"]` explicitly.

Gotcha worth keeping: `THREE.Color` math is linear-space — a "0.22 grey" is
~0.5 sRGB and blooms everywhere. Ink base nodes sit at 0.06 linear.

**Verify:** `pnpm verify` green (123 tests) · live browser pass done on
desktop Chrome. Scroll-linked camera drift (graph receding as you leave the
hero) moved to R2 — it's choreography, not scene.

---

## Phase R2 — Motion: choreography across the whole site — ✅ done 2026-08-12

- [x] **Page transitions.** Root view-transition uses a **redaction wipe**
      (`page-redact-out` / `page-redact-in` clip-path) instead of a soft fade;
      graph `RoutePulse` remains the 3D half. Work covers share
      `view-transition-name: work-cover-<slug>` so index → case study morphs
      the media. PRM: animations off. (Next 16 `experimental.viewTransition`
      already enabled; API checked in `node_modules/next/dist/docs/`.)
- [x] **Line-mask reveals.** `reveal-head` keeps the redaction bar wipe on
      titles and now **mask-ins the lead** (`:scope > p`). Case-study header
      and body sections use `mask-in` (no redaction bars on that page family).
- [x] **Case studies become the richest pages.** Cover + frames `media-in`,
      outcome as pull-quote (`blockquote` + accent rule), sticky stack + meta
      dossier, site-wide `.scroll-line` as reading progress, shared cover
      morph from the work index.
- [x] **One event, two media.** When `showProject` lands, the card entrance in
      the chat and the node swell in the graph must feel like the same event.
      Card: `.chat-card` 350ms ease-out-quart + ring flash. Node: plan 004
      weight ramp ~350ms. Slugs publish via `useLayoutEffect` so both start on
      the same paint (landing check 2026-08-12).
- [x] Landing check for `plans/003–006` — code-audited 2026-08-12 against the
      R1 world-canvas rewrite:
      - **003** camera dolly: `CameraIntro` 8.2 → 7.2, settled-once guard ✓
      - **004** eased highlights: `highlightWeight` ref, `delta/0.35`, idle
        gate ✓
      - **005** mobile nav: `#mobile-nav` 180ms entrance, exit instant ✓
      - **006** button press + dead `.reveal`: 150ms / `--ease-out-quart` on
        `BUTTON` + cva; `.reveal` gone ✓
      Fixes from the pass: snap-back/baseline now scale by chapter presence
      (no paper-size pop under ink); dual-media paint sync (above).

---

## Phase R3 — UI richness pass — ✅ done 2026-08-12

- [x] **Material depth audit.** Shadow ladder (`--shadow-hairline` /
      `--shadow-lift` / `--shadow-float`) on ink + paper; `.panel` /
      `.panel-strong` / `.surface-inset` use it. Chat is the float tier;
      case-study sticky dossier is panel-strong; flat surfaces get the hairline.
- [x] **Work card hover.** `.work-card-media` perspective tilt + lift on
      fine-pointer hover (PRM- and touch-safe); scroll parallax on `img` kept.
- [x] **Type moments.** Solid/outline pair range via `.text-outline--deep` on
      hero line 2 and statement line 2; contact heading climbs the display
      clamp.
- [x] **The paper↔ink cut.** Paper bottom rule + ink falloff; heavier top rule
      on the first ink section; nav flip 0.55s cinematic with shadow; body
      `data-chapter` drives grain density paper↔ink from the same observer.

---

## Carried over — open, but not redesign

- [ ] Custom domain name? → blocks deploy completion (old T17).
- [ ] Publish `Playground/` projects? → would add work entries.
- [ ] One-line Hugging Face bio + GitHub profile bio — free credibility, the
      repositioning spec flagged both.

---

## Rules that died with the budget

Recorded so no future session resurrects them by accident:

- ~~Hero graph ≥ 50fps sustained on a mid-range Android~~
- ~~JS < 150KB gzipped (was already honestly missed at ~205KB)~~
- ~~"Never spend the frame budget; 400 nodes was measured, not guessed"~~ —
  replaced in `AGENTS.md` with richness-first.
- ~~T13/T14 on-device fps re-measurement~~ — no protocol, no device pass.
- ~~`plans/007` grain blend gate~~ — dropped before landing.
