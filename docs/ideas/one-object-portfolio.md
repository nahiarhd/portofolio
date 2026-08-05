# One Object Portfolio

Colour and craft rework. Decided 2026-08-05 via idea-refine.

Audience: hiring managers **and** engineers. Success: craft + story equally.
Reference bar: `example/books` (one idea owns the screen) — not sakura-scale worlds.

## Problem Statement

**How might we** make this portfolio feel as deliberate and tactile as the
`example/` demos — without a second competing 3D system, without confusing
recruiters, and without killing mid-range Android FPS?

## Recommended Direction

**Shelf is the single immersive 3D setpiece.** Hero stays editorial. Work list
stays as the non-WebGL / SEO path. Graph demotes to a thin reactive strip (chat
still can light it) — never a second full stage.

Ink & Signal tokens stay (black mass + purple signal). Do not import books pink.

| Area | Rule |
| --- | --- |
| Hero | Type + portrait + CTAs. Thin signal strip optional. |
| Shelf | Full-viewport books-tier craft — the wow. |
| Work index | Secondary list under shelf. Always reachable. |
| Chat | Keeps tool cards; may pulse the thin strip only. |
| Sakura / multi-world | Out of scope. |

## Key Assumptions to Validate

- [ ] One setpiece at books-tier materials/motion is enough to feel “example-good.”
- [ ] Recruiters still find every project via the list when WebGL is off.
- [ ] Shelf holds fps on Redmi Note 11 at full viewport.
- [ ] Thin graph strip is enough for chat→graph wiring; if not, drop live graph.

## MVP Scope

**In**

1. Hero demote: remove full graph stage; thin strip or still only.
2. Page order: Hero → Shelf → Work list → Ask → About → Certs → Contact.
3. Shelf full-viewport presentation; primary CTA lands on `#shelf`.
4. Work list remains complete for a11y and crawlers.

**Out**

- Second full 3D world
- Pink/cream books palette
- Removing list access to case studies
- Sakura-style explorable scenes

## Not Doing (and Why)

- **Dual loud 3D (graph stage + shelf)** — fights one-object focus; FPS risk.
- **Copying books commerce chrome** — wrong product.
- **Multi-setpiece showcase** — dilutes both craft and story.

## Open Questions

- Keep thin live graph for chat activity, or freeze to `GraphStill` permanently?
- Replace SVG media with real covers before treating craft as “done”?
