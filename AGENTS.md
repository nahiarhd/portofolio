<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working rules

`CLAUDE.md` is a pointer to this file. This is the single source of truth — do
not duplicate rules into a second file, they drift within weeks.

## Verify before claiming done

```bash
pnpm verify   # typecheck + lint + unit tests
```

**Never say something works, is fixed, or is passing without running this and
reading the output.** If a check fails, say so plainly with the real output. A
confident "done" that was never verified costs more than saying "I'm not sure".

## Use the tools

- **`ponytail` skill for all code work.** Take the laziest solution that
  actually works. The ladder, in order: does this need to exist at all → does
  the repo already have it → does the framework/stdlib do it → can it be one
  line → then write the minimum that works. Stop at the first rung that holds.
- **`graphify` before searching or writing.** Run `graphify query "<what you
  need>"` first. Most duplication is re-implementing something that already
  exists a few files over.
- **The backend is the source of truth.** Never invent an API shape, SSE field,
  or query parameter. Read the route handler or the OpenAPI schema. Guessing the
  wire format ships broken UX that looks fine in review.

## Never

Each of these comes from a real failure, not style preference.

- **Never add a wrapper that only forwards to one other function.** Resolving
  one API base URL once took five stacked functions, four of which had no logic.
- **Never leave an export nothing imports.** Delete it — git remembers. A real
  project here accumulated 4,243 lines of orphan files over months.
- **Never define the same exported name in two modules with different meanings.**
  One wrong auto-import away from a silent bug.
- **Never write an unbounded list or history query.** Every `findMany` needs
  `take`. Limits live in `src/lib/api-bounds.ts`.
- **Never query inside a loop.** One `findMany({ where: { id: { in: ids } } })`,
  not N × `findUnique`.
- **Never import a heavy library eagerly for below-the-fold UI** — use
  `next/dynamic`. But never lazy-load *primary* content; that trades bundle size
  for a slower first paint.
- **Never mass-edit with a regex or codemod without running `pnpm typecheck`
  after each batch.** Automate the edit, never the verification.
- **Never put a secret in `NEXT_PUBLIC_*`** or any module a client component
  imports. `NEXT_PUBLIC_*` is inlined into the browser bundle at build time.
- **Never strip validation, auth, error handling, or accessibility** to make
  code shorter.

## Architecture

```
Component → proxy route or typed client → external API
Route handler → guard → prisma
```

A component never calls an external API directly, and never reads a secret.

- `src/app/api/services/*` — server-side proxies. They hold the API key and
  inject `X-API-Key`. Copy `example/[...path]/route.ts` per service. Delete it
  if the project has no external keyed API.
- `src/lib/portal-session.ts` — `requirePortalUser()` / `requireAdminUser()`.
  **Every mutating route calls one of these.**
- `src/proxy.ts` — optimistic cookie *presence* check only, no DB, no
  crypto. Passing the proxy is **not** proof of authentication; the guards are.
- `src/lib/auth-permissions.ts` — never test `role === "admin"` at a call site.
  Use `canManageUsers(user)` so growing into groups touches one file.
- `src/lib/design.ts` + `globals.css` — all tokens. A component that hardcodes
  `text-gray-500` starts the drift toward eleven different greys.
- `src/lib/portal-http.ts` — one JSON error shape (`{ detail }`) for every route.

## Auth

Better Auth owns `Session`, `Account`, `Verification` — do not hand-edit their
shape. `role`, `isActive` and `lastLoginAt` are declared `input: false` in
`src/lib/auth.ts`, so a client cannot promote itself to admin through public
sign-up. Keep it that way.

## Testing

One runnable check per piece of non-trivial logic — bounds parsing, permission
checks, trust-boundary validation. Trivial one-liners need none.

Unit tests must pass on a clean clone **with no database**, so CI is green from
the first commit. Anything needing Postgres is an e2e test.

## Gates

- `@typescript-eslint/no-unused-vars` is an **error**, not a warning.
- `knip` reports dead files and exports, but is **advisory** — it cannot see
  every dynamic import. Verify by hand before deleting anything.
- CI runs typecheck → lint → test → build on every push and PR.

If a check fails, fix the code. **Never add an exemption to make a gate pass.**
