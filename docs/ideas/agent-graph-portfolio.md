# Agent Graph Portfolio

> Concept one-pager for Raihan Hidayatullah Djunaedi's personal site.
> Produced via `interview-me` → `idea-refine`. Confirmed 2026-08-03.

## Problem Statement

**How might we** give Raihan a personal site that proves he builds serious AI work —
when every piece of that work is company-owned and cannot be linked, demoed, or
open-sourced?

The constraint that defines the whole project: his public record
(LinkedIn) stops at December 2024 and shows a blockchain mentor and a web
developer intern. Everything since — AI agents, AI media pipelines, AI service
UIs, OCR — is NDA-bound. **The site's own craft has to carry the credibility
that a GitHub link normally would.**

## Recommended Direction

**A clean editorial site with one 3D centerpiece: a node graph that the chatbot
visibly drives.**

The graph sits in the hero. Idle, it drifts — hairline strokes and small nodes
on off-white, closer to a technical drawing than a sci-fi hologram. When a
visitor asks the chatbot something, a pulse travels the graph, the node for the
relevant project lights, and the bot hands back a **clickable project card**,
not a paragraph.

Three reasons this direction over the five alternatives considered (The Chain,
Carbon Credit, Data by Precision, Batik Parang, No-Hero-3D):

1. **The 3D and the chatbot become one idea instead of two features sharing a
   page.** Every other direction leaves the chatbot as a bolted-on box in the
   corner.
2. **It is the cheapest thing on mobile.** Instanced spheres plus line segments.
   No glass, no refraction, no heavy post-processing — which matters because
   the target audience is Indonesian and mobile-heavy, on mid-range Android.
3. **It demonstrates the skill it claims.** Tool-calling that visibly changes
   the page is the only NDA-proof evidence that he builds agents. Nobody can
   take it down.

The discipline of the rejected "No hero 3D" option is folded in: **3D appears in
exactly one place.** Not as a background on every section. Restraint is the
differentiator in a light editorial world — 3D that shouts reads as cheap.

## Key Assumptions to Validate

- [ ] **The chatbot is good enough to be worth pointing at.** Riskiest bet — the
      graph borrows 100% of its value from the bot. *Test:* write the project
      data first, then ask the bot 10 real recruiter questions before building
      any 3D. If the answers are generic, the concept is hollow and we stop.
- [ ] **Visitors will actually open the chat.** Most people never touch a
      portfolio chatbot. *Test:* ship with 3 visible suggested questions, never
      an empty input. If nobody clicks, the graph never performs its trick and
      the hero must stand alone on idle beauty.
- [ ] **NDA-safe case studies have real substance.** *Test:* write one full case
      study for `AI-Agents` — problem, architecture, his role, outcome, with at
      least one number. If it reads as "built an AI pipeline," the graph points
      at nothing.
- [ ] **R3F is learnable here from zero.** No prior Three.js experience. *Test:*
      a static instanced point cloud rendering at 60fps on a real phone, in one
      sitting, before anything else 3D is attempted.

## MVP Scope

**In:**
- Static, beautiful, complete site that works with the chat closed and 3D disabled
- Project data as a typed file in the repo — no database
- Case studies: AI work (NDA-safe), Blockchain, Data/ML
- Chatbot over an OpenAI-compatible endpoint, with tool-calling that returns project cards
- Hero node graph, reacting to chat activity
- EN + ID throughout, including the bot's replies

**Out (for MVP, revisit later):**
- Blog, analytics dashboard, view counters
- Per-project 3D objects
- Any 3D outside the hero

## Not Doing (and Why)

- **CRUD / admin panel / database / auth** — a handful of projects fit in one
  TypeScript file. An admin screen is invisible to visitors, adds hosting cost,
  auth surface, and a second product to maintain. Nobody is impressed by a CRUD
  form in 2026.
- **Agent-as-navigation** — considered and explicitly rejected. The site keeps
  normal navigation and must work completely with the chat closed. The chatbot
  is a feature, not the interface.
- **Dark cinematic WebGL spectacle** — collides with the chosen light editorial
  aesthetic, with the mid-range Android target, and with zero Three.js
  experience. Three constraints pointing the same way is a decision, not a
  limitation.
- **Live demos or source of company work** — NDA. Case studies only.
- **Freelance/services framing** — no pricing, no packages. This is not a client
  funnel.
- **Recruiter-only résumé page** — the audience is anyone who lands on it.

## Open Questions

- Do the `Playground/` projects (`handsome-detector`, `bot-atul`, `her`,
  `yono-cathering`, `ide-mas-arda`) go public? They make him human, which is
  memorable — but they are unpolished.
- Which OpenAI-compatible provider, and what monthly spend cap?
- Does the site get a custom domain, or `*.vercel.app` for now?
- Are there **numbers** available for any of the AI work? Case studies without
  outcomes are the weakest part of the current plan.
