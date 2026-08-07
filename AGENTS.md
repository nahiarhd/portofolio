<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working rules

`CLAUDE.md` is a pointer to this file. This is the single source of truth — do
not duplicate rules into a second file, they drift within weeks.

**What this project is:** a bilingual personal portfolio for Raihan Hidayatullah
Djunaedi, with a 3D hero graph and a tool-calling chatbot.
**No database, no auth, no CMS.** If you are reaching for one, re-read
`docs/spec.md` first — it was a deliberate decision, not an oversight.

- What we're building and why → `docs/spec.md`
- Why the concept is what it is → `docs/ideas/agent-graph-portfolio.md`
- What to do next → `tasks/plan.md`, `tasks/todo.md`

## Confidentiality — read this before writing any content

Three tiers, per `docs/spec-repositioning.md` § Confidentiality Policy Change.
They are not equivalent risks and are not treated the same:

| Tier | Examples | Rule |
|---|---|---|
| Employer name | Company Raihan works or worked for | **Allowed** — an NDA covers confidential information, not the fact of employment |
| Client name / engagement | Who an employer's product was built for | **Forbidden** — client lists are standard confidential information |
| Product / module names, architecture, screenshots, metrics | Internal product and module names, UI screenshots, feature taxonomy | **Forbidden** — always restricted |

Describing what he built is fine — page copy, `alt` text, metadata, commit
messages, comments, the chatbot's system prompt. Naming or identifying a client
or a product/module is not, anywhere. Case studies name the employer but keep
the client anonymized by construction: *"an on-premises AI intelligence
platform for a national government revenue agency."*

There is an automated denylist test over `src/content/`; **never weaken it to
make content pass.** Full rules in `docs/spec.md` § Confidentiality and
`docs/spec-repositioning.md` § Confidentiality Policy Change.

## Verify before claiming done

```bash
pnpm verify   # typecheck + lint + unit tests
```

**Never say something works, is fixed, or is passing without running this and
reading the output.** If a check fails, say so plainly with the real output. A
confident "done" that was never verified costs more than saying "I'm not sure".

Frame-rate claims are measured **on the reference device (Redmi Note 11)**, never
on desktop and never from the in-app browser pane — when that pane is hidden the
browser throttles `requestAnimationFrame` to zero and every reading is 0.

## Use the tools

- **`ponytail` skill for all code work.** Take the laziest solution that
  actually works. The ladder, in order: does this need to exist at all → does
  the repo already have it → does the framework/stdlib do it → can it be one
  line → then write the minimum that works. Stop at the first rung that holds.
- **`graphify` before searching or writing.** Run `graphify query "<what you
  need>"` first. Most duplication is re-implementing something that already
  exists a few files over.

## Architecture

```
src/content/*  ──┬──→ pages (Server Components, static)
                 └──→ /api/chat tool ──→ project cards
```

`src/content/projects.ts` is the **single source of truth**, consumed twice: by
the rendered pages and by the chat's `showProject` tool. That is deliberate — the
bot cannot invent a project or describe one differently from its own page.

- `src/app/[lang]/*` — every page lives under a locale segment. `en` and `id`.
- `src/app/[lang]/dictionaries/` — UI strings. Content lives in `src/content/`,
  not here.
- `src/proxy.ts` — locale detection and redirect only. No auth; there is none.
- `src/app/api/chat/route.ts` — the only dynamic route. Holds `LLM_*` env vars.
- `src/lib/design.ts` + `globals.css` — all tokens. A component that hardcodes
  `text-gray-500` starts the drift toward eleven different greys.
- `src/components/graph/*` — R3F, client-only, `next/dynamic` with `ssr: false`.

**The site must work completely with the chat closed and WebGL blocked.** That is
a build constraint, not a fallback bolted on at the end.

## Never

Each of these comes from a real failure, not style preference.

- **Never put a secret in `NEXT_PUBLIC_*`** or any module a client component
  imports. `NEXT_PUBLIC_*` is inlined into the browser bundle at build time.
- **Never hardcode the LLM provider URL, key, or model id.** Env vars only, so
  the provider stays swappable.
- **Never ship `/api/chat` without a rate limit.** It bills someone.
- **Never add a wrapper that only forwards to one other function.** Resolving
  one API base URL once took five stacked functions, four of which had no logic.
- **Never leave an export nothing imports.** Delete it — git remembers. A real
  project here accumulated 4,243 lines of orphan files over months.
- **Never define the same exported name in two modules with different meanings.**
  One wrong auto-import away from a silent bug.
- **Never import a heavy library eagerly for below-the-fold UI** — use
  `next/dynamic`. But never lazy-load *primary* content; that trades bundle size
  for a slower first paint.
- **Never mass-edit with a regex or codemod without running `pnpm typecheck`
  after each batch.** Automate the edit, never the verification.
- **Never strip validation, error handling, or accessibility** to make code
  shorter.
- **Never spend the frame-rate headroom.** 400 nodes was measured, not guessed.

## Testing

Vitest, colocated `*.test.ts`. One runnable check per piece of non-trivial
logic. Trivial one-liners need none.

Tests must pass on a clean clone with **no database and no API key**, so CI is
green from the first commit. What earns a test here: content integrity, the
content denylist, chat tool argument parsing (a trust boundary), locale
resolution, and dictionary key parity.

Not unit-tested: R3F rendering, LLM output quality, visual layout. Those are
verified by hand on a real device.

## Gates

- `@typescript-eslint/no-unused-vars` is an **error**, not a warning.
- `knip` reports dead files and exports, but is **advisory** — it cannot see
  every dynamic import. Verify by hand before deleting anything.
- CI runs typecheck → lint → test → build on every push and PR. The build must
  never need a secret; `/api/chat` reads its env at request time, not build time.

If a check fails, fix the code. **Never add an exemption to make a gate pass.**
