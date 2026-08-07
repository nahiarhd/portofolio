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
 *
 * AI case studies are NDA-safe architecture narratives. Replace qualitative
 * outcomes with measured numbers when you can publish them — never invent a
 * figure to make a page look finished.
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
  /** Shown on the home page. The rest live at /work. */
  featured?: boolean;
  /**
   * Optional media under `/public`. Logical path without required extension
   * (e.g. `/work/agent-orchestration/cover`). `resolvePublicMedia` prefers
   * jpg/png/webp over svg stubs — see `public/MEDIA.md`.
   * Confidential work: never drop real employer product UI.
   */
  coverImage?: string;
  /** Extra case-study frames; same path rules as `coverImage`. */
  screenshots?: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "agent-orchestration",
    pillar: "ai",
    started: "2025-01",
    title: {
      en: "Closed-loop agents behind the firewall",
      id: "Agen closed-loop di balik firewall",
    },
    summary: {
      en: "Tool-calling agents that act on analysis findings for {{redacted}} without data leaving the premises.",
      id: "Agen tool-calling yang menindaklanjuti temuan analisis untuk {{redacted}} tanpa data keluar dari premis.",
    },
    problem: {
      en: "Findings showed up in the platform, but the next step still meant hand-copying into tickets, exports, and other tools. Context died at each hop. The missing piece was agents that call only approved tools inside the same on-premises boundary, with retries and explicit failure when a tool refuses or times out.",
      id: "Temuan muncul di platform, tetapi langkah berikutnya masih menyalin manual ke tiket, ekspor, dan tool lain. Konteks hilang di setiap lompatan. Yang hilang: agen yang hanya memanggil tool disetujui di batasan on-premises yang sama, dengan retry dan kegagalan eksplisit saat tool menolak atau timeout.",
    },
    role: {
      en: "Designed the tool-calling loop: registration and model-facing descriptions, argument validation before execute, partial-failure retries without double side effects, and run state an operator can audit. Owned orchestration on the client network - not weights, not branding.",
      id: "Merancang loop tool-calling: registrasi dan deskripsi untuk model, validasi argumen sebelum eksekusi, retry gagal parsial tanpa side effect ganda, dan state run yang bisa diaudit operator. Orkestrasi di jaringan klien - bukan bobot model, bukan merek.",
    },
    outcome: {
      en: "Findings can trigger tool-backed actions without leaving the network. Operators get one trail of prompts, calls, and errors. Closed-loop agency under air-gapped constraints - the same pattern this site's chat uses for project cards.",
      id: "Temuan dapat memicu aksi berbasis tool tanpa keluar jaringan. Operator mendapat satu jejak prompt, pemanggilan, dan error. Agensi closed-loop di batasan air-gapped - pola yang sama dipakai chat situs ini untuk kartu proyek.",
    },
    stack: ["Python", "LLM tool calling", "on-premises deployment"],
    coverImage: "/work/agent-orchestration/cover",
    screenshots: [
      "/work/agent-orchestration/01",
      "/work/agent-orchestration/02",
    ],
    confidential: true,
  },
  {
    slug: "media-processing",
    pillar: "ai",
    started: "2025-02",
    title: {
      en: "From recording to structured brief",
      id: "Dari rekaman ke brief terstruktur",
    },
    summary: {
      en: "A media queue for {{redacted}} that turns long audio and video into transcripts and skimmable briefs.",
      id: "Antrean media untuk {{redacted}} yang mengubah audio dan video panjang menjadi transkrip dan brief yang bisa dipindai.",
    },
    problem: {
      en: "Media arrived faster than anyone could listen. Speech-to-text alone dumped walls of text - no chapters, weak speaker structure, nothing a decision-maker could skim. The bottleneck was the path from file to a brief under time pressure.",
      id: "Media datang lebih cepat daripada yang bisa didengar. Speech-to-text saja menghasilkan dinding teks - tanpa bab, struktur pembicara lemah, tidak ada yang bisa dipindai pengambil keputusan. Hambatannya jalur dari file ke brief di bawah tekanan waktu.",
    },
    role: {
      en: "Built ingest, speech-to-text stages, LLM summary and structuring, and hand-off into operator services. Isolated bad files so one corrupt upload cannot stall the queue, and kept intermediate artifacts inspectable when a summary looked wrong.",
      id: "Membangun ingest, tahap speech-to-text, ringkasan dan penstrukturan LLM, serta serah terima ke layanan operator. Mengisolasi file rusak agar satu unggahan korup tidak menahan antrean, dan menjaga artefak antara bisa diperiksa saat ringkasan tampak salah.",
    },
    outcome: {
      en: "Recordings become transcripts and structured briefs without a full manual listen. Analysts start from a document, not a raw file. Throughput follows queue depth, not calendar time with headphones on.",
      id: "Rekaman menjadi transkrip dan brief terstruktur tanpa dengar penuh manual. Analis mulai dari dokumen, bukan file mentah. Throughput mengikuti kedalaman antrean, bukan waktu kalender dengan headphone.",
    },
    stack: ["Python", "speech-to-text", "LLM summarization"],
    coverImage: "/work/media-processing/cover",
    screenshots: [
      "/work/media-processing/01",
      "/work/media-processing/02",
    ],
    confidential: true,
  },
  {
    slug: "document-ingestion",
    pillar: "ai",
    started: "2025-03",
    title: {
      en: "Scan-to-structure document retrieval",
      id: "Retrieval dokumen dari pindaian ke struktur",
    },
    summary: {
      en: "OCR plus layout recovery so scans from {{redacted}} become searchable and answerable in natural language.",
      id: "OCR plus pemulihan tata letak agar pindaian dari {{redacted}} bisa dicari dan dijawab dalam bahasa alami.",
    },
    problem: {
      en: "Critical material lived in scans - tables, stamps, multi-column pages - where plain OCR produced noisy characters without fields. Keyword search missed what people needed, and natural-language questions over a corpus were impossible until layout and fields were recovered.",
      id: "Materi kritis ada di pindaian - tabel, stempel, multi-kolom - di mana OCR polos menghasilkan karakter berisik tanpa field. Pencarian kata kunci meleset, dan pertanyaan bahasa alami atas korpus mustahil sampai tata letak dan field dipulihkan.",
    },
    role: {
      en: "Owned PaddleOCR extraction, parsing into structured chunks, confidence gates, and wiring so indexed text can answer natural-language queries. Tuned models and post-processing to the document types in play, and surfaced empty or low-confidence results instead of silent blanks.",
      id: "Mengelola ekstraksi PaddleOCR, parsing ke chunk terstruktur, gerbang confidence, dan wiring agar teks terindeks menjawab kueri bahasa alami. Menyelaraskan model dan post-processing ke jenis dokumen yang ada, dan menampilkan hasil kosong atau confidence rendah - bukan blank diam.",
    },
    outcome: {
      en: "Scanned corpora become searchable and askable without retyping. Operators query content that used to exist only as images. The product is structure and retrieval - not OCR as a checkbox.",
      id: "Korpus pindaian bisa dicari dan ditanyakan tanpa mengetik ulang. Operator mengkueri konten yang dulu hanya gambar. Produknya struktur dan retrieval - bukan OCR sebagai centang.",
    },
    stack: ["Python", "PaddleOCR", "document parsing"],
    coverImage: "/work/document-ingestion/cover",
    screenshots: [
      "/work/document-ingestion/01",
      "/work/document-ingestion/02",
    ],
    confidential: true,
    featured: true,
  },
  {
    slug: "ai-service-interfaces",
    pillar: "ai",
    started: "2025-04",
    title: {
      en: "Streaming UIs for long AI jobs",
      id: "UI streaming untuk pekerjaan AI panjang",
    },
    summary: {
      en: "Operator-facing Next.js surfaces for {{redacted}}: live tokens, job progress, and results that stay readable under load.",
      id: "Permukaan Next.js untuk operator di {{redacted}}: token langsung, progress pekerjaan, dan hasil yang tetap terbaca di beban tinggi.",
    },
    problem: {
      en: "Backend AI work runs for seconds to minutes. A naive page blocked, timed out, or dumped opaque JSON. Operators needed streaming where it fit, honest progress for long jobs, and layouts that stay scannable when payloads grow - including after a mid-run disconnect.",
      id: "Pekerjaan AI backend berjalan detik hingga menit. Halaman naif memblokir, timeout, atau menumpahkan JSON buram. Operator butuh streaming di tempat yang cocok, progress jujur untuk kerja panjang, dan layout yang tetap bisa dipindai saat payload membesar - termasuk setelah putus di tengah jalan.",
    },
    role: {
      en: "Built the React client: streaming response UI, job status for long runs, error and empty states that name the failure, and layouts for large result sets. Wired front end to existing service contracts in TypeScript end to end.",
      id: "Membangun klien React: UI respons streaming, status pekerjaan panjang, state error dan kosong yang menyebut kegagalan, serta layout untuk kumpulan hasil besar. Menghubungkan front end ke kontrak layanan yang sudah ada - TypeScript ujung ke ujung.",
    },
    outcome: {
      en: "Operators see partial results and real status instead of a lying spinner. Long jobs are operable from the browser. Stream when you can, explicit state when you must - the same rule this portfolio chat uses for tool cards.",
      id: "Operator melihat hasil parsial dan status nyata, bukan spinner yang berbohong. Pekerjaan panjang bisa dioperasikan dari browser. Stream bila bisa, state eksplisit bila harus - aturan yang sama dipakai chat portofolio ini untuk kartu tool.",
    },
    stack: ["Next.js", "React", "TypeScript", "streaming"],
    coverImage: "/work/ai-service-interfaces/cover",
    screenshots: [
      "/work/ai-service-interfaces/01",
      "/work/ai-service-interfaces/02",
    ],
    confidential: true,
    featured: true,
  },

  // ---------------------------------------------------------------------
  // Public work — sourced from Raihan's own LinkedIn and public history.
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
      en: "Five students shipped working smart contracts on a running permissioned network, and could explain the design trade-offs behind them - the point of the mentorship, not the token itself.",
      id: "Lima mahasiswa berhasil merilis smart contract yang berjalan di jaringan berizin, dan mampu menjelaskan trade-off desainnya - itulah inti mentorship ini, bukan tokennya.",
    },
    stack: ["Solidity", "Hyperledger Besu", "ERC-20"],
    coverImage: "/work/carbon-credit-tokenization/cover",
    screenshots: [
      "/work/carbon-credit-tokenization/01",
      "/work/carbon-credit-tokenization/02",
    ],
    confidential: false,
    featured: true,
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
      id: "Performa media sosial dilaporkan secara manual dari beberapa platform - lambat dan tidak konsisten antar orang yang menyiapkannya.",
    },
    role: {
      en: "Built the interface and connected it to the backend services, covering both sides of the integration.",
      id: "Membangun antarmuka dan menghubungkannya ke layanan backend, mencakup kedua sisi integrasi.",
    },
    outcome: {
      en: "Reporting moved from manual collation to a single dashboard - my first project taking a product from views to working integration.",
      id: "Pelaporan berpindah dari penggabungan manual ke satu dasbor - proyek pertama saya membawa produk dari tampilan hingga integrasi yang berjalan.",
    },
    stack: ["Bootstrap", "JavaScript", "REST integration"],
    coverImage: "/work/social-media-analytics/cover",
    screenshots: [
      "/work/social-media-analytics/01",
      "/work/social-media-analytics/02",
    ],
    confidential: false,
  },
];
