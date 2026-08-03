# Implementation Plan: Agent Graph Portfolio

Spec: [`docs/spec.md`](../docs/spec.md) · Concept: [`docs/ideas/agent-graph-portfolio.md`](../docs/ideas/agent-graph-portfolio.md)
Scope: **Option A** — site only, no additional public projects.

## Overview

Convert the `next-js-starter` template into a bilingual editorial portfolio with
one 3D hero graph and a tool-calling chatbot. No database, no auth, no CMS.
Content is typed data in the repo; the chat reads that same data so the site and
the bot can never disagree.

## Architecture Decisions

- **Content is one typed module, consumed twice.** `src/content/projects.ts`
  feeds both the rendered pages and the chat's tool. A single source means the
  bot cannot invent a project or describe one differently from its page.
- **i18n with zero dependencies.** Next 16's `[lang]` segment + dictionary JSON
  + `proxy.ts`, per the bundled docs. `next-intl` would add a dependency for
  two locales and a handful of strings.
- **The 3D is one client island.** `next/dynamic` with `ssr: false`, below the
  fold of meaning — the hero's text and heading render server-side and are never
  blocked by WebGL.
- **Provider is env-only.** No provider name, URL, or model id in source, so
  swapping off company infrastructure is a dashboard change.
- **Everything degrades.** Site works with WebGL blocked and chat closed. That
  is a build constraint, not a fallback added at the end.

## Dependency Graph

```
Phase 0 spikes (throwaway — de-risk before committing)
    │
    ├── S1 tool-calling on the vLLM endpoint ──┐
    └── S2 R3F on real mid-range Android ──────┤
                                               │
Phase 1  T1 strip scaffolding                  │
             │                                 │
             ├── T2 content model ─────────────┼──┐
             └── T3 i18n routing               │  │
                     │                         │  │
Phase 2  T4 design tokens                      │  │
             │                                 │  │
             ├── T5 shell + nav + locale toggle│  │
             ├── T6 work index ────────────────┘  │
             ├── T7 case study page                │
             └── T8 about + contact                │
                     │                             │
Phase 3  T9 chat route ────────────────────────────┘
             │
             ├── T10 rate limiting
             ├── T11 chat UI
             └── T12 project-card tool
                     │
Phase 4  T13 idle graph
             └── T14 graph ↔ chat wiring
                     │
Phase 5  T15 perf/a11y  ·  T16 metadata/SEO  ·  T17 deploy
```

Implementation order is bottom-up, but each task in Phases 2–4 is a **vertical
slice**: content → route → UI, working end to end when it lands.

---

## Phase 0: De-risk

Both spikes are **throwaway code on a scratch branch**. Neither is merged. Their
only output is a yes/no answer written into this plan. They exist because both
carry the risk of invalidating a whole phase, and finding that out in week three
is expensive.

### Spike S1: Does the endpoint support tool calling? — ✅ **PASSED** (2026-08-03)

**Result:** Fully supported. `vllm-0.24.0`, model `ads-llm`.

- Non-streaming: `finish_reason: "tool_calls"`, valid JSON arguments
- Streaming: incremental `delta.tool_calls[].function.arguments` deltas in
  standard OpenAI format — the AI SDK consumes this natively
- **No fallback needed.** T12 proceeds as specced.

**Additional finding:** every response carries a non-standard `reasoning` field
(gpt-oss emits its chain of thought). This is real thinking text that can drive
the graph's active state in T14 instead of a fake spinner. Note: it is *not*
part of the OpenAI schema, so the AI SDK may not surface it — T9 may need to
read the raw stream to capture it. Do not treat it as guaranteed.

<details><summary>original spike definition</summary>

**Description:** The entire project-card feature depends on the model emitting
tool calls. vLLM only serves them when started with `--enable-auto-tool-choice`
and a matching tool parser — this is a server-side flag Raihan does not control.
The `curl` test showed a plain completion, which proves nothing either way.

**Acceptance criteria:**
- [ ] A request with a `tools` array returns a populated `tool_calls` in the response
- [ ] Streaming with tools works, not just non-streaming
- [ ] Arguments come back as parseable JSON matching the schema

**Verification:** one `curl` with a `tools` payload, output pasted into this plan.

**If it fails:** the chat falls back to structured text output (ask the model for
JSON, parse it server-side, render the card). Uglier and less reliable, but the
feature survives. Decide before T12.

**Dependencies:** None. **Scope:** XS.

</details>

### Spike S2: Does R3F hold frame rate on a real phone? — ✅ **PASSED** (2026-08-03)

**Result:** 400 instanced nodes + 600 line segments, `dpr={[1,2]}`, antialias on.

| Device | Sustained min fps | Target | Verdict |
|---|---|---|---|
| Redmi Note 11 (Snapdragon 680 / Adreno 610) | **58** | ≥ 45 | Pass, with headroom |

**Reference device for this project is the Redmi Note 11.** Every future
frame-rate claim is measured on it, not on desktop.

**Caveat:** measured on a near-empty page. The real hero adds webfonts, the chat
panel, and full DOM. **Do not spend the headroom** — node count stays at 400.

**Note:** frame rate cannot be measured from the in-app browser pane. When the
pane is hidden the browser throttles `requestAnimationFrame` to zero and the
counter reads 0. On-device only.

**Spike code deleted during T1** (reversing an earlier note that said it would
be kept). It tripped the React Compiler lint rules, and the only honest ways
forward were fixing throwaway code or adding an exemption — neither worth it.
Everything durable is recorded here instead:

**What T13 needs from this spike:**

- **Measured versions:** `three@0.185.1`, `@react-three/fiber@9.7.0`,
  `@types/three@0.185.3`. Install these exact versions — 58fps was measured
  against them. `@react-three/drei` was **not** needed; do not add it.
- **Scene:** 400 nodes as one `instancedMesh` (`sphereGeometry` r=0.055, 8×8
  segments) + one `lineSegments` with a flat `Float32Array` of edge pairs,
  capped at 600 edges. One draw call each — that is why it is fast.
- **Canvas config:** `dpr={[1, 2]}`, `antialias: true`,
  `powerPreference: "high-performance"`.
- **React Compiler will reject the obvious implementation.** `Math.random()` and
  `performance.now()` are impure and cannot be called during render — the
  `react-hooks/purity` rule is an **error**, not a warning. Generate node
  positions and seed any timing outside render (effect or lazy init). Plan for
  this in T13; do not discover it again.
- **`three@0.185` warns** `THREE.Clock has been deprecated, use THREE.Timer` via
  R3F 9.7. Harmless, but it will appear in the console.

<details><summary>original spike definition</summary>

**Description:** The target is ≥50fps on mid-range Android. Raihan has never
written Three.js. If an instanced point cloud can't hold frame rate on his own
phone, the hero concept changes before any design work is built on top of it.

**Acceptance criteria:**
- [ ] ~400 instanced nodes + line segments render on a throwaway route
- [ ] ≥50fps sustained on a real mid-range Android over local network, measured — not guessed
- [ ] Bundle cost of `three` + R3F measured from `pnpm build` output

**Verification:** on-device check, numbers written into this plan.

**If it fails:** drop to a 2D canvas or animated SVG graph. The concept survives;
only the renderer changes.

**Dependencies:** None. **Scope:** S.

</details>

### Checkpoint: Phase 0 — ✅ complete
- [x] Both spikes answered, results recorded here
- [x] S1 passed — tool calling works, streaming included, no fallback needed
- [x] S2 passed — 58fps min on the reference device, R3F confirmed
- [x] No decision invalidated; `docs/spec.md` needs no change
- [x] Spike code removed in T1; durable findings recorded under S2 above
- [x] **Human review — approved, T1 started**

---

## Phase 1: Foundation

### T1: Strip the starter scaffolding

**Description:** Remove Prisma, Better Auth, TanStack Query, and every route and
lib that exists only to serve them. `AGENTS.md` documents that architecture and
is rewritten in the same commit so the repo never describes something untrue.

**Acceptance criteria:**
- [ ] Deleted: `app/login`, `app/signup`, `app/dashboard`, `app/api/auth`, `app/api/services`, `lib/prisma.ts`, `lib/auth*.ts`, `lib/portal-*.ts`, `lib/api-bounds*.ts`, `lib/services/`, `components/sign-out-button.tsx`, `components/providers/query-provider.tsx`, `prisma/`
- [ ] Removed from `package.json`: `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `pg`, `@types/pg`, `better-auth`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, and the `db:*` scripts
- [ ] `AGENTS.md` rewritten to describe this project
- [ ] `pnpm knip` reports no orphans

**Verification:** `pnpm verify` passes · `pnpm build` succeeds · `grep -ri "prisma\|better-auth" src/` returns nothing

**Dependencies:** None. **Scope:** L (deletion-heavy — mostly removal, low risk)

### T2: Content model

**Description:** The typed source of truth for every project and profile fact,
consumed by both pages and the chat. Bilingual fields are required by the type,
so a missing translation is a compile error rather than a hole in the page.

**Acceptance criteria:**
- [ ] `src/content/projects.ts` exports `Project[]` with both locales required per text field
- [ ] `src/content/profile.ts` holds bio, experience, education, certifications
- [ ] Real content written for AI work (anonymized — no employer or product names), Blockchain, Data/ML
- [ ] Test: unique slugs, both locales non-empty, `confidential: true` implies no `links`
- [ ] Test: no forbidden term appears anywhere in content (employer/product denylist)

**Verification:** `pnpm test:unit` · manual read-through against the spec's Confidentiality rules

**Dependencies:** T1. **Scope:** M

### T3: i18n routing

**Description:** Move everything under `app/[lang]/`, replace the auth `proxy.ts`
with locale detection, add EN/ID dictionaries. Per Next 16 bundled docs.

**Acceptance criteria:**
- [ ] `/` redirects to `/en` or `/id` based on `Accept-Language`, defaulting to `en`
- [ ] `/en` and `/id` both render; an unknown locale 404s via `hasLocale`
- [ ] `generateStaticParams` prerenders both locales
- [ ] `<html lang>` matches the active locale
- [ ] Test: `Accept-Language` → locale resolution, including fallback
- [ ] Test: `en.json` and `id.json` key sets are identical

**Verification:** `pnpm test:unit` · `pnpm build` shows both locales prerendered · manual browser-language check

**Dependencies:** T1. **Scope:** M

### Checkpoint: Foundation
- [ ] `pnpm verify` passes
- [ ] `pnpm build` clean, both locales static
- [ ] Zero references to Prisma, Better Auth, or TanStack Query
- [ ] **Human review before Phase 2**

---

## Phase 2: The site

Ships as a complete, launchable portfolio. No chat, no 3D. If everything after
this point were abandoned, this is still a site worth having.

### T4: Editorial design tokens

**Description:** Replace the starter's generic blue palette with the editorial
system — near-white ground, near-black ink, one accent, a real type scale.
Values change; token *structure* stays, so components need no edits.

**Acceptance criteria:**
- [ ] `globals.css` and `src/lib/design.ts` carry the new palette and type scale
- [ ] No component hardcodes a colour
- [ ] Both light and dark defined (dark can be deferred, but not half-done)
- [ ] `prefers-reduced-motion` handling defined once, globally

**Verification:** `pnpm build` · visual check of a token sample page

**Dependencies:** T3. **Scope:** S

### T5: Shell — nav, footer, locale toggle

**Acceptance criteria:**
- [ ] Header, footer, skip-to-content link
- [ ] Locale toggle preserves the current path (`/en/work/x` ↔ `/id/work/x`)
- [ ] Keyboard navigable, visible focus rings
- [ ] Responsive from 320px up with no horizontal scroll

**Verification:** keyboard-only pass · 320px viewport check

**Dependencies:** T3, T4. **Scope:** M

### T6: Work index

**Acceptance criteria:**
- [ ] Lists every project from `projects.ts`, grouped by pillar
- [ ] Confidential projects render without links and are visibly marked as such
- [ ] Both locales correct

**Verification:** `pnpm build` · both locales checked manually

**Dependencies:** T2, T5. **Scope:** S

### T7: Case study page

**Acceptance criteria:**
- [ ] `/[lang]/work/[slug]` renders problem → architecture → role → outcome
- [ ] `generateStaticParams` prerenders every project in both locales
- [ ] Unknown slug 404s
- [ ] No employer or product name anywhere, including metadata

**Verification:** `pnpm build` output lists all pages · `grep` for denylisted terms in `.next/server`

**Dependencies:** T2, T5. **Scope:** M

### T8: Hero, about, contact

**Description:** The hero ships with a **static** visual placeholder. The graph
replaces it in Phase 4 without a layout change — so the hero's dimensions and
type are settled now, and 3D never dictates the composition.

**Acceptance criteria:**
- [ ] Hero: name, positioning line, primary action — readable with zero JS
- [ ] About: bio, experience, education, certifications from `profile.ts`
- [ ] Contact: email and LinkedIn. No form (no backend, and a broken form is worse than none)
- [ ] Hero reserves the graph's exact final dimensions — no layout shift later

**Verification:** JS disabled in browser, page still complete · CLS check

**Dependencies:** T2, T5. **Scope:** M

### Checkpoint: Shippable site
- [ ] `pnpm verify` passes
- [ ] Lighthouse mobile ≥ 90, LCP < 2.5s, CLS < 0.1
- [ ] Full keyboard pass, both locales
- [ ] **Deployable as-is. Human review before Phase 3.**

---

## Phase 3: The chat

### T9: Chat route

**Acceptance criteria:**
- [ ] `POST /api/chat` streams from the OpenAI-compatible endpoint via AI SDK
- [ ] `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` read server-side only
- [ ] System prompt injects `projects.ts` + `profile.ts` and the active locale — the bot answers in the visitor's language
- [ ] System prompt forbids naming the employer and its products
- [ ] `max_tokens` and message-history length are capped
- [ ] Missing env vars fail loudly at request time, not silently

**Verification:** `curl` against local dev · confirm no key in the client bundle (`grep` the build output)

**Dependencies:** T2, S1. **Scope:** M

### T10: Rate limiting

**Description:** Must land before the route is ever public. This is company GPU
capacity behind it.

**Acceptance criteria:**
- [ ] Per-IP limit enforced on `/api/chat`
- [ ] Exceeding it returns 429 with a message the UI renders
- [ ] Approach documented in the spec — WAF rule or in-function, whichever the Vercel plan allows

**Verification:** hammer the endpoint locally, confirm 429

**Dependencies:** T9. **Scope:** S

### T11: Chat UI

**Acceptance criteria:**
- [ ] Panel opens/closes; site fully usable when closed
- [ ] **Three suggested questions visible on open** — never a bare input (spec assumption #2)
- [ ] Streaming renders token by token; visible thinking/loading state
- [ ] Errors and 429s render as messages, not silent failures
- [ ] Keyboard accessible, focus trapped while open, Esc closes

**Verification:** keyboard-only pass · manual error-path check with the key unset

**Dependencies:** T9, T10. **Scope:** M

### T12: Project-card tool

**Acceptance criteria:**
- [ ] Tool `showProject(slug)` defined with a zod schema
- [ ] Slug validated against `projects.ts`; unknown slugs rejected, not rendered
- [ ] A valid call renders a clickable card linking to the case study
- [ ] Test: schema accepts valid slugs, rejects junk (trust boundary)

**Verification:** `pnpm test:unit` · ask the bot 10 real questions, confirm correct cards

**Dependencies:** T11, S1. **Scope:** M

### Checkpoint: Chat
- [ ] `pnpm verify` passes
- [ ] Rate limiting confirmed working
- [ ] No secret in the client bundle
- [ ] Bot answers correctly in **both** languages
- [ ] Bot never names the employer across 10 adversarial prompts
- [ ] **Human review before Phase 4**

---

## Phase 4: The graph

### T13: Idle graph

**Acceptance criteria:**
- [ ] Instanced nodes + line segments, hairline strokes on the editorial ground — technical drawing, not sci-fi hologram
- [ ] `next/dynamic` with `ssr: false`; hero text never waits on it
- [ ] ≥50fps on the S2 reference device
- [ ] Frozen (not merely slowed) under `prefers-reduced-motion`
- [ ] WebGL unavailable → static fallback, no error, no layout shift

**Verification:** on-device fps · WebGL disabled via browser flags · reduced-motion emulation

**Dependencies:** T8, S2. **Scope:** M

### T14: Graph ↔ chat wiring

**Description:** The payoff. A pulse travels the graph while the bot works; the
node for a returned project lights.

**Acceptance criteria:**
- [ ] Graph reacts visibly while a response streams
- [ ] A `showProject` result highlights that project's node
- [ ] Chat remains fully functional with the graph absent or WebGL off
- [ ] No frame-rate regression against T13's measurement

**Verification:** on-device fps during an active chat · full flow with WebGL disabled

**Dependencies:** T12, T13. **Scope:** M

### Checkpoint: Concept complete
- [ ] The end-to-end flow works: ask → graph reacts → card returned → click → case study
- [ ] Frame rate holds on real hardware
- [ ] **Human review before Phase 5**

---

## Phase 5: Ship

### T15: Performance and accessibility pass
- [ ] Every target in the spec's Success Criteria table measured and recorded
- [ ] Fonts subset and preloaded; images sized; no CLS
- [ ] Full keyboard pass; contrast checked; `alt` text present
- **Verification:** Lighthouse mobile, real-device check, recorded numbers

### T16: Metadata and SEO
- [ ] Per-locale title/description, OG image, `hreflang` alternates, sitemap, `robots.txt`
- [ ] **No denylisted term in any metadata**
- **Verification:** `grep` the build output; OG preview check

### T17: Deploy
- [ ] Vercel project linked, env vars set in dashboard (never committed)
- [ ] Custom domain + TLS
- [ ] Rate limiting verified **in production**, not just locally
- [ ] Analytics/Speed Insights enabled
- **Verification:** production smoke test on a real phone over mobile data

### Checkpoint: Launch
- [ ] All spec Success Criteria met and measured
- [ ] `pnpm verify` green
- [ ] Live on the custom domain

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| vLLM endpoint lacks tool calling | **High** — kills the project-card feature | Spike S1 before any chat work; fall back to structured-text parsing |
| R3F can't hold 50fps on mid-range Android | **High** — invalidates the hero | Spike S2 first; fall back to 2D canvas / SVG |
| Access to the company endpoint is revoked | Medium — site's chat dies | Provider is env-only; swapping to Groq/OpenRouter is a dashboard change |
| Abuse burns company GPU capacity | **High** — reputational, on the person who authorized it | T10 lands before the route is ever public; token caps in T9 |
| Bot leaks the employer name | **High** — the one thing that must not happen | System-prompt constraint (T9), content denylist test (T2), adversarial check at the Phase 3 checkpoint, metadata grep (T16) |
| Anonymized case studies read as vague | Medium — weakens the whole site | Concrete architecture and role detail; no name needed to describe a retry policy |
| Zero Three.js experience | Medium — schedule, not feasibility | S2 is the learning task; the graph is deliberately the simplest viable scene |
| Scope creep into CRUD/blog/extra 3D | Medium | Spec's "Not Doing" list; anything new goes to a new spec |

## Parallelization

Mostly sequential — one maintainer. Genuinely independent:

- **S1 and S2** can run in either order, or together
- **T6, T7, T8** are independent once T5 lands
- **T16** can be written any time after T7

Strictly sequential: T1 → T2/T3 → everything, and T9 → T10 → T11 → T12.

## Open Questions

- WAF rate limiting on Hobby, or in-function fallback? Blocks T10, not earlier.
- Custom domain name? Blocks T17 only.
- Usable photo of Raihan? Editorial layouts lean on portraiture — affects T8.
- Publish the `Playground/` projects? Would add entries to T2. Deferred.
