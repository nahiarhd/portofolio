import type { Localized } from "@/lib/locale";

/**
 * The single source of truth for work, consumed twice: by the rendered pages
 * and by the chat's `showProject` tool. One source means the bot cannot invent
 * a project or describe one differently from its own page.
 *
 * CONFIDENTIALITY: no employer, product, client, or internal module name may
 * appear in any string here. Confidential work is described by what was built,
 * never by who it was for. `content.test.ts` enforces this — never weaken it to
 * make content pass. See AGENTS.md § Confidentiality.
 */

type Pillar = "ai" | "blockchain" | "data";

export type Project = {
  slug: string;
  pillar: Pillar;
  /** ISO month the work started, for ordering. */
  started: string;
  title: Localized;
  /** One line, used on the index and by the chat. */
  summary: Localized;
  /** What was wrong before this existed. */
  problem: Localized;
  /** What Raihan personally did — not what the team did. */
  role: Localized;
  /** What changed as a result. A case study without one is not finished. */
  outcome: Localized;
  stack: readonly string[];
  /** Confidential work has neither. Enforced by test. */
  links?: { repo?: string; live?: string };
  confidential: boolean;
};

export const projects: readonly Project[] = [
  // ---------------------------------------------------------------------
  // DRAFT — written from folder names and public product surface only.
  // Raihan must replace every string below with what he actually built.
  // Placeholder prose is worse than no project: it reads as vague, which is
  // the exact failure mode docs/spec.md § Confidentiality warns about.
  // ---------------------------------------------------------------------
  {
    slug: "agent-orchestration",
    pillar: "ai",
    started: "2025-01",
    title: {
      en: "Agent orchestration for an intelligence platform",
      id: "Orkestrasi agen untuk platform intelligence",
    },
    summary: {
      en: "Tool-calling agents that turn analysis results into actions, on infrastructure that never leaves the client's network.",
      id: "Agen tool-calling yang mengubah hasil analisis menjadi tindakan, di infrastruktur yang tidak pernah keluar dari jaringan klien.",
    },
    problem: {
      en: "DRAFT — describe what was broken before. What did analysts do by hand?",
      id: "DRAFT — jelaskan apa yang bermasalah sebelumnya. Apa yang dikerjakan analis secara manual?",
    },
    role: {
      en: "DRAFT — what did you personally build? Planner, tool registry, retries, evaluation?",
      id: "DRAFT — apa yang kamu bangun sendiri? Planner, tool registry, retry, evaluasi?",
    },
    outcome: {
      en: "DRAFT — what changed? A number if you have one; otherwise a concrete capability that did not exist before.",
      id: "DRAFT — apa yang berubah? Sebuah angka jika ada; jika tidak, kemampuan konkret yang sebelumnya tidak ada.",
    },
    stack: ["Python", "LLM tool calling", "on-premises deployment"],
    confidential: true,
  },
  {
    slug: "media-processing",
    pillar: "ai",
    started: "2025-01",
    title: {
      en: "Audio and video processing pipeline",
      id: "Pipeline pemrosesan audio dan video",
    },
    summary: {
      en: "Turning recordings into transcripts, summaries, and structured outputs analysts can act on.",
      id: "Mengubah rekaman menjadi transkrip, ringkasan, dan keluaran terstruktur yang dapat ditindaklanjuti analis.",
    },
    problem: {
      en: "DRAFT — what was the bottleneck? Manual transcription? Volume?",
      id: "DRAFT — apa hambatannya? Transkripsi manual? Volume?",
    },
    role: {
      en: "DRAFT — which parts were yours?",
      id: "DRAFT — bagian mana yang kamu kerjakan?",
    },
    outcome: {
      en: "DRAFT — throughput, latency, or a capability gained.",
      id: "DRAFT — throughput, latensi, atau kemampuan yang diperoleh.",
    },
    stack: ["Python", "speech-to-text", "LLM summarization"],
    confidential: true,
  },
  {
    slug: "document-ingestion",
    pillar: "ai",
    started: "2025-01",
    title: {
      en: "Document ingestion and OCR",
      id: "Ingesti dokumen dan OCR",
    },
    summary: {
      en: "Extracting structure from scanned documents so they can be indexed and queried in natural language.",
      id: "Mengekstrak struktur dari dokumen hasil pindaian agar dapat diindeks dan ditanyakan dalam bahasa alami.",
    },
    problem: {
      en: "DRAFT — what kind of documents, and why was OCR alone not enough?",
      id: "DRAFT — dokumen jenis apa, dan mengapa OCR saja tidak cukup?",
    },
    role: {
      en: "DRAFT — pipeline, model selection, evaluation?",
      id: "DRAFT — pipeline, pemilihan model, evaluasi?",
    },
    outcome: {
      en: "DRAFT — accuracy, volume, or time saved.",
      id: "DRAFT — akurasi, volume, atau waktu yang dihemat.",
    },
    stack: ["Python", "PaddleOCR", "document parsing"],
    confidential: true,
  },
  {
    slug: "ai-service-interfaces",
    pillar: "ai",
    started: "2025-01",
    title: {
      en: "Interfaces for AI services",
      id: "Antarmuka untuk layanan AI",
    },
    summary: {
      en: "The front end analysts actually use: streaming responses, long-running jobs, and results that stay readable under load.",
      id: "Front end yang benar-benar dipakai analis: respons streaming, pekerjaan berjalan lama, dan hasil yang tetap terbaca saat beban tinggi.",
    },
    problem: {
      en: "DRAFT — what made these interfaces hard? Streaming? State? Volume of results?",
      id: "DRAFT — apa yang membuat antarmuka ini sulit? Streaming? State? Volume hasil?",
    },
    role: {
      en: "DRAFT — which screens and which problems were yours?",
      id: "DRAFT — layar mana dan masalah mana yang kamu tangani?",
    },
    outcome: {
      en: "DRAFT — what got better for the people using it?",
      id: "DRAFT — apa yang menjadi lebih baik bagi penggunanya?",
    },
    stack: ["Next.js", "React", "TypeScript", "streaming"],
    confidential: true,
  },

  // ---------------------------------------------------------------------
  // Below this line: sourced from Raihan's own public LinkedIn. Not drafts.
  // ---------------------------------------------------------------------
  {
    slug: "carbon-credit-tokenization",
    pillar: "blockchain",
    started: "2024-08",
    title: {
      en: "Carbon credit tokenization on a permissioned chain",
      id: "Tokenisasi kredit karbon di blockchain berizin",
    },
    summary: {
      en: "An ERC-20 token representing carbon credits, on a private Hyperledger Besu network, built alongside five students I mentored.",
      id: "Token ERC-20 yang merepresentasikan kredit karbon, di jaringan privat Hyperledger Besu, dibangun bersama lima mahasiswa yang saya bimbing.",
    },
    problem: {
      en: "Carbon credits are traded on trust in a registry. Making each credit a token on a permissioned chain gives every transfer an auditable history without exposing participants on a public network.",
      id: "Kredit karbon diperdagangkan atas dasar kepercayaan pada registri. Menjadikan setiap kredit sebagai token di blockchain berizin memberi setiap transfer riwayat yang dapat diaudit, tanpa mengekspos peserta di jaringan publik.",
    },
    role: {
      en: "Set up the Hyperledger Besu network, taught Solidity and smart contract practice, guided the ERC-20 implementation, and supported project management for a cooperative system integration.",
      id: "Menyiapkan jaringan Hyperledger Besu, mengajarkan Solidity dan praktik smart contract, memandu implementasi ERC-20, serta mendukung manajemen proyek untuk integrasi sistem koperasi.",
    },
    outcome: {
      en: "Five students shipped working smart contracts on a running permissioned network, and could explain the design trade-offs behind them — the point of the mentorship, not the token itself.",
      id: "Lima mahasiswa berhasil merilis smart contract yang berjalan di jaringan berizin, dan mampu menjelaskan trade-off desainnya — itulah inti mentorship ini, bukan tokennya.",
    },
    stack: ["Solidity", "Hyperledger Besu", "ERC-20"],
    confidential: false,
  },
  {
    slug: "social-media-analytics",
    pillar: "data",
    started: "2023-08",
    title: {
      en: "Social media analytics website",
      id: "Situs analitik media sosial",
    },
    summary: {
      en: "A dashboard turning social media activity into readable reporting, built end to end during an internship.",
      id: "Dasbor yang mengubah aktivitas media sosial menjadi laporan yang mudah dibaca, dibangun menyeluruh selama magang.",
    },
    problem: {
      en: "Social performance was reported by hand from several platforms, which was slow and inconsistent between people preparing it.",
      id: "Performa media sosial dilaporkan secara manual dari beberapa platform — lambat dan tidak konsisten antar orang yang menyiapkannya.",
    },
    role: {
      en: "Built the interface and connected it to the backend services, covering both sides of the integration.",
      id: "Membangun antarmuka dan menghubungkannya ke layanan backend, mencakup kedua sisi integrasi.",
    },
    outcome: {
      en: "Reporting moved from manual collation to a single dashboard — my first project taking a product from views to working integration.",
      id: "Pelaporan berpindah dari penggabungan manual ke satu dasbor — proyek pertama saya membawa produk dari tampilan hingga integrasi yang berjalan.",
    },
    stack: ["Bootstrap", "JavaScript", "REST integration"],
    confidential: false,
  },
];
