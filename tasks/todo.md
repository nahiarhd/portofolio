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

## Phase R2 — Motion: choreography across the whole site

- [ ] **Page transitions.** Home ↔ `/work` ↔ case study get a real transition
      — the redaction wipe crossing routes is the obvious signature. Check the
      current Next 16 API in `node_modules/next/dist/docs/` before writing a
      line of this (the framework moved; do not write from memory).
- [ ] **Line-mask reveals.** Section headings arrive through clip-path masks,
      upgrading the current GSAP opacity/stagger.
- [ ] **Case studies become the richest pages** — they are currently the
      plainest. Sticky meta column, media reveals on scroll, reading progress,
      pull-quote type moments.
- [ ] **One event, two media.** When `showProject` lands, the card entrance in
      the chat and the node swell in the graph must feel like the same event
      (plan 004 eased the node's half; the card's half is missing).
- [ ] Landing check for `plans/003–006` — review each by eye in slow motion
      before calling them done.

---

## Phase R3 — UI richness pass

- [ ] **Material depth audit.** Layered surfaces, hairlines, a real shadow
      hierarchy. Find the richest section, drag every other section up to it.
- [ ] **Work card hover.** Media parallax or tilt inside the frame — not just
      colour swaps.
- [ ] **Type moments.** Bigger display contrast where pages read flat; the
      outline/solid pair has more range than it currently uses.
- [ ] **The paper↔ink cut.** The chapter transition is the site's one theme
      switch — make it feel deliberate and expensive (the scroll position it
      happens at, the nav token flip, the grain crossing).

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
