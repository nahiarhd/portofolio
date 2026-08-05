# Media drop-in guide

Content uses **logical paths** (no required extension). The site resolves the
first file that exists under `public/`, in this order:

`jpg → jpeg → png → webp → avif → svg`

SVG stubs ship so the UI is never empty. Drop a real photo with the same base
name and it **wins automatically** — no content edit required.

## Paths

| Slot | Drop (example) |
| --- | --- |
| Portrait | `public/portrait.jpg` |
| About photo | `public/about/ads-team.jpg` |
| Project cover | `public/work/<slug>/cover.jpg` |
| Project frames | `public/work/<slug>/01.jpg`, `02.jpg` |
| Certifications | `public/certifications/<id>.jpg` |

Project slugs:

- `agent-orchestration`
- `media-processing`
- `document-ingestion`
- `ai-service-interfaces`
- `carbon-credit-tokenization`
- `social-media-analytics`

## Confidential work

Never drop real employer product UI into AI project folders. Use abstract
diagrams or leave the SVG stub. See `AGENTS.md` § Confidentiality.

## After dropping files

Restart `pnpm dev` (or rebuild) so `resolvePublicMedia` re-scans the disk.
