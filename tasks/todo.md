# TODO: Agent Graph Portfolio

Plan: [`tasks/plan.md`](./plan.md) · Spec: [`docs/spec.md`](../docs/spec.md)

Definition of done for every task: `pnpm verify` passes, output read, no lint
exemption added to get there.

---

## Phase 0 — De-risk ✅ done (2026-08-03)

- [x] **S1** Tool calling on the vLLM endpoint — **PASSED**, streaming included. No fallback needed.
- [x] **S2** R3F frame rate — **PASSED**, min 58fps on Redmi Note 11 (the project's reference device)

**Checkpoint 0:** ✅ both passed · no decision invalidated · `spike/r3f-perf` kept as the T13 reference · **awaiting human review before Phase 1**

---

## Phase 1 — Foundation

- [x] **T1** Strip Prisma / Better Auth / TanStack Query, rewrite `AGENTS.md` — **done 2026-08-03**
  - typecheck ✅ · lint ✅ · build ✅ (2 static routes) · knip ✅ · grep for old stack ✅ empty
  - `pnpm test:unit` ✅→ **fails: "No test files found"**. Every test in the repo covered
    deleted modules. Deliberately *not* papered over with `passWithNoTests` — that flag
    permanently hides a broken test glob. **T2 closes this** with the first real tests.
  - Also removed (found during the task, not in the original scope):
    root `SPEC.md` (was the `next-js-starter` spec, not this project's),
    `prisma.config.ts`, `src/components/ui/input.tsx` (orphan),
    `STATUS_TONE`/`StatusTone` (orphan exports), CI's `db:generate` step and
    build secrets, `.env.example` rewritten to `LLM_*`, `README.md` rewritten,
    package renamed `next-js-starter` → `portfolio-website`
- [x] **T2** Content model — `src/content/projects.ts`, `src/content/profile.ts` — **structure done 2026-08-04**
  - `pnpm verify` ✅ green again (12 tests) — closes T1's "No test files found"
  - Denylist stores **SHA-256 hashes, not plaintext**: a test file listing the
    employer's product names would be the leak it exists to prevent. Includes a
    control test proving the detector actually fires, and a floor on how much
    content it scans, so the guard cannot silently become vacuous.
  - ⚠️ **Blocked on Raihan:** the four `pillar: "ai"` projects are **DRAFTS**
    written from folder names alone. Every `problem` / `role` / `outcome` string
    on them starts with `DRAFT —` and must be replaced with what he actually
    built. Truthful already: `carbon-credit-tokenization`, `social-media-analytics`,
    and all of `profile.ts` (sourced from his public LinkedIn).
  - Open decision: `profile.ts` names **ADS Digital Partner** as a 2023 role.
    That is on his public LinkedIn already, so it is not in the denylist —
    confirm that is intended.

- [ ] **Launch gate:** no `DRAFT` string survives anywhere in `src/content/`.
  Checked by hand at Checkpoint 2 and by grep in **T16**. Deliberately not a
  unit test — a permanently red gate trains people to ignore red.
- [x] **T3** i18n routing — `app/[lang]/`, dictionaries, locale-detecting `proxy.ts` — **done 2026-08-04**
  - `pnpm verify` ✅ 26 tests · `pnpm build` ✅ prerenders `/en` and `/id` · knip ✅
  - Verified live: `/`+`id-ID`→`/id`, `/`+`fr-FR`→`/en`, `en;q=0.3,id;q=0.9`→`/id`,
    `/fr/about`→`/en/fr/about`→404, `/id` renders `lang="id"` with Indonesian copy
  - **`Accept-Language` parsed by hand** (`src/lib/locale.ts`) instead of adding
    `negotiator` + `@formatjs/intl-localematcher`. Two dependencies to rank two
    locales is a bad trade, and it runs on every cold request. 10 tests cover it.
  - **The proxy guarantees a valid `lang`.** Anything without a supported locale
    prefix is redirected under one, so no page has to defend against a bogus
    locale — `/fr/about` 404s as `/en/fr/about` rather than reaching a layout
    that would load a dictionary that does not exist.
  - ⚠️ **Do not use Next's global `PageProps`/`LayoutProps` helpers.** They are
    generated into `.next/types` by a build, and CI runs `typecheck` **before**
    `build` — on a clean clone they do not exist and the gate fails for a reason
    unrelated to the code. Params are typed explicitly instead.
  - Known gap: `not-found.tsx` receives no params, so it renders in the default
    locale. Noted in the file; revisit only if it proves to matter.

**Checkpoint 1:** verify green · build clean · zero auth/db references · **human review**

---

## Phase 2 — The site (shippable on its own)

- [x] **T4** Editorial design tokens — **done 2026-08-04**
  - **Direction: "baseline and deviation".** Raihan builds systems that watch a
    normal signal and catch the moment it departs from it. The page works the
    same way: everything is calm and mono-labelled so the one loud element reads
    as a deviation. **Boldness is spent once — do not add a second accent.**
  - Accent is **natural indigo `#26346e`** (indigofera, the Indonesian batik
    dye), not a framework blue. Ground is cool screen-white, not warm cream.
  - Type is **Archivo + IBM Plex Mono**, replacing Geist — Geist is the Vercel
    default and reads as templated.
  - `EYEBROW` (mono, uppercase) **only ever wraps real data** — a date, a count,
    a stack entry. The moment it holds a decorative word it becomes the template
    device it exists to avoid.
  - ⚠️ **`TEXT.faint` was failing WCAG AA.** As `muted-foreground/70` it
    composited to 3.15:1 light / 3.95:1 dark against the 4.5 threshold for
    normal text. Now its own measured token (4.77 / 5.16). Raising the opacity
    to 0.9 would also have passed but rendered identical to `subtle`, leaving a
    token that means nothing. All three text levels now clear AA in both schemes.
  - Semantic token *names* were kept from the starter, so the identity changed
    with zero component edits.

- [x] **T5** Shell — nav, footer, locale toggle, skip link — **done 2026-08-04**
  - `pnpm verify` ✅ 31 tests · `pnpm build` ✅ · knip ✅
  - Verified at 393px and 1280px, light and dark, EN and ID
  - Header **wraps** instead of collapsing to a hamburger: three anchors do not
    justify a menu, and every destination stays reachable without JavaScript.
    Each control is rendered **once** — duplicating nav behind breakpoints is
    how two copies drift apart.
  - Locale toggle keeps the reader on the same page (`localizePath`, 5 tests).
    Rendered as links, not buttons, so each locale is a real crawlable URL.
  - Locale links use `aria-label` with the language name; a visible code plus an
    sr-only name announced as "en English".
  - **No copyright year in the footer** — pages are statically generated, so
    `new Date()` freezes at build time and goes quietly wrong every January.
- [x] **T6** Work index — **done 2026-08-04**
  - **Deviation from the original acceptance criteria:** ordered by pillar with a
    pillar label on each entry, *not* split under group headings. Grouping was
    tried and reads badly at 4/1/1. The counts eyebrow (`4 AI · 1 BLOCKCHAIN ·
    1 DATA`) states the three-pillar claim without the lopsided structure — and
    it is real data, so it obeys the EYEBROW rule.
  - Confidential entries carry an "Under NDA" / "Terikat NDA" badge. Naming the
    constraint is more credible than an unexplained gap.
- [x] **T7** Case study page `/[lang]/work/[slug]` — **done 2026-08-04**
  - 17 static pages build (6 projects × 2 locales + shell). Unknown slug → 404.
  - Per-locale `generateMetadata`; verified `<title>` differs EN vs ID.
  - Confidential projects render **zero** external links (grep-verified).
- [x] **T8** Hero, about, contact — **done 2026-08-04**
  - **Built the static graph now, not in T13.** The hero must reserve the
    canvas's exact box to avoid layout shift, and an empty reserved box looks
    broken on a site that is supposed to be deployable at this checkpoint. T13
    needs this still as its WebGL-blocked / reduced-motion fallback anyway, so
    it is the fallback built early rather than a throwaway placeholder.
  - Graph geometry is a **literal generated from a seeded LCG** — nothing is
    computed at render. `Math.random()` during render is an error under the
    React Compiler purity rule (see S2), and a graph that reshuffles per render
    would be noise, not a signature. One node is accent-coloured: the deviation.
  - Contact is two links, **no form** — there is no backend, and a form that
    silently drops messages is worse than an address.
  - Dates via `Intl` (`src/lib/format.ts`), not a month-name table in the
    dictionaries: 12 names × 2 locales is content to translate and keep in
    parity forever when the platform already knows them. UTC pinned so January
    cannot render as the previous December.

**Checkpoint 2:** ✅ verify 36 tests · build 17 static pages · knip clean ·
no confidential term in build output (grep) · 393px + 1280px, light + dark,
EN + ID · **still to measure: Lighthouse, LCP, CLS, full keyboard pass**
⚠️ **8 built pages still contain `DRAFT`** — blocked on Raihan's case studies.

---

## Phase 3 — The chat

- [x] **T9** `POST /api/chat` — **done 2026-08-04; live streaming verified**
  - `pnpm verify` ✅ · knip ✅
  - AI SDK is **v7** (`ai@7.0.50`), not the v6 the plan assumed. Current API is
    `streamText` → `toUIMessageStream` → `createUIMessageStreamResponse`, and
    tools take `inputSchema` (not `parameters`). Read `node_modules/ai/docs/`
    before writing T11/T12 — do not write these from memory.
  - 🐞 **Found and fixed a bug that killed the whole feature.** The T3 proxy
    matcher did not exclude `/api`, so `POST /api/chat` was 307-redirected to
    `/en/api/chat` and the route never ran. A redirect also downgrades POST to
    GET, so it presented as a routing bug rather than a proxy one. Now covered
    by `src/proxy.test.ts` (4 tests) so it cannot regress.
  - Verified by request: 400 non-JSON · 400 empty · 413 too many messages ·
    413 oversized message · 502 with a loud server-side log when `LLM_*` is
    unset · pages still redirect (`/` → `/en`).
  - Caps: 20 messages, 2000 chars/message, 800 output tokens. Env is read at
    **request** time so the build never needs a secret.
  - Upstream errors are logged, never returned — the message can name the
    upstream host.
  - ✅ **Live streaming verified 2026-08-04** with `.env.local`: POST 200, SSE
    `start` → `text-delta` → `finish` in EN and ID. Model also emits
    `reasoning-delta` (ignored in the UI — we only render text parts).
- [x] **T10** Rate limiting — **done 2026-08-04**
  - `pnpm verify` ✅ 59 tests · `pnpm build` ✅ (`/api/chat` is the only dynamic
    route) · knip ✅
  - **Decision: in-function limiter, not Vercel WAF.** WAF rate-limiting rules
    and `@vercel/firewall` are both paid-plan features configured in a
    dashboard, so the limit could not run in dev or CI and would be unverifiable
    until production. Open Question 2 in `docs/spec.md` is now resolved this way.
  - Two windows from one limiter: **8/minute** (stops a script without making a
    real conversation feel restricted) and **60/hour** (what actually bounds the
    bill — 8/min alone permits >11,000 generations a day from one address).
  - Runs **before** parsing and before any upstream call: the cheapest rejection
    must come first when the endpoint spends someone else's GPU capacity.
  - **Known limit, accepted:** state is per instance, so the real ceiling is
    (limit × instances). It stops the realistic threat; Vercel's DDoS protection
    covers volume. Swapping in a shared store later does not change the call site.
  - Verified live: requests 1–8 pass, 9th and 10th return **429 with
    `retry-after: 60`**, and a different IP is unaffected.
  - ➡️ **T11 must render 429** — map status → localized copy client-side, since
    the client already knows the locale. The route returns English fallback text.
- [x] **T11** Chat UI — **done 2026-08-04**
  - `pnpm verify` ✅ 63 tests · `pnpm build` ✅ · knip ✅
  - `@ai-sdk/react` + `DefaultChatTransport`; locale in transport `body`.
  - Closed by default (launcher FAB); three suggested questions on open; token
    streaming via `parts`; thinking state while `submitted`/`streaming`.
  - 429 → localized rate-limit copy (parses error body); other failures →
    generic unavailable + retry. Esc closes; Tab cycles; focus restored.
  - Mounted in `[lang]/layout` so every page can open it without the page
    depending on it.
- [x] **T12** `showProject(slug)` tool + project card — **done 2026-08-04**
  - `pnpm verify` ✅ 70 tests · `pnpm build` ✅ · knip ✅
  - Zod `enum` of real slugs from `projects.ts` (trust boundary + 6 unit tests).
  - Server tool via AI SDK v7 `tool({ inputSchema, execute })`; locale-aware
    card payload; `stopWhen: isStepCount(5)` so the model can talk after the card.
  - UI renders `tool-showProject` → clickable `ProjectCard` → `/[lang]/work/[slug]`.
  - ✅ Live: model called `showProject` with `carbon-credit-tokenization`,
    `tool-output-available` with `ok: true`, then text follow-up.

**Checkpoint 3:** rate limiting works · no secret in client bundle · correct in both languages · survives 10 adversarial "who do you work for?" prompts · **human review**

---

## Phase 4 — The graph

- [x] **T13** Idle graph — **code done 2026-08-04; on-device fps NOT yet re-measured**
  - `pnpm verify` ✅ 63 tests · `pnpm build` ✅ · knip ✅
  - Exact S2 versions: `three@0.185.1`, `@react-three/fiber@9.7.0`, `@types/three@0.185.3`.
    **No `@react-three/drei`.**
  - Scene: 400 instanced spheres + ≤600 line segments, seeded LCG geometry at
    module load (never during render — React Compiler purity). One accent
    signal node. Slow group drift only.
  - Canvas: `dpr={[1,2]}`, `antialias`, `powerPreference: "high-performance"`,
    `alpha: true`, `pointer-events: none` so mobile scroll is not stolen.
  - **Next 16 gotcha:** `next/dynamic` with `ssr: false` is illegal in Server
    Components. Dynamic lives inside the client island (`hero-graph.tsx`),
    which the server Hero imports normally. Server snapshots force the still
    so SSR HTML never assumes WebGL.
  - Fallbacks: `prefers-reduced-motion` → `GraphStill` (frozen, not slowed);
    WebGL unavailable → `GraphStill`; loading → `GraphStill`. Same aspect box.
  - Graph client chunk ~234KB gzip (three + R3F). Lazy — not in the
    graph-excluded first paint budget.
  - ⏳ **On-device fps** still needs a Redmi Note 11 check (S2 was 58fps on a
    near-empty page; do not spend the headroom). Cannot measure from the
    in-app browser pane.
- [x] **T14** Graph ↔ chat wiring — **code done 2026-08-04; on-device fps during chat NOT re-measured**
  - `GraphActivityProvider` in layout bridges chat → graph without coupling modules.
  - Streaming (`submitted`/`streaming`) → edge opacity pulse + brightness wave +
    slightly faster drift.
  - `showProject` outputs → stable slug→node index (`project-nodes.ts`) lights
    those instances in accent colour (scale 2.2).
  - Chat still works with graph absent / WebGL off / reduced-motion still (context
    setters are no-ops or the still simply ignores them).
  - ⏳ On-device fps during an active chat still needs Redmi Note 11 check.

**Checkpoint 4:** ask → graph reacts → card → click → case study · fps holds · **human review**

---

## Phase 5 — Ship

- [x] **T15** Performance + accessibility pass — **measured 2026-08-04**
  - **Changes:** Archivo weights 400/500/600 + preload + fallback metrics;
    chat idle-loaded via `ChatMount` (no `@ai-sdk/react` on first paint);
    removed unused starter SVGs; LinkedIn `aria-label` for new tab; locale
    switch accessible name includes visible code; chat launcher
    `aria-expanded` / `aria-haspopup`.
  - **Lighthouse mobile** (`localhost` production, simulated throttle):
    | Metric | Target | Measured |
    |---|---|---|
    | Performance | ≥ 90 | **99** |
    | Accessibility | — | **100** |
    | LCP | < 2.5s | **2.11s** |
    | CLS | < 0.1 | **0** |
    | FCP | — | 0.76s |
    | TBT | — | 22ms |
  - **JS first-load (HTML script tags, gzip), graph excluded:** ~**205 KB**.
    Graph chunk (~234 KB gzip) is **not** in first-load HTML (dynamic). Spec
    target &lt;150 KB is below Next 16 + React 19 framework floor here; the
    intentional split (graph/chat deferred) is what we control. Recorded
    honestly rather than redefined.
  - **Secret exposure:** LLM_API_KEY not present in `.next/static` (grep).
  - **WebGL-off / reduced-motion:** still uses `GraphStill` (T13).
  - **Locale parity / verify:** dictionary tests + `pnpm verify` 75 tests.
  - ⏳ **Not re-measured here:** on-device graph fps, chat first-token on 4G
    (need phone + live network). Lighthouse is lab, not field.
- [ ] **T16** Metadata, OG, `hreflang`, sitemap, `robots.txt` — denylist grep on build output
- [ ] **T17** Deploy — Vercel, env vars in dashboard, custom domain, rate limiting verified **in production**

**Checkpoint 5:** every spec Success Criterion measured · live on the domain

---

## Blocked / needs an answer

- [x] WAF rate limiting on Hobby, or in-function fallback? → **T10 chose in-function**
- [ ] Custom domain name? → blocks **T17**
- [ ] Usable photo? → affects **T8**
- [ ] Publish `Playground/` projects? → would add entries to **T2**. Deferred.
