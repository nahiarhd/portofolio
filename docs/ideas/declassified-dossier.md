# The Declassified Dossier

**Status:** superseded by [noema-studio-portfolio.md](./noema-studio-portfolio.md) for homepage chrome (2026-08-05). Confidentiality + redaction mechanics still apply.  
**Scope:** homepage visual system + IA reorder. Content source of truth unchanged (`src/content/*`). Confidentiality rules unchanged.

## One line

The site is a personnel file that declassifies itself as you scroll — and the two public projects are the payoff, because you can actually read them.

## Structural move

Sections alternate two physical states:

| State | Ground | Meaning |
| --- | --- | --- |
| **Classified** | near-black | NDA, metadata, mono stamps |
| **Declassified** | bone paper `#E9E6DF` | public, editorial serif, fully legible |

Black = NDA. Paper = public. Scrolling is the act of declassification.

## Redaction

NDA project summaries may include a theatrical `{{redacted}}` marker. The bar never reveals a real secret — hover/focus flips to `[REDACTED · NDA]`. Keeps `AGENTS.md` § Confidentiality intact by construction.

## Type & colour

| Role | Token | Choice |
| --- | --- | --- |
| Display | `--font-display` | Instrument Serif |
| Metadata | `--font-mono` | Space Mono |
| Body | `--font-sans` | Outfit |
| Signal | `--primary` | violet `#C084FC` (Noema studio; not amber) |
| Classified stamp | red | reserved for `CLASSIFIED` only |

## Chapters

| # | Id | State | Content |
| --- | --- | --- | --- |
| 00 | cover | ink | Name, file id, location, status |
| 01 | subject | paper | Bio pull-quote + portrait plate |
| 02 | shelf | ink | WebGL shelf (evidence) |
| 03 | classified | ink | NDA projects, redacted |
| 04 | declassified | paper | Public projects, full links |
| — | ask | ink | Chat (terminal chrome) |
| 05 | about | ink | Experience + education log |
| 06 | certifications | paper | Credentials + verify |
| 07 | contact | paper | Email, LinkedIn |

## Constraints

- CSS-first motion; no GSAP/Framer
- `prefers-reduced-motion`: redaction bars settle in final labelled state; no scanline loops
- Site works with WebGL blocked and chat closed
- Every new UI string in `en.json` and `id.json`
- Design tokens only — no one-off greys
- `pnpm verify` green
- No employer/product/client names anywhere

## Out of scope

Game/store vocabulary, second R3F scene, inventing credential IDs or metrics.
