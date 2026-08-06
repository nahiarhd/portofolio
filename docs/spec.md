# Spec: Portfolio Website — Agent Graph

Status: **awaiting approval** · Created 2026-08-03
Concept doc: [`docs/ideas/agent-graph-portfolio.md`](./ideas/agent-graph-portfolio.md)

---

## Assumptions

1. **Deployment is Vercel** — confirmed. Hobby tier + a purchased custom domain.
   No VPS, no Supabase, no database. The site is static pages plus one streaming
   function (`/api/chat`); nothing about it needs a persistent server.
2. **`en` is the default locale**, `id` is the toggle. Root `/` redirects to a
   locale based on `Accept-Language`.
3. ~~Company names can be mentioned.~~ **WRONG — corrected 2026-08-03.**
   Employer and product names **cannot** be stated publicly. See "Confidentiality"
   below.
4. **One person maintains this.** No collaborators, no review process.
5. **The chat is answer-only.** It reads project data and returns cards. It
   never sends email, never books meetings, never writes anywhere.
6. **No CMS, ever.** Content changes are code commits.

---

## Confidentiality

**Hard constraint. This shapes the entire content strategy.**

The current employer's products are live and public, but Raihan **cannot state
publicly that he worked on them**. Therefore the site must **never**:

- Name the employer, its products, or its clients
- Link to those product sites
- Screenshot their UI, or reproduce their module names or feature taxonomy
- Include any detail specific enough to identify them by search

Case studies are **anonymized by construction**: "an on-premises AI intelligence
platform for public-sector institutions." No name, no link, no metric.

**Consequence, stated plainly:** every claim about his current work is
unverifiable by the reader. The site's own craft is not part of the credibility
argument — it is *most* of it.

**Recommended mitigation (pending decision):** publish one or two small,
finished, open-source projects of his own that demonstrate the same skills — an
agent, a scraper, an NLP tool. This converts "trust me" into "look." Tracked as
Open Question 3.

---

## LLM Provider

The chat runs on **`gpt-oss-120b`** served over an OpenAI-compatible API.

Initial endpoint is the employer's self-hosted vLLM instance. **Raihan has
confirmed he has authorization to use it for this site** (2026-08-03).

The hostname and model id are **deliberately not written here.** Both name the
employer, and this file is part of a repository that will be public. They live
in `LLM_BASE_URL` and `LLM_MODEL` only. See Confidentiality above.

Configuration is server-side only, never `NEXT_PUBLIC_*`:

```
LLM_BASE_URL      OpenAI-compatible base URL
LLM_API_KEY       bearer token
LLM_MODEL         model id
```

**Design requirement: the provider must be swappable by changing environment
variables alone.** No provider name, URL, or model id appears in source. Because
the API is OpenAI-compatible, moving to Groq, Cerebras, Together, Fireworks, or
OpenRouter is a config change, not a code change. This removes the dependency
risk of relying on infrastructure Raihan does not own.

Operational rules:

- The upstream URL and key stay in the route handler. They never reach the
  browser — a visitor can only abuse `/api/chat`, not the upstream directly.
- `/api/chat` **must** be rate limited before launch. On shared company
  infrastructure, abuse consumes their GPU capacity and reflects on the person
  who authorized the access.
- Cap `max_tokens` and conversation length per request. An unbounded context is
  an unbounded cost.
- Any key committed, pasted, or logged is considered compromised and rotated.

---

## Objective

A personal site for Raihan Hidayatullah Djunaedi (Bekasi, Indonesia) that proves
he builds serious AI work when none of that work can be linked or open-sourced.

**Users:** anyone who lands on it — recruiters, engineers, peers. Not a single
funnel.

**Success:** a visitor is convinced by the *work* and impressed by the *craft* —
both. The site itself is the strongest portfolio piece on it.

**Why now:** his public record stops at December 2024. Everything since is
NDA-bound company work.

### Acceptance criteria

- [ ] Every section is fully readable and navigable **with the chat closed and
      WebGL disabled**. The 3D and the bot are enhancements, never dependencies.
- [ ] Case studies exist for AI work, Blockchain, and Data/ML, each with a
      problem → architecture → role → outcome structure.
- [ ] The chatbot answers questions about his experience and returns **clickable
      project cards**, not just prose.
- [ ] The hero graph reacts visibly while the bot is working.
- [ ] Full EN and ID coverage, including the bot's replies.

---

## Tech Stack

Existing (keep):

| Package | Version | Note |
|---|---|---|
| `next` | 16.2.12 | App Router. Uses `proxy.ts`, **not** `middleware.ts` |
| `react` / `react-dom` | 19.2.4 | |
| `tailwindcss` | 4 | via `@tailwindcss/postcss` |
| `typescript` | 5 | |
| `vitest` | 4.1.10 | unit tests |
| `eslint` 9 + `eslint-config-next` | | `no-unused-vars` is an **error** |
| `knip` | 6 | dead-code report, advisory |
| `clsx`, `tailwind-merge`, `class-variance-authority` | | keep for `cn()` + variants |

To add:

| Package | Purpose |
|---|---|
| `three`, `@react-three/fiber`, `@react-three/drei` | hero graph only |
| `ai` (AI SDK v6) + `@ai-sdk/openai-compatible` | chat over a configurable OpenAI-compatible endpoint |
| `zod` | tool-call argument schemas |
| a motion library (`motion`) | editorial motion craft — **evaluate against CSS first** |

**To delete (unused by this project):** `@prisma/client`, `@prisma/adapter-pg`,
`prisma`, `pg`, `@types/pg`, `better-auth`, `tsx`, `dotenv`, and probably
`@tanstack/react-query` — nothing here fetches client-side except the chat, and
the AI SDK owns that.

> **Version caution:** AI SDK v6 and R3F APIs move fast. Read the installed
> package docs at implementation time. Do not write these from memory.

---

## Commands

```
Dev        pnpm dev
Build      pnpm build
Typecheck  pnpm typecheck
Lint       pnpm lint
Unit test  pnpm test:unit
Verify     pnpm verify          # typecheck + lint + test:unit — the gate
Dead code  pnpm knip            # advisory only
```

`pnpm verify` must pass before any work is called done. The `db:*` scripts get
removed with Prisma.

---

## Project Structure

```
src/
  proxy.ts                     locale detection + redirect (Next 16 name)
  app/
    [lang]/
      layout.tsx               <html lang>, fonts, generateStaticParams
      page.tsx                 hero + sections
      work/[slug]/page.tsx     case study
      dictionaries.ts          getDictionary / hasLocale
      dictionaries/en.json
      dictionaries/id.json
    api/chat/route.ts          streaming chat, the only dynamic route
    globals.css                design tokens
  content/
    projects.ts                typed project data — the single source of truth
    profile.ts                 bio, experience, education, certifications
  components/
    graph/                     R3F scene — client-only, dynamically imported
    chat/                      chat panel + message + project card
    ui/                        button, input (existing)
  lib/
    design.ts                  tokens (existing)
    utils.ts                   cn() (existing)
docs/
  spec.md                      this file
  ideas/                       concept one-pagers
tasks/
  plan.md, todo.md             produced in Phase 2/3
```

**Deleted:** `app/login`, `app/signup`, `app/dashboard`, `app/api/auth`,
`app/api/services`, `lib/prisma.ts`, `lib/auth*.ts`, `lib/portal-*.ts`,
`lib/api-bounds.ts`, `lib/services/`, `components/sign-out-button.tsx`, and
their tests. `AGENTS.md` must be rewritten in the same commit — it currently
documents a Prisma/Better-Auth architecture that will no longer exist.

---

## Code Style

Server Component by default. `"use client"` only where interactivity or WebGL
demands it. Content is typed data, never inline JSX strings.

```ts
// src/content/projects.ts — the single source of truth for work AND for the bot
export type Pillar = "ai" | "blockchain" | "data";

export type Project = {
  slug: string;
  pillar: Pillar;
  /** Both locales required — the compiler enforces bilingual content. */
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  problem: Record<Locale, string>;
  role: Record<Locale, string>;
  /** Concrete result. A case study without one is not finished. */
  outcome: Record<Locale, string>;
  stack: string[];
  /** NDA-bound work has no repo and no live URL. */
  links?: { repo?: string; live?: string };
  confidential: boolean;
};

export const projects: readonly Project[] = [ /* ... */ ];
```

Conventions:

- `kebab-case.tsx` files, `PascalCase` components, `camelCase` functions.
- Colors and spacing come from `src/lib/design.ts` / `globals.css`. **Never**
  hardcode `text-gray-500` — that is how eleven different greys start.
- `cn()` from `src/lib/utils.ts` for conditional classes.
- No wrapper that only forwards to one other function.
- No export that nothing imports.

---

## Testing Strategy

Vitest, colocated `*.test.ts`. Must pass on a clean clone with **no database and
no API key**.

| What | Why it earns a test |
|---|---|
| `content/projects.ts` integrity | every project has both locales, unique slugs, and a non-empty `outcome`; `confidential: true` implies no `links` |
| chat tool argument parsing | zod schema accepts valid slugs, rejects junk — this is a trust boundary |
| locale resolution in `proxy.ts` | `Accept-Language` → locale, with fallback to `en` |
| dictionary parity | `en.json` and `id.json` have identical key sets |

Not unit-tested: R3F rendering, LLM output quality, visual layout. Those are
verified by hand on a real device.

---

## Boundaries

**Always**
- Run `pnpm verify` and read the output before claiming anything works.
- Read the installed package's docs (`node_modules/next/dist/docs/`, AI SDK,
  R3F) before writing against its API.
- Keep the site fully functional with JS-heavy features off.
- Respect `prefers-reduced-motion` — the graph must freeze, not just slow down.

**Ask first**
- Adding any dependency (each one is a bundle cost on a mid-range phone).
- Making the 3D scene more expensive than instanced points + line segments.
- Anything that turns the site dynamic (DB, auth, server state).
- Publishing the `Playground/` projects.

**Never**
- Put a provider API key in `NEXT_PUBLIC_*` or any client-imported module.
- Ship an unrate-limited public LLM endpoint.
- Hardcode a provider URL, key, or model id in source — env vars only, so the
  provider stays swappable.
- Name the employer, its products, or its clients — anywhere, including
  `alt` text, meta tags, commit messages, and the chatbot's system prompt.
- Add a lint exemption to make a gate pass.
- Claim a performance number without measuring it on a real device.

---

## Success Criteria

Measurable, verified before launch:

| Criterion | Target | How verified |
|---|---|---|
| Mobile Lighthouse performance | ≥ 90 | Lighthouse, mobile preset, throttled |
| LCP on 4G | < 2.5s | Lighthouse / Vercel Speed Insights |
| CLS | < 0.1 | Lighthouse |
| Hero graph frame rate | ≥ 50fps sustained on a mid-range Android | real device, not desktop throttling |
| Chat first token | < 2s | manual, on 4G |
| JS with graph excluded | < 150KB gzipped | `pnpm build` output |
| Site usable with WebGL blocked | fully | disable WebGL in browser flags |
| Locale coverage | 100% both | dictionary parity test |
| `pnpm verify` | passes | CI |
| Secret exposure | zero | grep the built client bundle for the key |

---

## Open Questions

Blocking Phase 2 (plan):

1. ~~Which provider hosts `gpt-oss-120b`?~~ **Resolved** — employer's vLLM
   instance, with authorization. Kept swappable via env vars. See
   "LLM Provider".
2. **How is `/api/chat` protected?** Recommendation: Vercel WAF rate limiting
   (platform-native, no Redis dependency) + a hard provider spend cap.
   **Unverified:** whether WAF rate-limiting rules are available on Hobby or
   require Pro — the docs did not say. Check the dashboard. Fallback is an
   in-function limiter plus the spend cap.
3. **Does the site ship with original public projects, or claims alone?**
   With no nameable work and no metrics, this is the difference between a
   portfolio that asserts and one that demonstrates. See "Confidentiality".

Non-blocking:

4. Publish `Playground/` projects (`handsome-detector`, `bot-atul`, `her`,
   `yono-cathering`, `ide-mas-arda`)? They make him human, which is memorable.
5. Which custom domain?
6. Is there a usable photo of him? Editorial layouts lean on portraiture.
