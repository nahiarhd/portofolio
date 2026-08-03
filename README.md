# Portfolio — Raihan Hidayatullah Djunaedi

Bilingual (EN/ID) personal portfolio: a clean editorial site with a 3D hero
graph and a tool-calling chatbot that hands back clickable project cards.

No database, no auth, no CMS. Content is typed data in the repo.

## Getting started

```bash
pnpm install
cp .env.example .env    # LLM_* vars — only needed for /api/chat
pnpm dev
```

The site runs fine without `.env`; only the chatbot needs it.

## Commands

| | |
|---|---|
| `pnpm dev` | Dev server. Add `-H 0.0.0.0` to test on a phone over LAN. |
| `pnpm verify` | **The gate.** Typecheck + lint + unit tests. |
| `pnpm build` | Production build. Must never require a secret. |
| `pnpm knip` | Dead-code report. Advisory — verify by hand before deleting. |

## Documentation

| File | What it is |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Working rules. Read first. |
| [`docs/spec.md`](./docs/spec.md) | What we're building, and the constraints. |
| [`docs/ideas/agent-graph-portfolio.md`](./docs/ideas/agent-graph-portfolio.md) | Why the concept is what it is. |
| [`tasks/plan.md`](./tasks/plan.md) | Implementation plan and spike results. |
| [`tasks/todo.md`](./tasks/todo.md) | What to do next. |

## Two things that are easy to get wrong

**Confidentiality.** No employer, product, or client name appears anywhere in
this repo — including metadata and the chatbot's system prompt. See
`AGENTS.md` § Confidentiality.

**Frame rate.** The 3D hero targets ≥50fps on the reference device (Redmi Note
11). Measure on the device; desktop numbers mean nothing here.
