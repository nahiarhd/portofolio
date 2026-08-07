# Spec: Repositioning for Select AI Engineering Work

Status: **awaiting approval** · Created 2026-08-07
Supersedes parts of [`docs/spec.md`](./spec.md) — see § Confidentiality Policy Change.

---

## Why

The site currently reads as *available for hire*. Raihan is employed under
contract until Nov 2026, leads an AI engineering team, and is **not looking** —
but he is **movable**: he wants freelance projects, and will consider a
full-time role that clears a high bar.

That is a different proposition from job-hunting, and it needs different
evidence and a different tone. Someone who is looking has less leverage than
someone who must be persuaded.

Three concrete failures in the current build:

1. **The timeline contradicts itself on screen.** `experience` ends Dec 2024.
   The work index shows case studies dated Jan, Feb, Mar and Apr 2025. A visitor
   reads six projects from a period listing no employment.
2. **`OPEN TO WORK` is the wrong signal.** It reads as *unemployed, hire me
   full-time* — the opposite of the goal, and not something a current employer
   should find.
3. **No verifiable proof.** [`docs/spec.md`](./spec.md) § Confidentiality already
   conceded this: "every claim about his current work is unverifiable by the
   reader." Four bodies of public, checkable evidence existed and were unused —
   **34 published Hugging Face models with real third-party traction**, a
   peer-reviewed IEEE paper, a GitHub profile, and real certificates. The first
   of those closes the gap the original spec left open as its central risk.

---

## Decisions

Recorded so they are not relitigated. All confirmed by Raihan 2026-08-07.

| # | Decision | Chosen |
|---|---|---|
| 1 | Organisation naming | Employers **named**; client **anonymised**; products **never** |
| 2 | Positioning | **AI engineering leads.** Blockchain and data become supporting evidence |
| 3 | Engagement detail | Full detail, including a **project minimum in USD** |
| 4 | Timeline shape | Two entries — ARMS Data Scientist, then ADS AI Lead Engineer |
| 5 | Capacity | **Stated plainly**: evenings and weekends, project-based, async |
| 6 | Primary evidence | **Hugging Face** — 34 public models — is the centrepiece, ahead of the paper and GitHub |
| 7 | Work IA | Top three featured on home; **new `/work` route** lists all six |
| 8 | Availability | Freelance **and** selectively full-time. Signal is *not looking, but movable* — never `OPEN TO WORK` |
| 9 | Full-time bar | Stated as **scope criteria, no compensation figure**. Contract timing never mentioned |
| 10 | Audience | **International remote first.** USD, English-first, async — not Jakarta-local |

---

## Confidentiality Policy Change

**This spec deliberately changes a rule that [`AGENTS.md`](../AGENTS.md) says never
to weaken. Read this section before touching the denylist.**

The old rule bundled three different risks into one prohibition. They are not
equivalent:

| Tier | Risk | New rule |
|---|---|---|
| Employer name | Essentially never restricted. An NDA covers confidential *information*, not the *fact of employment* | **Allowed** |
| Client name / engagement | Commonly restricted. Client lists are standard confidential information in agency work | **Forbidden** |
| Product names, module names, architecture, screenshots, metrics | Always restricted | **Forbidden** |

The rationale for naming employers is not convenience. It is that **selective
confidentiality is a credential and blanket vagueness is a red flag.** A prospect
reading "AI product studio, subsidiary of an IT solutions group" wonders what is
being hidden. A prospect reading "AI Lead Engineer at a named company; largest
engagement is an on-premises deployment for a national government agency, under
NDA" learns two things at once — the level he operates at, and that he will not
leak *their* project either. Discretion can only be demonstrated if something is
visibly withheld.

### Consequence for `content.test.ts`

The denylist **inverts and gets stronger**. Today it guards the employer token
and leaves the client unguarded — backwards, given the tiers above.

- **Remove:** the employer acronym hash.
- **Add:** hashes for every token the client can be spelled with, in both
  English and Indonesian. Per the existing file comment, matching is
  single-token only, so each spelling needs its own hash.
- **Keep:** all product and module hashes, untouched.

This is a policy change, recorded here, applied in the same commit as the
`AGENTS.md` and `docs/spec.md` edits so the rule and the gate agree. It is **not**
the thing `AGENTS.md` forbids — that prohibition exists to stop a hash being
quietly deleted to turn a red test green.

### Amendment, 2026-08-07 — one further tier-1 reclassification

A second hash was removed after Task 4, for a distinct and recorded reason.

The MSIB internship certificate names the employer by its **legal entity name**
rather than its trading name. That token was on the denylist from when tier 1 was
forbidden outright. Raihan confirmed the two names are the same company, and it
was corroborated independently: the trading name's logo appears on the
certificate beside the legal name, and the role and dates on it match the
`experience` entry exactly.

It is therefore tier 1 — allowed, like the trading name already used throughout
the site — and the hash was removed. `FORBIDDEN_HASHES` went 11 → 10.

**No content was failing the gate when this was done.** That distinction is the
whole test for whether a denylist change is legitimate: this was a
reclassification decided by the person who owns the confidential information, not
a hash deleted to turn a red test green. Every client and product hash is
untouched, and a size assertion in the test pins the count so silent drift fails.

**The site still uses the trading name everywhere.** The legal name is permitted,
not required, and appears nowhere in `src/content/`.

---

## Work Items

### W1 — Confidentiality policy, applied

Edit together, one commit:

- `AGENTS.md` § Confidentiality — rewrite to the three tiers.
- `docs/spec.md` § Confidentiality — same, with a pointer here.
- `src/content/content.test.ts` — invert the denylist as described above.

**Verify:** `pnpm test:unit` passes; a test asserting the client name is caught.

### W2 — Timeline · `src/content/profile.ts`

Replace the two `experience` entries with four:

| Organisation | Role | Period | Location |
|---|---|---|---|
| ADS Digital Partner | Web Developer (MSIB internship) | Aug – Dec 2023 | Surabaya |
| Politeknik Negeri Malang | Blockchain Mentor | Aug – Dec 2024 | Malang |
| ARMS (PT. Andal Rancang Multi Solusi) | Data Scientist | Nov – Dec 2024 | Jakarta |
| ADS Digital Partner | AI Lead Engineer | Jan 2025 – present | Jakarta |

Notes:

- The existing anonymised "Digital agency" entry **is** the 2023 ADS internship.
  Naming it makes the narrative legible: he interned there, and returned to lead
  their AI team. Worth stating in the highlight copy.
- The ARMS Data Scientist entry describes Dataiku work for **"a national
  government revenue agency."** The client is never named. This is corroborated
  by six Dataiku certificates earned 4 Dec 2024 – 2 Jan 2025.
- Highlights on the AI Lead entry describe *what he built* — team leadership,
  on-premises LLM deployment, agent pipelines — with no product or module names.
- **Render the progression, not just four jobs.** Intern in Aug 2023 → AI Lead
  Engineer by Jan 2025 is a fast trajectory, and velocity is what senior hiring
  managers and serious freelance clients actually buy. The shape of the timeline
  is the argument; a flat list throws it away.

**Verify:** `pnpm test:unit` — existing ISO-month and bilingual-highlight tests
cover the shape; the denylist test covers the client.

### W3 — Bio and positioning copy

| Location | Change |
|---|---|
| `profile.bio` | "Information technology graduate working on applied AI" → lead-engineer framing: leads an AI engineering team, ~2 years production on-premises AI |
| `dictionaries/{en,id}.json` · `hero.status` | `OPEN TO WORK` → `OPEN TO SELECT WORK` / `TERBUKA UNTUK PROYEK TERPILIH` |
| `dictionaries/{en,id}.json` · `hero.ctaSecondary` | `Contact` → `Work with me` / `Kerja sama` |
| `dictionaries/{en,id}.json` · `about.intro` | Match the new bio framing |

`hero.titleLine1/2` — "I build AI systems / and their interfaces." — is
**unchanged.** It is already the right headline and it is now the lead claim
rather than one of three competing pillars.

**On the status line.** `OPEN TO WORK` reads as *looking*, and someone looking
has less leverage than someone who must be persuaded. Raihan is employed, leads
a team, and is contracted to Nov 2026. The signal that matches that, and that
serves both freelance and full-time intent, is **not looking, but movable.**
`SELECT` carries it in two syllables; the engagement section carries the detail.

**Verify:** dictionary parity test (`dictionaries.test.ts`) — both locales must
carry every new key.

### W4 — Evidence section

**Replaces** the current `certifications-section.tsx` rather than adding to page
length. One section carrying all four kinds of proof — published models, the
paper, code, and certifications — directly answering the credibility problem
`docs/spec.md` raised and left open.

**New type in `profile.ts`:**

```ts
export type Publication = {
  title: string;
  venue: string;
  year: number;
  /** Resolvable DOI URL. The part a stranger can check. */
  doi: string;
  /** 1-indexed position in the author list. Honest about contribution. */
  authorPosition: number;
  authorCount: number;
  contribution: Localized;
  topics: string[];
};
```

Content:

- **Publication** — *Towards Trustless Academic Records in Higher Education:
  Integrating Blockchain and IPFS for Verifiable Student Credentials*, 2025 3ICT
  (International Conference on Innovation and Intelligence for Informatics,
  Computing, and Technologies). Third author of nine. DOI
  `10.1109/3ICT68299.2025.11442139`. Hyperledger Besu, IPFS, smart contracts with
  role-based access control, ReactJS + Thirdweb SDK.
- **Published models — the centrepiece.** `https://huggingface.co/nahiar`: 34
  public models and 48 public datasets under his own name. Feature the four with
  real third-party traction — `sentiment-analysis-v2` (124 likes),
  `spam-detection-xlm-roberta-v3` (83), `xlm-roberta-ner-v2` (75), `whisper-v1`
  (15) — plus the Indonesian NLP multitask collections.

  This carries more weight than the paper or GitHub. It is public, permanent,
  unambiguously his, and it evidences precisely the NLP, classification and
  speech-recognition work that the NDA case studies can only assert. Likes are
  strangers choosing to use his models — external validation the rest of the
  site cannot obtain.

  **New type** alongside `Publication`:

  ```ts
  export type PublishedModel = {
    /** Hugging Face repo id, e.g. "nahiar/sentiment-analysis-v2". */
    id: string;
    task: Localized;
    /** Recorded at author time; a stale number is worse than none. */
    likes?: number;
    baseModel?: string;
  };
  ```

- **Code** — link `https://github.com/raihanhd12` as a profile. **Not** specific
  featured repos. See Open Question 2.
- **Certifications** — six Dataiku credentials with real `issued` dates,
  `credentialId`, and `verifyUrl`, plus MSIB. The section heading currently
  promises "a public verification link where the issuer provides one" and
  delivers zero; this closes that gap.

**Verify:** new tests — every publication has a resolvable DOI; every
`verifyUrl` is HTTPS.

### W5 — Engagement section · `contact-section.tsx`

Rewrite from "Open to conversations about…" to a section that lets a stranger
decide and act. **Two distinct blocks**, because the two audiences want
different facts and mixing them serves neither.

**Block 1 — Freelance projects**

- **Scope** — agent pipelines, on-premises LLM deployment, document and media
  processing, the operator-facing UIs on top.
- **Capacity** — employed full-time; freelance runs evenings and weekends,
  roughly 10–15 hrs/week; project-based and async, no daytime calls or standups.
- **Rate** — project minimum in USD. **Figure pending — see Open Question 1.**
- **Response time.**

Honesty about capacity is a feature. Overpromising availability is how freelance
relationships fail in month two.

**Block 2 — Full-time**

Framed as a bar, not availability: *not actively looking; will consider senior
or lead AI roles that are remote-first and a clear step up in scope.*

- **No compensation figure** (Decision 9). A public number caps him against a
  recruiter who would have offered more, and is hard to walk back.
- **No mention of the contract or its end date** (Decision 9). It advertises a
  countdown to his current employer and rules him out of anything urgent.
- Phrased so it reads as selectivity, never as job-hunting.

**Shared** — email, LinkedIn, **GitHub**, **Hugging Face** (both currently
absent site-wide). Remote-first framing throughout per Decision 10.

### W6 — Chat prompt · `src/lib/chat-prompt.ts`

The bot must learn the new timeline, the availability posture (Decisions 8–9),
the capacity constraint, the publication, and the Hugging Face models.
**Skipping this leaves the bot contradicting the page it sits on** — the exact
failure the single-source-of-truth architecture exists to prevent.

Two rules the prompt must carry:

- **Confidentiality tiers.** It may name employers. It must never name the
  client or any product, and must decline rather than improvise if asked.
- **Availability posture.** Not looking, but movable. It must not tell a visitor
  Raihan is job-hunting, and must never quote or estimate a rate or salary —
  those are conversations, not bot answers.

**Verify:** `chat-prompt.test.ts` — assert the prompt contains no client or
product token, and no compensation figure.

### W7 — Redaction markup bug

The visually-hidden `Redacted · Nda` label lands inside sentence flow. Screen
readers and text extraction currently produce:

> "Operator-facing Next.js surfaces for ████████ Redacted · Nda : live tokens,
> job progress, and results that stay readable under load."

The sentence does not parse. Fix the markup in `redaction.tsx` so the label is
announced as a substitution rather than spliced into the surrounding clause.

**Verify:** re-read the page text extraction; sentences must parse.

### W8 — Certificate media

Five `.svg` stubs in `public/certifications/` become real images generated from
the source PDFs. Six Dataiku certificates, not the four currently listed.

**Constraint:** certificate images must be checked for the client name before
publishing. A Dataiku certificate is safe; an engagement certificate may not be.
The MSIB certificate filename carries the employer name — safe under Decision 1,
but the file must be renamed to the site's own convention rather than shipped
as-is.

### W9 — Featured work on home, full index at `/work`

Requested by Raihan 2026-08-07. Today `[lang]/page.tsx` renders one `WorkIndex`
listing all six case studies.

- **Home** — the top three, chosen to lead with AI per Decision 2.
- **`/[lang]/work`** — new route listing all six, linked from the home section.

**Constraint, from the record.** [`page.tsx`](../src/app/[lang]/page.tsx) L25–L30
documents that a previous two-work-section homepage was deliberately deleted:
the two sections listed the same six projects under different headings, and the
second continuous `<Canvas>` cost the frame budget the hero graph needs. A
separate **route** avoids both faults — different content, and no second canvas
on the homepage. Do not reintroduce a second work section on `/`.

**Verify:** `/work` renders in both locales; sitemap includes it; homepage still
has exactly one `<Canvas>`.

---

## Out of Scope

Named so they are not silently absorbed:

- Visual redesign. The art direction is coherent and is not the problem.
- The 3D hero graph, its performance, or its budget.
- Publishing `Playground/` projects — still `docs/spec.md` Open Question 4.
- Rewriting the six existing case studies.

### `Development/Work/` — hard stop, verified

Raihan asked (2026-08-07) for the intelligence service, location resolver,
[redacted] and the AI agent work to be detailed on the site. **This is not
possible under the policy above, and the existing gate already proves it:**

- Every repository under `Development/Work/` has its `origin` on the employer's
  private Git server. It is employer work, not personal work.
- One product name above already has its distinctive token **hashed as a
  protected term** in `content.test.ts`.
- One repository's origin name is likewise a tier-3 product name, not
  currently covered by a hash in `content.test.ts` — flagged for the owner to
  decide whether it needs one.

These are tier-3 product names. The policy change in this spec relaxed
**employer naming only**; products and clients stayed forbidden. Writing these
in would turn `pnpm test:unit` red, correctly.

The ceiling for this work is description by capability — "on-premises agent
pipelines", "OCR and layout recovery", "audio-to-brief media processing" — which
is what the six case studies already do. **Hugging Face carries the evidential
weight instead**, which is why it is the centrepiece of W4 rather than a
footnote.

---

## Open Questions

**Blocking publication, not implementation:**

1. **The project minimum figure.** Structure is decided (project minimum, USD);
   the number is not. It must come from Raihan, sanity-checked against live
   Upwork/Toptal listings. No number is invented here. W5 ships with the slot in
   place; the section is not published until it is filled.

**Resolved, kept for the record:**

2. ~~`dataiku-dss-plugin-nlp-sentence-embedding` authorship.~~ **Resolved
   2026-08-07 — not featured.** Raihan confirmed he copied Dataiku's plugin and
   modified it to the client's requirements. It is a derivative, so it does not
   appear on the site as his project.

   **Separate matter, raised for his attention and outside this spec's scope:**
   that repository is public and, by his account, contains client-driven
   modifications. That is client work on a public GitHub profile, which is a
   larger exposure than any naming question in this document. Worth auditing
   independently. Also worth checking whether Dataiku's `LICENSE`/`NOTICE`
   survived the copy — their plugins are typically Apache-2.0, which permits
   derivatives but requires attribution.

3. ~~Work locations; paper contribution.~~ **Resolved 2026-08-07.** Both ARMS
   and ADS 2025 entries are **Jakarta**.

   On the paper: Raihan states the implementation work was his, with co-authors
   added for the submission. The site will **not** make that comparative claim —
   co-authors can dispute it and it reads poorly to a stranger. Instead
   `Publication.contribution` states what he built: the permissioned Hyperledger
   Besu network, the credential smart contracts with role-based access control,
   the IPFS storage layer, and the ReactJS/Thirdweb client. Specific, checkable
   against the paper, and unattackable.

**Non-blocking:**

4. The GitHub profile bio is currently a joke in Indonesian. Harmless, but worth
   a look if the profile is being linked prominently to prospects.
5. `IBFT-Network` is a stub — one commit, no README, no visible code. It would
   corroborate the Hyperledger Besu claims well if finished. Not featured now.
6. The Hugging Face profile has **no bio**. It is about to become the strongest
   evidence on the site; a one-line bio there costs nothing and closes the loop
   back to the portfolio.

---

## Success Criteria

| Criterion | How verified |
|---|---|
| No employment gap visible on the page | Read the rendered About section |
| Client name absent from all content | `pnpm test:unit` — denylist test |
| Every certification has issuer, date, ID, and verify link | Rendered evidence section |
| Publication DOI resolves to IEEE Xplore | Follow the link |
| Every featured Hugging Face model id resolves | Follow each link |
| No product or client token anywhere in `src/content/` | `pnpm test:unit` — denylist test |
| Homepage has exactly one `<Canvas>` after W9 | Inspect the rendered DOM |
| Bot's account of the timeline matches the page | Ask it, compare |
| Page text extraction parses as sentences | `get_page_text`, read it |
| Dictionary parity | `dictionaries.test.ts` |
| `pnpm verify` | passes |
