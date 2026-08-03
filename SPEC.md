# SPEC — Raihan's Starter Templates

Status: **awaiting approval**. Nothing is built yet.

## 1. Objective

Two starter repos that encode how Raihan builds software, so a project cloned
from either begins with working quality gates and an `AGENTS.md` that tells any
agent (Claude, Codex, Cascade) the rules — without him re-explaining them.

The problem being solved is not "we need a scaffold." It is that ungated,
unguided AI-assisted work drifts. In AI-Services-UI that drift cost 4,243 lines
of orphan files, a 5-function chain to resolve one URL, an unbounded chat-history
query, and a `localStorage` write nothing ever read. Every rule below traces to
one of those.

**Deliverable A** — `next-js-starter` (Development/Frontend/next-js-starter).
**Deliverable B** — upgrades to the existing `fastapi-starter`.

Both push to **private GitHub repos**.

### Success criteria

1. `git clone` → install → **all gates pass on the first run**, no fixing required.
2. An agent opening the repo can state the layering rule and the verify command
   without being told.
3. The frontend starter boots to a working login → dashboard on a fresh database.
4. No secret can reach the browser bundle by following the documented pattern.

## 2. Stack decisions (and why)

| Choice | Decision | Rationale |
|---|---|---|
| Framework | **Next.js 15, App Router, React 19** | Matches AI-Services-UI, so knowledge transfers both ways. TanStack Start is RC/v1.x with breaking changes possible between minors — wrong risk profile for a template you clone and ignore for six months. Revisit after 1.0 stabilises. |
| Language | TypeScript, `strict: true` | The typecheck is the gate that caught every codemod failure. |
| Data fetching | **TanStack Query** | Already proven across 51 files in AI-Services-UI. Devtools mounted in dev. |
| Auth | **Better Auth** | Running in production today; httpOnly cookie sessions, username plugin. |
| Database | **Prisma + PostgreSQL** | Existing operational knowledge. |
| Styling | Tailwind v3 + `cva`/`clsx`/`tailwind-merge` via `cn()` | Matches current stack. |
| Design tokens | Centralised token module | Text hierarchy + status tones declared once, never per component. |
| Tests | **vitest** (unit) + **Playwright** (e2e) | Same as AI-Services-UI. |
| Gates | eslint ratchet, knip, CI | Built and validated this session. |

## 3. Project structure

```
src/
  app/
    (auth)/login, signup          # public
    dashboard/                    # gated by middleware
    api/
      auth/[...all]/              # Better Auth catch-all
      services/<service>/         # server-side proxy — keys never reach browser
  components/
    ui/                           # primitives (button, input, dialog)
    shared/                       # cross-feature components
    providers/                    # query, theme, auth-initializer
  lib/
    auth.ts, auth-client.ts       # Better Auth server + client
    portal-session.ts             # requireSession / requireAdmin guards
    portal-http.ts                # typed JSON error helpers
    api-bounds.ts                 # every list/history limit lives here
    design.ts                     # tokens
    utils.ts                      # cn()
  store/                          # zustand, in-memory only
prisma/                           # schema + seed
```

**Non-negotiable layering:** `route → guard → service/client → external API`.
A React component never calls a backend directly; it goes through a proxy route
or a typed client.

## 4. Commands

```bash
pnpm dev            # next dev
pnpm build          # next build
pnpm test:unit      # vitest run
pnpm test:e2e       # playwright
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm verify         # typecheck && lint && test:unit   <- the one to run
pnpm db:migrate / db:seed
```

`pnpm verify` exists so there is a single command an agent must run before
claiming success.

## 5. Code style — the `AGENTS.md` contract

`AGENTS.md` is tracked and is the single source of truth. `CLAUDE.md` is a
3-line pointer to it, and must be **removed from `.gitignore`** so it survives a
clone. Two full copies drift — AI-Services-UI's pair both claimed `next-themes`
powered dark mode when it is hand-rolled, and both claimed no test runner
existed while vitest was configured.

### Behaviour rules (the "how Raihan codes" part)

- **Use the `ponytail` skill for all code work.** Laziest solution that works:
  does this need to exist → does the repo have it → does the framework do it →
  can it be one line → then minimum viable code.
- **Use `graphify` before searching or writing.** `graphify query "<what you
  need>"` first, so you find the existing helper instead of writing a duplicate.
- **The backend is the source of truth.** Never invent an API shape, SSE field,
  or query parameter. Read the route handler or OpenAPI schema first. Guessing
  the wire format ships broken UX.
- **Never claim done without running `pnpm verify` and reading the output.**

### Hard rules (each from a real incident)

- No wrapper that only forwards to one function.
- No export nothing imports — delete it.
- No duplicate exported name with different meanings across modules.
- Every list/history query is bounded; limits live in `api-bounds.ts`.
- No query inside a loop.
- Heavy libs (`recharts`, `react-katex`) behind `next/dynamic` — but never
  lazy-load primary content.
- No codemod or regex mass-edit without `tsc --noEmit` after each batch.
- Never strip validation, auth, error handling, or a11y to shorten code.

## 6. Testing strategy

- **Unit (vitest)** — one runnable check per piece of non-trivial logic: bounds
  parsing, URL/env resolution, permission checks, trust-boundary validation.
  Trivial one-liners need none.
- **e2e (Playwright)** — one happy path: login → dashboard → sign out.
- **Gate** — CI runs typecheck → lint → unit → build, cheapest failure first.
- Ships with tests that **pass on a clean clone** with no database, so CI is
  green immediately.

## 7. Boundaries

**Always**
- Run `pnpm verify` before reporting success.
- Resolve secrets server-side; proxy routes inject them.
- Bound untrusted input at the trust boundary.

**Ask first**
- Adding a dependency (stdlib → framework → existing dep → new dep).
- Changing the Prisma schema or a migration.
- Anything touching auth or the session guard.

**Never**
- Put a secret in `NEXT_PUBLIC_*` or any client-imported module.
- Auto-delete code a dead-code tool flagged without verifying by hand — knip
  misses dynamic imports.
- Add an entry to a ratchet baseline to make a check pass. Fix the code.

## 8. Deliverable B — `fastapi-starter` gaps

Gates already pass (ruff, black, isort, mypy, pytest, CI — committed today).
Remaining, in priority order:

1. **`.pre-commit-config.yaml`** — `pre-commit ^4.6.0` is a declared dev
   dependency with no config file. Wire ruff + black + isort.
2. **`AGENTS.md` behaviour block** — the ponytail/graphify/verify rules above,
   phrased for Python.
3. **Auth pattern** — the repo has `authlib` + `passlib` and a `/health`
   endpoint but no worked example of a protected route.
4. **Tests beyond smoke** — one real repository/service test to establish the
   pattern; coverage is otherwise near zero.
5. **Shrink the mypy ratchet** — 3 modules (`models.base`, `schemas.user`,
   `config.security`).

## 9. Out of scope

- Rolling any of this into the 12 existing repos — starters only, until Raihan
  validates the approach.
- Changing global `~/.claude/CLAUDE.md` or `~/.codex/AGENTS.md` (already done).
- A TanStack Start starter — revisit after its 1.0.
- Carving AI-Services-UI into a template; this is a fresh build.
- Multi-tenancy, billing, i18n, email.

## 10. Open questions

1. GitHub org/account for the private repos, and preferred names
   (`next-js-starter` / keep `fastapi-starter`)?
2. Should the frontend starter include the **service-proxy pattern** by default,
   or only when a project actually talks to an external keyed API? It is the
   most valuable piece of AI-Services-UI, but it is dead weight for an app with
   no external backend.
3. RBAC depth: full groups+permissions like AI-Services-UI, or just
   `role: admin | user` with room to grow?
