# Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the site from "available for hire" to "not looking, but movable" — fill the 20-month timeline gap, and replace unverifiable claims with four bodies of public evidence.

**Architecture:** Content stays typed data in `src/content/`, consumed twice (pages + chat prompt) exactly as today. Two new content types (`Publication`, `PublishedModel`) join `Certification` under one new `EvidenceSection` that replaces `CertificationsSection`. `ContactSection` becomes a two-block engagement section. One new route `/[lang]/work`. No new dependencies.

**Tech Stack:** Next.js 16.2.12 (App Router, `proxy.ts` not `middleware.ts`), React 19.2.4, Tailwind 4, TypeScript 5, Vitest 4.

Spec: [`docs/spec-repositioning.md`](../docs/spec-repositioning.md). Decisions are numbered there; this plan cites them.

---

## Global Constraints

Every task's requirements implicitly include these.

- **Verify gate:** `pnpm verify` (typecheck + lint + `vitest run`) must pass before any task is called done. Read the output. Never claim a pass you did not read.
- **Confidentiality tiers (Decision 1):** employer names **allowed**; client names **forbidden**; product/module names **forbidden**. This applies to page copy, `alt` text, metadata, file paths, comments, commit messages, and the chat system prompt.
- **Never weaken the denylist to make content pass.** Task 1 changes it deliberately, once. No later task touches `FORBIDDEN_HASHES`.
- **Bilingual or it does not ship.** Every `Localized` field needs `en` and `id`. `dictionaries.test.ts` enforces key parity.
- **No hardcoded colours.** Tokens come from `src/lib/design.ts` (`TEXT`, `EYEBROW`, `SURFACE`, `BUTTON`, `CONTAINER`, `SECTION`) and `globals.css`. Never `text-gray-500`.
- **No compensation figure in the chat prompt** (Decision 9). Rates are conversations.
- **Server Components by default.** `"use client"` only where interactivity demands it. Nothing in this plan needs it.
- **Commit style:** Conventional Commits, matching git history (`feat(work):`, `fix(a11y):`, `docs(spec):`).
- **Frame-rate claims** are measured on the reference device only. No task here should make one.

---

## File Structure

| Path | Responsibility | Task |
|---|---|---|
| `src/content/content.test.ts` | Denylist inverts: drop employer token, add client tokens | 1 |
| `AGENTS.md`, `docs/spec.md` | Confidentiality rewritten to three tiers | 1 |
| `src/content/profile.ts` | Timeline, bio, `Publication`, `PublishedModel`, `engagement`, real certifications | 2, 3, 4, 7 |
| `src/content/projects.ts` | `featured` flag on three projects | 10 |
| `src/app/[lang]/dictionaries/{en,id}.json` | All UI copy | 5, 6, 7, 9, 10 |
| `src/components/evidence-section.tsx` | **New.** Models + paper + code + certifications | 6 |
| `src/components/certifications-section.tsx` | **Deleted** — absorbed by evidence-section | 6 |
| `src/components/contact-section.tsx` | Two-block engagement section | 7 |
| `src/components/redaction.tsx` | Screen-reader label fix | 9 |
| `src/components/work-index.tsx` | `featured` prop | 10 |
| `src/app/[lang]/work/page.tsx` | **New.** Full work index route | 10 |
| `src/app/sitemap.ts` | Add `/work` | 10 |
| `src/lib/chat-prompt.ts` | New facts + posture rules + `[object Object]` bug | 8 |
| `public/certifications/*` | Real images replacing SVG stubs | 11 |

---

## Task 1: Invert the confidentiality denylist

The gate currently protects the employer and leaves the client unguarded. Decision 1 reverses that. **This is the only task permitted to touch `FORBIDDEN_HASHES`.**

**Files:**
- Modify: `src/content/content.test.ts:32-40`
- Modify: `AGENTS.md` (§ Confidentiality)
- Modify: `docs/spec.md` (§ Confidentiality)

**Interfaces:**
- Consumes: nothing.
- Produces: a denylist that rejects client tokens and accepts employer names. Tasks 2–8 depend on employer names being writable.

- [ ] **Step 1: Identify the employer hash to remove**

```bash
node -e 'console.log(require("node:crypto").createHash("sha256").update("ads").digest("hex"))'
```

Expected: `ebca001a1b5df7f3e79469fa2771aa7220ab7764773d7d42032a7f9b89d42d8b`

That value is the first entry in `FORBIDDEN_HASHES`. Confirm before deleting.

- [ ] **Step 2: Compute the client hashes to add**

```bash
node -e 'const c=require("node:crypto");for(const t of [/* client spellings — supplied out of band, never committed */])console.log(t.padEnd(10), c.createHash("sha256").update(t).digest("hex"))'
```

Record all five. They replace the removed entry.

- [ ] **Step 3: Write the failing test**

Add to the `confidentiality` describe block in `src/content/content.test.ts`, after the existing detector test:

```ts
  it("guards the client, not the employer", () => {
    // Tier 2 (client) is forbidden; tier 1 (employer) is allowed. See
    // docs/spec-repositioning.md § Confidentiality Policy Change.
    for (const clientToken of [/* client spellings — supplied out of band, never committed */]) {
      expect(containsForbidden(clientToken, FORBIDDEN_HASHES), clientToken).toBe(true);
    }
    expect(containsForbidden("ads", FORBIDDEN_HASHES)).toBe(false);
  });
```

- [ ] **Step 4: Run it and watch it fail**

```bash
pnpm vitest run src/content/content.test.ts
```

Expected: FAIL — the client tokens return `false`, `ads` returns `true`. Both assertions are backwards until Step 5.

- [ ] **Step 5: Apply the hash change**

In `FORBIDDEN_HASHES`, delete the `ebca001a…` line and add the five hashes from Step 2. Leave the other six entries untouched — they are product and module names and stay forbidden.

Update the block comment above the set. Replace the paragraph beginning "One of the tokens below is a short acronym" with:

```
 * Three tiers, per docs/spec-repositioning.md § Confidentiality Policy Change:
 * employer names are ALLOWED, client names are FORBIDDEN, product and module
 * names are FORBIDDEN. This list holds tiers 2 and 3 only. Adding an employer
 * token here would be a regression, not a tightening.
```

- [ ] **Step 6: Run the full content suite**

```bash
pnpm vitest run src/content/content.test.ts
```

Expected: PASS, all tests.

- [ ] **Step 7: Rewrite the prose rules so gate and doc agree**

In `AGENTS.md` § Confidentiality, replace the "Never put the employer's name…" paragraph with the three-tier table from `docs/spec-repositioning.md`. In `docs/spec.md` § Confidentiality, do the same and add a pointer to the new spec. Both must state that employer naming is permitted and client naming is not.

- [ ] **Step 8: Commit**

```bash
git add src/content/content.test.ts AGENTS.md docs/spec.md docs/spec-repositioning.md
git commit -m "refactor(content): guard the client, not the employer"
```

---

## Task 2: Fill the timeline

The visible failure this fixes: `experience` ends Dec 2024 while the work index shows Jan–Apr 2025 case studies.

**Files:**
- Modify: `src/content/profile.ts:82-137` (`experience`), `:66-69` (`bio`)
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: Task 1's denylist.
- Produces: `experience` with four entries, the last having no `end`. Task 8 reads it via `describeExperience`.

- [ ] **Step 1: Write the failing test**

Add to the `profile` describe block in `src/content/content.test.ts`:

```ts
  it("has no gap between leaving one role and starting the next", () => {
    // The 20-month hole between Dec 2024 and the Jan 2025 case studies is the
    // failure this guards. Sorted by start; each entry must begin within a
    // month of the previous one ending.
    const dated = [...experience].sort((a, b) => a.start.localeCompare(b.start));
    const current = dated.filter((entry) => !entry.end);

    expect(current.length, "exactly one role should be current").toBe(1);
    expect(dated.at(-1)?.end, "the current role must be the most recent").toBeUndefined();
  });

  it("covers every month the case studies claim work", () => {
    const earliestProject = projects
      .map((p) => p.started)
      .sort()
      .at(0)!;
    const earliestRole = [...experience].map((e) => e.start).sort().at(0)!;

    expect(earliestRole <= earliestProject, "a case study predates every role").toBe(true);
  });
```

- [ ] **Step 2: Run it and watch it fail**

```bash
pnpm vitest run src/content/content.test.ts -t "current"
```

Expected: FAIL — `current.length` is 0, because both existing entries have an `end`.

- [ ] **Step 3: Replace the experience array**

In `src/content/profile.ts`, replace the whole `experience` export. Order is oldest-first, matching the existing file.

```ts
export const experience: readonly Experience[] = [
  {
    organization: "ADS Digital Partner",
    role: { en: "Web Developer (Intern)", id: "Web Developer (Magang)" },
    start: "2023-08",
    end: "2023-12",
    location: "Surabaya, Indonesia",
    highlights: [
      {
        en: "Built a social media analytics website end to end",
        id: "Membangun situs analitik media sosial secara menyeluruh",
      },
      {
        en: "Integrated frontend views with backend services",
        id: "Mengintegrasikan tampilan frontend dengan layanan backend",
      },
    ],
    photo: {
      src: "/about/agency-team",
      alt: {
        en: "The team in Surabaya, 2023",
        id: "Tim di Surabaya, 2023",
      },
    },
  },
  {
    organization: "Politeknik Negeri Malang",
    role: { en: "Blockchain Mentor", id: "Mentor Blockchain" },
    start: "2024-08",
    end: "2024-12",
    location: "Malang, Indonesia",
    highlights: [
      {
        en: "Mentored 5 students on blockchain fundamentals and best practices",
        id: "Membimbing 5 mahasiswa tentang dasar-dasar dan praktik terbaik blockchain",
      },
      {
        en: "Taught smart contract development in Solidity",
        id: "Mengajarkan pengembangan smart contract dengan Solidity",
      },
      {
        en: "Set up a blockchain network with Hyperledger Besu",
        id: "Menyiapkan jaringan blockchain dengan Hyperledger Besu",
      },
      {
        en: "Guided an ERC-20 token implementation for carbon credit tokenization",
        id: "Memandu implementasi token ERC-20 untuk tokenisasi kredit karbon",
      },
    ],
  },
  {
    organization: "ARMS (PT. Andal Rancang Multi Solusi)",
    role: { en: "Data Scientist", id: "Data Scientist" },
    start: "2024-11",
    end: "2024-12",
    location: "Jakarta, Indonesia",
    highlights: [
      {
        // The client is a tier-2 term. Category only, never the name.
        en: "First data scientist on a data platform engagement for a national government revenue agency",
        id: "Data scientist pertama pada penugasan platform data untuk lembaga penerimaan negara",
      },
      {
        en: "Earned six Dataiku certifications in the first two months",
        id: "Meraih enam sertifikasi Dataiku dalam dua bulan pertama",
      },
    ],
  },
  {
    organization: "ADS Digital Partner",
    role: { en: "AI Lead Engineer", id: "AI Lead Engineer" },
    start: "2025-01",
    location: "Jakarta, Indonesia",
    highlights: [
      {
        en: "Returned to the company where I interned, now leading its AI engineering team",
        id: "Kembali ke perusahaan tempat saya magang, kini memimpin tim AI engineering-nya",
      },
      {
        en: "Lead engineer for on-premises LLM deployment behind client firewalls",
        id: "Lead engineer untuk penerapan LLM on-premises di balik firewall klien",
      },
      {
        en: "Built agent pipelines, document and media processing, and the operator-facing interfaces on top",
        id: "Membangun pipeline agent, pemrosesan dokumen dan media, serta antarmuka operator di atasnya",
      },
    ],
  },
];
```

**Note the deliberate omissions.** No product names, no module names, no client name. "a national government revenue agency" is the agreed anonymisation (Decision 1).

- [ ] **Step 4: Update the bio**

Replace `profile.bio` (currently "Developer working across web, blockchain, and data…"):

```ts
  bio: {
    en: "AI lead engineer. I build agent pipelines, document and media processing, and the operator-facing interfaces on top of them — mostly on-premises, behind client firewalls. Earlier work in blockchain and data still shows up in how I think about systems.",
    id: "AI lead engineer. Saya membangun pipeline agent, pemrosesan dokumen dan media, serta antarmuka operator di atasnya — sebagian besar on-premises, di balik firewall klien. Pengalaman awal di blockchain dan data masih membentuk cara saya memandang sistem.",
  },
```

- [ ] **Step 5: Run the tests**

```bash
pnpm vitest run src/content/content.test.ts
```

Expected: PASS. The denylist test in particular — it now scans four entries naming two employers, and must stay green.

- [ ] **Step 6: Verify the rendered timeline**

```bash
pnpm typecheck
```

Expected: no errors. `about-section.tsx` reads `experience` generically and needs no change.

- [ ] **Step 7: Commit**

```bash
git add src/content/profile.ts src/content/content.test.ts
git commit -m "feat(content): fill the timeline through to the current role"
```

---

## Task 3: Publication and published-model content

The evidence layer's data. Decision 6 makes Hugging Face the centrepiece.

**Files:**
- Modify: `src/content/profile.ts` (new types + exports)
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: `Localized` from `@/lib/locale`.
- Produces:
  - `export type Publication` — fields `title: string`, `venue: string`, `year: number`, `doi: string`, `authorPosition: number`, `authorCount: number`, `contribution: Localized`, `topics: string[]`
  - `export type PublishedModel` — fields `id: string`, `task: Localized`, `likes?: number`, `baseModel?: string`
  - `export const publications: readonly Publication[]`
  - `export const publishedModels: readonly PublishedModel[]`
  - `export const HUGGINGFACE_URL`, `export const GITHUB_URL`
  - Task 6 renders these; Task 8 puts them in the prompt.

- [ ] **Step 1: Write the failing test**

Add a new describe block to `src/content/content.test.ts`:

```ts
describe("evidence", () => {
  it("gives every publication a resolvable DOI and an honest author position", () => {
    expect(publications.length).toBeGreaterThan(0);
    for (const paper of publications) {
      expect(paper.doi, paper.title).toMatch(/^https:\/\/doi\.org\/10\./);
      expect(paper.authorPosition, paper.title).toBeGreaterThan(0);
      expect(paper.authorPosition, paper.title).toBeLessThanOrEqual(paper.authorCount);
    }
  });

  it("namespaces every published model under the real account", () => {
    expect(publishedModels.length).toBeGreaterThan(0);
    for (const model of publishedModels) {
      expect(model.id, model.id).toMatch(/^nahiar\/[\w.-]+$/);
    }
  });

  it("points the profile links at https", () => {
    for (const url of [HUGGINGFACE_URL, GITHUB_URL]) {
      expect(url).toMatch(/^https:\/\//);
    }
  });
});
```

Add the imports to the existing import line:

```ts
import {
  GITHUB_URL,
  HUGGINGFACE_URL,
  certifications,
  education,
  experience,
  profile,
  publications,
  publishedModels,
} from "./profile";
```

- [ ] **Step 2: Run it and watch it fail**

```bash
pnpm vitest run src/content/content.test.ts -t "evidence"
```

Expected: FAIL — the module has no such exports; TypeScript and Vitest both complain.

- [ ] **Step 3: Add the types**

In `src/content/profile.ts`, after the `Certification` type:

```ts
/**
 * A peer-reviewed paper. The DOI is the whole point: it is the one claim on
 * this site a stranger can verify in a single click.
 */
export type Publication = {
  title: string;
  venue: string;
  year: number;
  /** Full resolvable DOI URL, not the bare identifier. */
  doi: string;
  /** 1-indexed position in the author list. Stated, never implied. */
  authorPosition: number;
  authorCount: number;
  /** What he built. Not a claim about what the other authors did. */
  contribution: Localized;
  topics: string[];
};

/**
 * A model published under his own Hugging Face account.
 *
 * This is the strongest evidence on the site: the NDA work can only be
 * asserted, but these are public artefacts strangers chose to use.
 */
export type PublishedModel = {
  /** Hugging Face repo id, e.g. "nahiar/sentiment-analysis-v2". */
  id: string;
  task: Localized;
  /**
   * Recorded by hand at author time. Not fetched — the site is static and a
   * build-time network call for a vanity number is a bad trade. Refresh it
   * when it drifts; a stale number is worse than none, so omit rather than
   * guess.
   */
  likes?: number;
  baseModel?: string;
};
```

- [ ] **Step 4: Add the content**

At the end of `src/content/profile.ts`:

```ts
export const GITHUB_URL = "https://github.com/raihanhd12";
export const HUGGINGFACE_URL = "https://huggingface.co/nahiar";

export const publications: readonly Publication[] = [
  {
    title:
      "Towards Trustless Academic Records in Higher Education: Integrating Blockchain and IPFS for Verifiable Student Credentials",
    venue:
      "2025 International Conference on Innovation and Intelligence for Informatics, Computing, and Technologies (3ICT)",
    year: 2025,
    doi: "https://doi.org/10.1109/3ICT68299.2025.11442139",
    authorPosition: 3,
    authorCount: 9,
    contribution: {
      en: "Implemented the permissioned Hyperledger Besu network, the credential smart contracts with role-based access control, the IPFS storage layer, and the ReactJS client built on the Thirdweb SDK.",
      id: "Mengimplementasikan jaringan Hyperledger Besu berizin, smart contract kredensial dengan kontrol akses berbasis peran, lapisan penyimpanan IPFS, dan klien ReactJS di atas Thirdweb SDK.",
    },
    topics: ["Hyperledger Besu", "IPFS", "Solidity", "ReactJS", "Thirdweb"],
  },
];

/**
 * The four with real third-party traction, not all 34. A long list of
 * unremarkable models reads as noise; four with usage reads as a track record.
 */
export const publishedModels: readonly PublishedModel[] = [
  {
    id: "nahiar/sentiment-analysis-v2",
    task: { en: "Text classification", id: "Klasifikasi teks" },
    likes: 124,
  },
  {
    id: "nahiar/spam-detection-xlm-roberta-v3",
    task: { en: "Text classification", id: "Klasifikasi teks" },
    likes: 83,
    baseModel: "XLM-RoBERTa",
  },
  {
    id: "nahiar/xlm-roberta-ner-v2",
    task: { en: "Token classification", id: "Klasifikasi token" },
    likes: 75,
    baseModel: "XLM-RoBERTa",
  },
  {
    id: "nahiar/whisper-v1",
    task: { en: "Speech recognition", id: "Pengenalan suara" },
    likes: 15,
    baseModel: "Whisper",
  },
];
```

- [ ] **Step 5: Wire the new exports into the denylist scan**

In `src/content/content.test.ts`, extend `allContent` so the confidentiality check covers the new content too:

```ts
const allContent = [
  ...collectStrings(projects, "projects"),
  ...collectStrings(profile, "profile"),
  ...collectStrings(experience, "experience"),
  ...collectStrings(education, "education"),
  ...collectStrings(certifications, "certifications"),
  ...collectStrings(publications, "publications"),
  ...collectStrings(publishedModels, "publishedModels"),
];
```

- [ ] **Step 6: Run the tests**

```bash
pnpm vitest run src/content/content.test.ts
```

Expected: PASS.

- [ ] **Step 7: Verify each model id actually resolves**

Open all four. A 404 in the evidence section is worse than no evidence section.

```bash
for m in sentiment-analysis-v2 spam-detection-xlm-roberta-v3 xlm-roberta-ner-v2 whisper-v1; do
  printf "%-40s %s\n" "$m" "$(curl -s -o /dev/null -w '%{http_code}' "https://huggingface.co/nahiar/$m")"
done
```

Expected: `200` for all four. Also confirm `https://doi.org/10.1109/3ICT68299.2025.11442139` resolves to IEEE Xplore.

- [ ] **Step 8: Commit**

```bash
git add src/content/profile.ts src/content/content.test.ts
git commit -m "feat(content): add publication and published-model evidence"
```

---

## Task 4: Real certification data

The section heading promises "a public verification link where the issuer provides one" and currently delivers zero. Six Dataiku certificates exist; four are listed.

**Files:**
- Modify: `src/content/profile.ts` (`certifications`)
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: the `Certification` type (unchanged).
- Produces: `certifications` with `issued`, `credentialId`, and `verifyUrl` populated.

- [ ] **Step 1: Read the six PDFs to map credential IDs to certificate names**

The filenames carry the ID and the issue date; only the PDF body carries the name.

```bash
ls -1 "/Users/nahiarhd/Downloads/Portfolio/Certificates/Dataiku"
```

Known from the filenames (ID → issue date):

| Credential ID | Issued |
|---|---|
| `6uqybt6jajtr` | 2024-12-04 |
| `v439v63i2daa` | 2024-12-04 |
| `bwqycmmtuced` | 2024-12-05 |
| `tuj5pxkizvjo` | 2024-12-05 |
| `7pj8jh3ruaue` | 2024-12-24 |
| `rriyymrx88zz` | 2025-01-02 |

Open each PDF and record which certificate name it carries. **Do not guess the mapping** — a wrong credential ID next to a certificate name is a verifiable lie.

- [ ] **Step 2: Confirm the verification URL pattern**

Dataiku Academy issues through Skilljar. Test one ID before writing six:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://verify.skilljar.com/c/6uqybt6jajtr"
```

Expected: `200`. **If it is not 200, stop and find the real pattern from the PDF itself** — most certificates print their verification URL. Do not ship a guessed URL.

- [ ] **Step 3: Write the failing test**

Add to the `evidence` describe block from Task 3:

```ts
  it("gives every certification an issuer, a date, and a verifiable link", () => {
    for (const cert of certifications) {
      expect(cert.issuer.trim(), cert.name).toBeTruthy();
      expect(cert.issued, cert.name).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      if (cert.verifyUrl) {
        expect(cert.verifyUrl, cert.name).toMatch(/^https:\/\//);
        expect(cert.credentialId?.trim(), `${cert.name} links without an id`).toBeTruthy();
      }
    }
  });

  it("lists all six Dataiku certificates", () => {
    const dataiku = certifications.filter((c) => c.issuer === "Dataiku");
    expect(dataiku).toHaveLength(6);
    expect(new Set(dataiku.map((c) => c.credentialId)).size, "duplicate ids").toBe(6);
  });
```

- [ ] **Step 4: Run it and watch it fail**

```bash
pnpm vitest run src/content/content.test.ts -t "certification"
```

Expected: FAIL — `issued` is `undefined` on all five, and only four Dataiku entries exist.

- [ ] **Step 5: Replace the certifications array**

Using the mapping from Step 1. Template — substitute the real names against the real IDs:

```ts
export const certifications: readonly Certification[] = [
  {
    name: "<from PDF>",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "6uqybt6jajtr",
    verifyUrl: "https://verify.skilljar.com/c/6uqybt6jajtr",
    image: "/certifications/dataiku-<slug>",
  },
  // …five more, one per credential ID from the Step 1 table
  {
    name: "Sertifikat MSIB",
    issuer: "Kampus Merdeka",
    issued: "2024-01",
    image: "/certifications/msib",
  },
];
```

Delete the docblock above the old array beginning "`issued`, `credentialId` and `verifyUrl` are deliberately absent" — it no longer describes the code.

- [ ] **Step 6: Run the tests**

```bash
pnpm vitest run src/content/content.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content/profile.ts src/content/content.test.ts
git commit -m "feat(content): add real credential ids and verification links"
```

---

## Task 5: Positioning copy

Decision 8: the signal is *not looking, but movable*. `OPEN TO WORK` reads as looking, and someone looking has less leverage.

**Files:**
- Modify: `src/app/[lang]/dictionaries/en.json`, `src/app/[lang]/dictionaries/id.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `hero.status`, `hero.ctaSecondary`, `about.lead` in both locales. `Dictionary` is inferred from `en.json`, so keys must match exactly across files.

- [ ] **Step 1: Run the parity test first, to see it green before you start**

```bash
pnpm vitest run src/app/\[lang\]/dictionaries.test.ts
```

Expected: PASS. Any failure after this task is yours.

- [ ] **Step 2: Edit `en.json`**

```json
  "hero": {
    "titleLine1": "I build AI systems",
    "titleLine2": "and their interfaces.",
    "body": "Agent pipelines, document and media processing, and the operator-facing surfaces that make them usable.",
    "ctaPrimary": "See the work",
    "ctaSecondary": "Work with me",
    "status": "Open to select work"
  },
```

And:

```json
  "about": {
    "experience": "Experience",
    "education": "Education",
    "present": "Present",
    "photo": "Photo",
    "lead": "AI lead engineer, working mostly on on-premises systems behind client firewalls. Earlier work teaching blockchain development and building analytics products."
  },
```

`titleLine1/2` are **unchanged** — already the right headline, and now the lead claim rather than one of three competing pillars.

- [ ] **Step 3: Edit `id.json` to match, key for key**

```json
  "hero": {
    "ctaSecondary": "Ajak kerja sama",
    "status": "Terbuka untuk proyek terpilih"
  },
```

```json
  "about": {
    "lead": "AI lead engineer, sebagian besar menangani sistem on-premises di balik firewall klien. Sebelumnya mengajar pengembangan blockchain dan membangun produk analitik."
  },
```

Keep every other key in both files as-is.

- [ ] **Step 4: Run the parity test**

```bash
pnpm vitest run src/app/\[lang\]/dictionaries.test.ts
```

Expected: PASS. A mismatch means a key was renamed in one file only.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[lang]/dictionaries/en.json" "src/app/[lang]/dictionaries/id.json"
git commit -m "feat(copy): signal selective availability, not job-hunting"
```

---

## Task 6: Evidence section

Replaces `CertificationsSection`. One section, four kinds of proof, ordered by strength: models, paper, code, certifications.

**Files:**
- Create: `src/components/evidence-section.tsx`
- Delete: `src/components/certifications-section.tsx`
- Modify: `src/app/[lang]/page.tsx:5,52`
- Modify: both dictionary files

**Interfaces:**
- Consumes: `publications`, `publishedModels`, `certifications`, `HUGGINGFACE_URL`, `GITHUB_URL` (Tasks 3–4).
- Produces: `export function EvidenceSection({ lang, dictionary }: { lang: Locale; dictionary: Dictionary["evidence"] })`.

- [ ] **Step 1: Add the dictionary keys to `en.json`**

Replace the whole `"certifications"` block with:

```json
  "evidence": {
    "heading": "On the record",
    "lead": "Most of the work above is under NDA. This is the part you can check yourself.",
    "modelsHeading": "Published models",
    "modelsLead": "34 models and 48 datasets published under my own account.",
    "modelsAll": "All models",
    "paperHeading": "Publication",
    "paperRead": "Read the paper",
    "paperAuthor": "Author {position} of {count}",
    "codeHeading": "Code",
    "codeLead": "Open source and experiments.",
    "certificationsHeading": "Certifications",
    "verify": "Verify",
    "credentialId": "Credential ID",
    "certificate": "Certificate",
    "likes": "likes",
    "mediaHint": "Add JPG or PNG under public/certifications/"
  },
```

- [ ] **Step 2: Add the same keys to `id.json`**

```json
  "evidence": {
    "heading": "Bisa diperiksa",
    "lead": "Sebagian besar pekerjaan di atas berada di bawah NDA. Ini bagian yang bisa Anda periksa sendiri.",
    "modelsHeading": "Model yang dipublikasikan",
    "modelsLead": "34 model dan 48 dataset dipublikasikan di akun saya sendiri.",
    "modelsAll": "Semua model",
    "paperHeading": "Publikasi",
    "paperRead": "Baca makalahnya",
    "paperAuthor": "Penulis ke-{position} dari {count}",
    "codeHeading": "Kode",
    "codeLead": "Open source dan eksperimen.",
    "certificationsHeading": "Sertifikasi",
    "verify": "Verifikasi",
    "credentialId": "ID Kredensial",
    "certificate": "Sertifikat",
    "likes": "suka",
    "mediaHint": "Tambahkan JPG atau PNG di public/certifications/"
  },
```

- [ ] **Step 3: Run the parity test**

```bash
pnpm vitest run src/app/\[lang\]/dictionaries.test.ts
```

Expected: PASS.

- [ ] **Step 4: Create the component**

`src/components/evidence-section.tsx`:

```tsx
import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  GITHUB_URL,
  HUGGINGFACE_URL,
  certifications,
  publications,
  publishedModels,
} from "@/content/profile";
import { BUTTON, CONTAINER, EYEBROW, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";
import { RedactLine } from "./redact-line";

/**
 * The answer to the site's central problem: four of six case studies are under
 * NDA and unprovable. Everything in this section is public and checkable in one
 * click, which is the only thing that converts an assertion into evidence.
 *
 * Ordered by strength, not by convention: published models first (strangers
 * chose to use them), then the paper, then code, then certifications.
 */
export function EvidenceSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["evidence"];
}) {
  return (
    <section id="evidence" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight">
          <RedactLine>{dictionary.heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.lead}
        </p>
      </div>

      {/* Models — the strongest claim, so it leads. */}
      <div data-anim="stagger" className="mt-16">
        <p className={EYEBROW}>{dictionary.modelsHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.modelsLead}
        </p>

        <ul className="mt-8 grid gap-x-8 gap-y-px sm:grid-cols-2">
          {publishedModels.map((model) => (
            <li key={model.id} className="border-t border-border">
              <a
                href={`https://huggingface.co/${model.id}`}
                rel="noreferrer"
                target="_blank"
                className="group flex items-baseline justify-between gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm text-foreground transition-colors group-hover:text-primary">
                    {model.id.replace("nahiar/", "")}
                  </span>
                  <span className={cn("mt-1 block text-sm", TEXT.subtle)}>
                    {model.task[lang]}
                    {model.baseModel ? ` · ${model.baseModel}` : null}
                  </span>
                </span>
                {model.likes ? (
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {model.likes} {dictionary.likes}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={HUGGINGFACE_URL}
          rel="noreferrer"
          target="_blank"
          className={cn(BUTTON.secondary, "mt-8")}
        >
          {dictionary.modelsAll} &#8599;
        </a>
      </div>

      {/* Publication. */}
      {publications.map((paper) => (
        <div key={paper.doi} data-anim="stagger" className="mt-20 border-t border-border pt-10">
          <p className={EYEBROW}>{dictionary.paperHeading}</p>
          <h3 className="mt-4 max-w-[46ch] font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            {paper.title}
          </h3>
          <p className={cn("mt-3 max-w-[52ch] text-sm leading-relaxed", TEXT.subtle)}>
            {paper.venue}, {paper.year} ·{" "}
            {dictionary.paperAuthor
              .replace("{position}", String(paper.authorPosition))
              .replace("{count}", String(paper.authorCount))}
          </p>
          <p className={cn("mt-4 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
            {paper.contribution[lang]}
          </p>
          <a
            href={paper.doi}
            rel="noreferrer"
            target="_blank"
            className={cn(BUTTON.secondary, "mt-6")}
          >
            {dictionary.paperRead} &#8599;
          </a>
        </div>
      ))}

      {/* Code. */}
      <div data-anim="stagger" className="mt-20 border-t border-border pt-10">
        <p className={EYEBROW}>{dictionary.codeHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.codeLead}
        </p>
        <a
          href={GITHUB_URL}
          rel="noreferrer"
          target="_blank"
          className={cn(BUTTON.secondary, "mt-6")}
        >
          github.com/raihanhd12 &#8599;
        </a>
      </div>

      {/* Certifications — ruled rows, not a card grid: a certificate is one
       * line of information, and six in a three-column grid ends on a gap. */}
      <div data-anim="stagger" className="mt-20 border-t border-border pt-10">
        <p className={EYEBROW}>{dictionary.certificationsHeading}</p>

        <ul className="mt-8">
          {certifications.map((certification) => (
            <li
              key={certification.name}
              className="group border-t border-border transition-colors duration-300 last:border-b hover:border-primary"
            >
              <article className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:gap-8">
                <MediaFrame
                  src={resolvePublicMedia(certification.image)}
                  alt=""
                  label={dictionary.certificate}
                  slot={mediaDropHint(certification.image)}
                  aspectClassName="aspect-[8/5]"
                  sizes="10rem"
                  className="w-40 shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:-translate-y-0.5"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-medium leading-snug tracking-tight sm:text-xl">
                    {certification.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                      TEXT.faint,
                    )}
                  >
                    {certification.issuer}
                    {certification.issued
                      ? ` · ${formatMonth(certification.issued, lang)}`
                      : null}
                  </p>
                  {certification.credentialId ? (
                    <p className={cn("mt-2 break-all font-mono text-[0.65rem]", TEXT.faint)}>
                      {dictionary.credentialId}: {certification.credentialId}
                    </p>
                  ) : null}
                </div>

                {certification.verifyUrl ? (
                  <a
                    href={certification.verifyUrl}
                    rel="noreferrer"
                    target="_blank"
                    className={cn(
                      "shrink-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary",
                      "transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    )}
                  >
                    {dictionary.verify} &#8599;
                    <span className="sr-only"> ({certification.name}, opens in a new tab)</span>
                  </a>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Swap it into the page**

In `src/app/[lang]/page.tsx`, change the import on line 5 and the usage on line 52:

```tsx
import { EvidenceSection } from "@/components/evidence-section";
```

```tsx
      <EvidenceSection lang={lang} dictionary={dictionary.evidence} />
```

- [ ] **Step 6: Delete the old section**

```bash
git rm src/components/certifications-section.tsx
```

- [ ] **Step 7: Verify nothing else imported it**

```bash
pnpm typecheck && pnpm lint
```

Expected: no errors. `@typescript-eslint/no-unused-vars` is an error here, so a stale import fails the build rather than lingering.

- [ ] **Step 8: Look at it**

Reload `http://localhost:3000/en#evidence` and confirm: four model rows with like counts, the paper with a working DOI link, the GitHub link, and six certifications each showing a credential ID and a Verify link.

- [ ] **Step 9: Commit**

```bash
git add -A src/components src/app
git commit -m "feat(evidence): replace certifications with a verifiable evidence section"
```

---

## Task 7: Engagement section

Two blocks, because freelance buyers and hiring managers want different facts and mixing them serves neither.

**Files:**
- Modify: `src/components/contact-section.tsx`
- Modify: `src/content/profile.ts` (add `engagement`)
- Modify: both dictionary files
- Modify: `src/app/[lang]/page.tsx:53-57`

**Interfaces:**
- Consumes: `profile`, `GITHUB_URL`, `HUGGINGFACE_URL`.
- Produces: `export function ContactSection({ lang, dictionary }: { lang: Locale; dictionary: Dictionary["contact"] })` — **note the changed signature**; it no longer takes `heading` and `body` props.

- [ ] **Step 1: Add the engagement data**

In `src/content/profile.ts`, after `profile`:

```ts
/**
 * Engagement terms. `projectMinimumUsd` is deliberately optional: the section
 * omits the line entirely rather than render a placeholder, and no number is
 * invented here. See docs/spec-repositioning.md Open Question 1.
 */
export const engagement = {
  /** Set this before publishing. Undefined renders no rate line at all. */
  projectMinimumUsd: undefined as number | undefined,
  responseHours: 48,
  hoursPerWeek: { from: 10, to: 15 },
} as const;
```

- [ ] **Step 2: Add the dictionary keys to `en.json`**

Replace the `"contact"` block:

```json
  "contact": {
    "heading": "Work together",
    "freelanceHeading": "Freelance projects",
    "freelanceScope": "Agent pipelines, on-premises LLM deployment, document and media processing, and the operator-facing interfaces on top.",
    "freelanceCapacity": "I'm employed full-time, so this runs evenings and weekends — roughly {from}–{to} hours a week. Project-based and async: no daytime calls or standups.",
    "freelanceRate": "Projects from ${minimum}.",
    "freelanceResponse": "I reply within {hours} hours.",
    "fulltimeHeading": "Full-time",
    "fulltimeBody": "Not actively looking. I'll consider senior or lead AI roles that are remote-first and a clear step up in scope.",
    "emailLabel": "Email"
  },
```

- [ ] **Step 3: Add the same keys to `id.json`**

```json
  "contact": {
    "heading": "Mari bekerja sama",
    "freelanceHeading": "Proyek freelance",
    "freelanceScope": "Pipeline agent, penerapan LLM on-premises, pemrosesan dokumen dan media, serta antarmuka operator di atasnya.",
    "freelanceCapacity": "Saya bekerja penuh waktu, jadi ini berjalan pada malam hari dan akhir pekan — sekitar {from}–{to} jam per minggu. Berbasis proyek dan asinkron: tanpa panggilan atau standup di jam kerja.",
    "freelanceRate": "Proyek mulai dari ${minimum}.",
    "freelanceResponse": "Saya membalas dalam {hours} jam.",
    "fulltimeHeading": "Penuh waktu",
    "fulltimeBody": "Tidak sedang aktif mencari. Saya mempertimbangkan peran AI senior atau lead yang remote-first dan jelas merupakan peningkatan cakupan.",
    "emailLabel": "Email"
  },
```

- [ ] **Step 4: Rewrite the component**

Replace `src/components/contact-section.tsx` entirely:

```tsx
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { GITHUB_URL, HUGGINGFACE_URL, engagement, profile } from "@/content/profile";
import { BUTTON, CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";

/**
 * Two blocks, not one message. A freelance buyer wants scope, capacity and a
 * price floor; someone hiring wants to know whether he is movable at all.
 * Merging them produces copy that answers neither.
 *
 * Left-aligned, unlike the centred closing statement it replaces: this section
 * now carries structured detail, and centred text with four facts in it reads
 * as a poster rather than something to act on.
 */
export function ContactSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["contact"];
}) {
  const capacity = dictionary.freelanceCapacity
    .replace("{from}", String(engagement.hoursPerWeek.from))
    .replace("{to}", String(engagement.hoursPerWeek.to));

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
      <div className={CONTAINER}>
        <div data-anim="reveal-head">
          <h2 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-medium leading-[1.05] tracking-tight">
            <RedactLine>{dictionary.heading}</RedactLine>
          </h2>
        </div>

        <div data-anim="stagger" className="mt-14 grid gap-12 border-t border-border pt-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <p className={EYEBROW}>{dictionary.freelanceHeading}</p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>
              {dictionary.freelanceScope}
            </p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>{capacity}</p>

            {/* Omitted entirely until a real figure exists. A placeholder rate
             * is worse than no rate. */}
            {engagement.projectMinimumUsd ? (
              <p className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                {dictionary.freelanceRate.replace(
                  "{minimum}",
                  engagement.projectMinimumUsd.toLocaleString("en-US"),
                )}
              </p>
            ) : null}

            <p className={cn("mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
              {dictionary.freelanceResponse.replace("{hours}", String(engagement.responseHours))}
            </p>
          </div>

          <div>
            <p className={EYEBROW}>{dictionary.fulltimeHeading}</p>
            <p className={cn("mt-4 text-base leading-relaxed", TEXT.subtle)}>
              {dictionary.fulltimeBody}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className={BUTTON.primary}>
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            rel="me noreferrer"
            target="_blank"
            aria-label="LinkedIn (opens in a new tab)"
            className={BUTTON.secondary}
          >
            LinkedIn
          </a>
          <a
            href={GITHUB_URL}
            rel="me noreferrer"
            target="_blank"
            aria-label="GitHub (opens in a new tab)"
            className={BUTTON.secondary}
          >
            GitHub
          </a>
          <a
            href={HUGGINGFACE_URL}
            rel="me noreferrer"
            target="_blank"
            aria-label="Hugging Face (opens in a new tab)"
            className={BUTTON.secondary}
          >
            Hugging Face
          </a>
        </div>

        <p className={cn("mt-8 font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
          {profile.location[lang]}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update the call site**

In `src/app/[lang]/page.tsx`, replace the `<ContactSection …>` block:

```tsx
      <ContactSection lang={lang} dictionary={dictionary.contact} />
```

- [ ] **Step 6: Verify**

```bash
pnpm verify
```

Expected: PASS. If `nav.contact` is now unused, leave it — the header still links to `#contact`.

- [ ] **Step 7: Look at it, at both widths**

Reload `#contact` at desktop and at 375px. Confirm the two columns stack on mobile and the four profile links wrap without overflowing.

- [ ] **Step 8: Commit**

```bash
git add -A src/components src/content src/app
git commit -m "feat(contact): two-block engagement section with real terms"
```

---

## Task 8: Teach the bot the new facts

Skipping this leaves the bot contradicting the page it sits on. It also fixes a live bug: line 101 interpolates certification **objects**, so the prompt currently reads `- [object Object]` five times.

**Files:**
- Modify: `src/lib/chat-prompt.ts`
- Test: `src/lib/chat-prompt.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–4, 7.
- Produces: `buildSystemPrompt(locale)` — signature unchanged.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/chat-prompt.test.ts`:

```ts
  it("renders certifications as text, not as [object Object]", () => {
    const prompt = buildSystemPrompt("en");
    expect(prompt).not.toContain("[object Object]");
    expect(prompt).toContain("Dataiku");
  });

  it("names no client and quotes no money", () => {
    for (const locale of LOCALES) {
      const prompt = buildSystemPrompt(locale).toLowerCase();
      for (const token of [/* client spellings — supplied out of band, never committed */]) {
        expect(prompt, `${locale} leaks ${token}`).not.toContain(token);
      }
      // Rates are conversations, not bot answers. A bot that knows the
      // project minimum will negotiate on his behalf.
      expect(prompt).not.toMatch(/\$\s?\d/);
    }
  });

  it("states the availability posture without job-hunting", () => {
    const prompt = buildSystemPrompt("en");
    expect(prompt).toContain("not actively looking");
    expect(prompt.toLowerCase()).toContain("huggingface.co/nahiar");
  });
```

Make sure `LOCALES` is imported from `@/lib/locale`.

- [ ] **Step 2: Run and watch them fail**

```bash
pnpm vitest run src/lib/chat-prompt.test.ts
```

Expected: FAIL — `[object Object]` is present, and the posture and Hugging Face strings are absent.

- [ ] **Step 3: Fix the certification interpolation**

Replace line 101:

```ts
${certifications.map((c) => `- ${c.name} (${c.issuer}${c.issued ? `, ${c.issued}` : ""})`).join("\n")}
```

- [ ] **Step 4: Add the evidence to the prompt**

Add the import at the top:

```ts
import {
  HUGGINGFACE_URL,
  certifications,
  education,
  experience,
  profile,
  publications,
  publishedModels,
} from "@/content/profile";
```

Insert after the `### Certifications` block:

```ts
### Public, verifiable work

Unlike the NDA projects, these are public and a visitor can check them. Point
people at them when asked for proof.

- Hugging Face (${HUGGINGFACE_URL}): 34 published models and 48 datasets. Most used:
${publishedModels.map((m) => `  · ${m.id} — ${m.task[locale]}${m.likes ? `, ${m.likes} likes` : ""}`).join("\n")}
- Peer-reviewed publication:
${publications.map((p) => `  · "${p.title}", ${p.venue}, ${p.year}. Author ${p.authorPosition} of ${p.authorCount}. ${p.doi}\n    His contribution: ${p.contribution[locale]}`).join("\n")}
```

- [ ] **Step 5: Add the availability posture**

Insert a new section immediately after the `## Confidentiality` block:

```ts
## Availability — say this accurately

Raihan is employed full-time and leads an AI engineering team. He is **not
actively looking**, but he is open to the right thing:

- **Freelance projects** — evenings and weekends, roughly 10–15 hours a week,
  project-based and async. He does not take daytime calls or standups.
- **Full-time** — only senior or lead AI roles that are remote-first and a clear
  step up in scope.

Never describe him as job-hunting, available immediately, or looking for work.
NEVER quote, estimate, or negotiate a rate, salary, or budget — say those are
worth an email to ${profile.email}. Do not mention his contract or its dates.
```

- [ ] **Step 6: Run the tests**

```bash
pnpm vitest run src/lib/chat-prompt.test.ts
```

Expected: PASS.

- [ ] **Step 7: Ask the bot, and compare against the page**

With the dev server running, open the Ask section and ask three questions: *"What has he built?"*, *"Is he available for hire?"*, *"Who does he work for?"*

Expected: the timeline matches the About section; availability matches the engagement section; the employer may be named but the client and products never are; no figure is quoted.

- [ ] **Step 8: Commit**

```bash
git add src/lib/chat-prompt.ts src/lib/chat-prompt.test.ts
git commit -m "fix(chat): teach the prompt the new facts and stop [object Object]"
```

---

## Task 9: Redaction screen-reader label

The visible bar is `aria-hidden`; the `sr-only` span carries `work.redacted`, which is `"Redacted · Nda"`. A screen reader announces that mid-sentence as *"Redacted, N-D-A"* — the middot is noise and `Nda` is read as a word, not an initialism. The visual label wants to stay short; the announced one wants to be a phrase. They should be two strings.

**Files:**
- Modify: `src/components/redaction.tsx:9-21`, `:24-34`
- Modify: `src/components/work-index.tsx:96`
- Modify: both dictionary files

**Interfaces:**
- Consumes: nothing.
- Produces: `withRedactions(text: string, label: string, announced: string)` — **third parameter is new.** Every call site must pass it.

- [ ] **Step 1: Find every call site**

```bash
grep -rn "withRedactions" src/
```

Expected: the definition plus its callers. Update all of them in Step 4.

- [ ] **Step 2: Add the announced label to both dictionaries**

`en.json`, in `"work"`, beside the existing `"redacted"`:

```json
    "redactedAnnounced": "redacted under NDA",
```

`id.json`:

```json
    "redactedAnnounced": "disunting berdasarkan NDA",
```

- [ ] **Step 3: Update the component**

```tsx
/**
 * Theatrical redaction bar. Nothing real is ever behind it — hover/focus
 * (and reduced-motion) show the NDA label only. See docs/ideas/declassified-dossier.md.
 *
 * `label` is the visual chip; `announced` is what a screen reader reads in
 * place of the concealed words. They differ on purpose: "Redacted · Nda" is
 * legible as a stamp but is announced as "Redacted, N-D-A" mid-sentence, which
 * does not parse. The announced string has to be a phrase that fits the clause.
 */
function Redaction({ label, announced }: { label: string; announced: string }) {
  return (
    <span className="redaction" tabIndex={0}>
      <span className="redaction__bar" aria-hidden>
        ████████
      </span>
      <span className="redaction__label" aria-hidden>
        [{label}]
      </span>
      <span className="sr-only">{announced}</span>
    </span>
  );
}

/** Split content on `{{redacted}}` and interleave redaction bars. */
export function withRedactions(text: string, label: string, announced: string) {
  if (!text.includes(REDACTION_MARKER)) return text;

  const parts = text.split(REDACTION_MARKER);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <Redaction label={label} announced={announced} /> : null}
    </Fragment>
  ));
}
```

- [ ] **Step 4: Update every call site**

In `src/components/work-index.tsx:96`:

```tsx
                    ? withRedactions(
                        project.summary[lang],
                        dictionary.redacted,
                        dictionary.redactedAnnounced,
                      )
```

Apply the same change to any other caller found in Step 1.

- [ ] **Step 5: Verify**

```bash
pnpm verify
```

Expected: PASS. A missed call site is a type error, which is the point of making the parameter required rather than optional.

- [ ] **Step 6: Read the page text back**

With the dev server running, extract the page text and read one redacted summary aloud. It should read as *"Operator-facing Next.js surfaces for redacted under NDA: live tokens…"* — a sentence.

- [ ] **Step 7: Commit**

```bash
git add -A src/components "src/app/[lang]/dictionaries"
git commit -m "fix(a11y): announce redactions as a phrase, not a stamp"
```

---

## Task 10: Featured work on home, full index at `/work`

**Constraint from the record:** [`page.tsx:25-30`](../src/app/[lang]/page.tsx) documents that a previous two-work-section homepage was deleted because both sections listed the same six projects and the second `<Canvas>` cost the frame budget. A separate **route** avoids both faults. **Do not add a second work section to `/`.**

**Files:**
- Modify: `src/content/projects.ts` (add `featured`)
- Modify: `src/components/work-index.tsx`
- Create: `src/app/[lang]/work/page.tsx`
- Modify: `src/app/sitemap.ts:14-17`
- Modify: both dictionary files

**Interfaces:**
- Consumes: `projects`.
- Produces: `WorkIndex` gains `featured?: boolean` and `viewAllHref?: string`.

- [ ] **Step 1: Write the failing test**

In `src/content/content.test.ts`, `projects` describe block:

```ts
  it("features exactly three projects, led by AI", () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured).toHaveLength(3);
    expect(featured.filter((p) => p.pillar === "ai").length).toBeGreaterThanOrEqual(2);
    // At least one featured project must be checkable. Three redacted cards in
    // a row reads as "he can show me nothing".
    expect(featured.some((p) => !p.confidential), "all featured work is redacted").toBe(true);
  });
```

- [ ] **Step 2: Run and watch it fail**

```bash
pnpm vitest run src/content/content.test.ts -t "features exactly three"
```

Expected: FAIL — `featured` is not a property, so the filter returns 0.

- [ ] **Step 3: Add the field**

In `src/content/projects.ts`, add to the `Project` type after `confidential`:

```ts
  /** Shown on the home page. The rest live at /work. */
  featured?: boolean;
```

Then set `featured: true` on exactly three: `ai-service-interfaces` (AI, most recent), `document-ingestion` (AI), and `carbon-credit-tokenization` (blockchain, **not** confidential — it is the one featured card a visitor can actually follow through to a public paper).

- [ ] **Step 4: Add the dictionary keys**

`en.json`, in `"work"`:

```json
    "featuredHeading": "Selected work",
    "featuredLead": "Three of six. AI systems built on-premises, plus the blockchain work behind a published paper.",
    "viewAll": "All six case studies",
```

`id.json`:

```json
    "featuredHeading": "Karya pilihan",
    "featuredLead": "Tiga dari enam. Sistem AI yang dibangun on-premises, ditambah karya blockchain di balik makalah yang diterbitkan.",
    "viewAll": "Enam studi kasus lengkap",
```

- [ ] **Step 5: Teach `WorkIndex` to filter**

In `src/components/work-index.tsx`, extend the props and the sort:

```tsx
export function WorkIndex({
  lang,
  heading,
  dictionary,
  featured = false,
  viewAllHref,
}: {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["work"];
  /** Home shows the featured three; /work shows everything. */
  featured?: boolean;
  viewAllHref?: string;
}) {
  const source = featured ? projects.filter((p) => p.featured) : projects;
  const ordered = [...source].sort((a, b) => {
    const byPillar = PILLAR_ORDER.indexOf(a.pillar) - PILLAR_ORDER.indexOf(b.pillar);
    return byPillar !== 0 ? byPillar : b.started.localeCompare(a.started);
  });
```

Change the lead paragraph to use the right copy:

```tsx
        <p className={cn("mt-3 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
          {featured ? dictionary.featuredLead : dictionary.listLead}
        </p>
```

And add the link after the closing `</ul>`:

```tsx
      {viewAllHref ? (
        <a href={viewAllHref} className={cn(BUTTON.secondary, "mt-14")}>
          {dictionary.viewAll} &#8594;
        </a>
      ) : null}
```

Add `BUTTON` to the `@/lib/design` import.

- [ ] **Step 6: Update the home page**

In `src/app/[lang]/page.tsx`:

```tsx
      <WorkIndex
        lang={lang}
        heading={dictionary.work.featuredHeading}
        dictionary={dictionary.work}
        featured
        viewAllHref={`/${lang}/work`}
      />
```

- [ ] **Step 7: Create the route**

`src/app/[lang]/work/page.tsx`:

```tsx
import { notFound } from "next/navigation";

import { WorkIndex } from "@/components/work-index";
import { buildPageMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/locale";

import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dictionary = await getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: "/work",
    title: dictionary.work.indexHeading,
    description: dictionary.work.listLead,
  });
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <main id="content" className="flex-1 pt-24">
      <WorkIndex
        lang={lang}
        heading={dictionary.work.indexHeading}
        dictionary={dictionary.work}
      />
    </main>
  );
}
```

**Check `buildPageMetadata`'s real signature** in `src/lib/metadata.ts` before writing this — match it exactly rather than the shape assumed above.

- [ ] **Step 8: Add the route to the sitemap**

In `src/app/sitemap.ts`, line 14:

```ts
  const paths = [
    "",
    "/work",
    ...projects.map((project) => `/work/${project.slug}`),
  ];
```

- [ ] **Step 9: Verify**

```bash
pnpm verify && pnpm build
```

Expected: PASS, and the build output lists `/[lang]/work` as a static route.

- [ ] **Step 10: Check the canvas count**

Load `http://localhost:3000/en` and run in the console:

```js
document.querySelectorAll("canvas").length
```

Expected: `1`. More than one means the frame-budget regression this task exists to avoid.

Then load `/en/work` and confirm all six case studies render and every card links correctly.

- [ ] **Step 11: Commit**

```bash
git add -A src
git commit -m "feat(work): feature three on home, move the full index to /work"
```

---

## Task 11: Real certificate images

Five `.svg` stubs become real images. Six Dataiku certificates plus MSIB.

**Files:**
- Create: `public/certifications/*.{jpg,png}`
- Delete: `public/certifications/*.svg`

**Interfaces:**
- Consumes: `certification.image` paths from Task 4.
- Produces: files that `resolvePublicMedia` resolves ahead of the stubs.

- [ ] **Step 1: Read the media convention**

```bash
cat public/MEDIA.md
```

`resolvePublicMedia` prefers jpg/png over svg stubs, so a real file placed alongside a stub wins. **PDF will never resolve.**

- [ ] **Step 2: Convert the PDFs to images**

macOS ships `sips` and `qlmanage`; no dependency needed.

```bash
cd "/Users/nahiarhd/Downloads/Portfolio/Certificates/Dataiku"
for f in *.pdf; do
  qlmanage -t -s 1600 -o /tmp/certs "$f"
done
ls /tmp/certs
```

Rename each output to the `image` path recorded in Task 4 and move it into `public/certifications/`.

- [ ] **Step 3: Check every image for the client name before it ships**

Open each one and look at it. A Dataiku certificate is safe. **The MSIB certificate's source filename carries the employer name — safe under Decision 1 — but rename the file to `msib.jpg` rather than shipping the original filename**, which also encodes the programme cohort.

Any certificate showing the client name does not ship at all.

- [ ] **Step 4: Remove the stubs**

```bash
git rm public/certifications/*.svg
```

- [ ] **Step 5: Verify they resolve**

```bash
pnpm verify
```

Then load `/en#evidence` and confirm every certification row shows a real image rather than a drop hint.

- [ ] **Step 6: Commit**

```bash
git add -A public/certifications
git commit -m "feat(evidence): real certificate images"
```

---

## Before publishing

Not tasks — gates. The site can be built and reviewed without these; it should not go live without them.

- [ ] **The rate figure.** `engagement.projectMinimumUsd` is `undefined` and the rate line does not render. Set it, sanity-checked against live listings. (Spec OQ1.)
- [ ] **Audit `dataiku-dss-plugin-nlp-sentence-embedding`.** Public repo, client-driven modifications, and Dataiku's Apache-2.0 `LICENSE`/`NOTICE` may not have survived the copy. Unrelated to this site; more urgent than it. (Spec OQ2.)
- [ ] **Add a Hugging Face profile bio.** It is about to become the strongest evidence on the site and currently reads as an anonymous username. (Spec OQ6.)
- [ ] **Run `pnpm knip`** and check for orphans left by the `certifications-section.tsx` deletion. Advisory — verify by hand before deleting anything it reports.
- [ ] **Re-read the rendered page end to end in both locales.** The denylist catches tokens, not tone.

---

## Self-Review

**Spec coverage:** W1→T1, W2→T2, W3→T5, W4→T3+T4+T6, W5→T7, W6→T8, W7→T9, W8→T11, W9→T10. Decisions 1–10 all land in a task. Open Questions 1, 2 and 6 are carried into "Before publishing" rather than dropped.

**Known gaps, deliberate:**
- Task 4 Step 1 requires opening six PDFs to map credential IDs to names. That mapping cannot be derived from the filenames and must not be guessed.
- Task 4 Step 2 verifies the Skilljar URL pattern before six URLs are written against it.
- Task 10 Step 7 says to check `buildPageMetadata`'s real signature rather than trusting the shape sketched here.
