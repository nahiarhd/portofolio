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
};

export const projects: readonly Project[] = [
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
      en: "Analysts could surface findings in the platform, but closing the loop still meant copying outputs into other systems by hand — tickets, exports, follow-up tools. Each hop added delay and dropped context. The work needed agents that could call approved tools inside the same on-premises boundary, with retries and clear failure modes when a tool refused or timed out.",
      id: "Analis bisa menampilkan temuan di platform, tetapi menutup putaran kerja masih berarti menyalin keluaran ke sistem lain secara manual — tiket, ekspor, alat lanjutan. Setiap lompatan menambah jeda dan menghilangkan konteks. Yang dibutuhkan adalah agen yang memanggil tool yang disetujui di dalam batasan on-premises yang sama, dengan retry dan mode gagal yang jelas ketika tool menolak atau timeout.",
    },
    role: {
      en: "Designed and implemented the tool-calling loop: how tools are registered and described to the model, how arguments are validated before execution, how partial failures retry without double-applying side effects, and how run state is surfaced so an operator can see what the agent attempted. Owned the orchestration path end to end on the client network — not the model weights, not the product brand.",
      id: "Merancang dan mengimplementasikan loop tool-calling: cara tool didaftarkan dan dijelaskan ke model, validasi argumen sebelum eksekusi, retry pada kegagalan parsial tanpa menerapkan side effect dua kali, dan menampilkan state run agar operator melihat apa yang dicoba agen. Mengelola jalur orkestrasi ujung ke ujung di jaringan klien — bukan bobot model, bukan merek produk.",
    },
    outcome: {
      en: "Analysis results can trigger tool-backed actions without leaving the premises. Operators get a single trail of prompts, tool calls, and errors instead of a pile of screenshots. The capability that did not exist before is closed-loop agency under air-gapped constraints — the same pattern this portfolio's own chat uses to show project cards.",
      id: "Hasil analisis dapat memicu tindakan berbasis tool tanpa meninggalkan premis. Operator mendapat satu jejak prompt, pemanggilan tool, dan error — bukan tumpukan tangkapan layar. Kemampuan yang sebelumnya tidak ada adalah agensi closed-loop di bawah batasan air-gapped — pola yang sama yang dipakai chat portofolio ini untuk menampilkan kartu proyek.",
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
      en: "Hours of audio and video arrived faster than people could listen. Manual note-taking did not scale, and raw speech-to-text alone left analysts with walls of text — no chaptering, no speaker-aware structure, no summary they could hand to a decision-maker. The bottleneck was the path from recording to something readable under time pressure.",
      id: "Jam audio dan video datang lebih cepat daripada yang bisa didengarkan orang. Catatan manual tidak skalabel, dan speech-to-text mentah saja meninggalkan analis dengan dinding teks — tanpa chaptering, tanpa struktur per pembicara, tanpa ringkasan yang bisa diserahkan ke pengambil keputusan. Hambatannya adalah jalur dari rekaman ke sesuatu yang terbaca di bawah tekanan waktu.",
    },
    role: {
      en: "Built the processing pipeline: ingest of media files, speech-to-text stages, LLM summarization and structuring, and hand-off of artifacts into the same operator-facing services. Cared about failure isolation — a bad file must not stall the queue — and about keeping intermediate artifacts inspectable when a summary looked wrong.",
      id: "Membangun pipeline pemrosesan: ingest file media, tahap speech-to-text, ringkasan dan penstrukturan LLM, serta penyerahan artefak ke layanan yang dihadapi operator. Memperhatikan isolasi kegagalan — file rusak tidak boleh menahan antrean — dan agar artefak antara bisa diperiksa ketika ringkasan tampak salah.",
    },
    outcome: {
      en: "Recordings become transcripts and structured summaries without a full manual listen. Analysts start from a document they can skim and query, not from a raw file. Throughput is bounded by compute queue depth rather than calendar time with headphones on.",
      id: "Rekaman menjadi transkrip dan ringkasan terstruktur tanpa mendengarkan penuh secara manual. Analis mulai dari dokumen yang bisa dipindai dan ditanyakan, bukan dari file mentah. Throughput dibatasi kedalaman antrean komputasi, bukan waktu kalender dengan headphone.",
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
      en: "Important material lived in scans and mixed layouts — tables, stamps, multi-column pages — where plain OCR produced noisy text without structure. Search failed on the fields people actually needed, and natural-language questions over a document set were impossible until layout and fields were recovered, not just characters.",
      id: "Materi penting ada di pindaian dan tata letak campuran — tabel, stempel, halaman multi-kolom — di mana OCR polos menghasilkan teks berisik tanpa struktur. Pencarian gagal pada field yang benar-benar dibutuhkan, dan pertanyaan bahasa alami atas kumpulan dokumen mustahil sampai tata letak dan field dipulihkan, bukan hanya karakter.",
    },
    role: {
      en: "Owned the ingestion path: PaddleOCR-based extraction, document parsing into structured chunks, quality checks when confidence dropped, and wiring so indexed text could answer natural-language queries. Chose models and post-processing for the document types in play, and made failures visible instead of silent empty results.",
      id: "Mengelola jalur ingesti: ekstraksi berbasis PaddleOCR, parsing dokumen menjadi chunk terstruktur, pemeriksaan kualitas saat confidence turun, dan wiring agar teks terindeks dapat menjawab kueri bahasa alami. Memilih model dan post-processing untuk jenis dokumen yang ada, dan membuat kegagalan terlihat — bukan hasil kosong yang diam.",
    },
    outcome: {
      en: "Scanned corpora become searchable and askable without retyping. Operators query content that used to live only as images. OCR alone is not the product — structure and retrieval are.",
      id: "Korpus pindaian menjadi dapat dicari dan ditanyakan tanpa mengetik ulang. Operator mengkueri konten yang dulu hanya hidup sebagai gambar. OCR saja bukan produknya — struktur dan retrieval-lah yang penting.",
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
      en: "Backend AI jobs run for seconds to minutes. A naive page either blocked, timed out, or dumped opaque JSON. Analysts needed streaming tokens where that fit, progress for long jobs, and result views that stayed scannable when payloads grew — without losing the thread when a connection dropped mid-run.",
      id: "Pekerjaan AI di backend berjalan hitungan detik hingga menit. Halaman naif memblokir, timeout, atau menumpahkan JSON yang buram. Analis membutuhkan token streaming di tempat yang cocok, progress untuk pekerjaan panjang, dan tampilan hasil yang tetap bisa dipindai saat payload membesar — tanpa kehilangan jejak ketika koneksi putus di tengah jalan.",
    },
    role: {
      en: "Built the Next.js / React interfaces: streaming response UI, job status for long-running work, error and empty states that name the failure, and layouts that keep large result sets readable. Connected front end to the service contracts the pipelines already exposed — TypeScript end to end on the client.",
      id: "Membangun antarmuka Next.js / React: UI respons streaming, status pekerjaan untuk kerja panjang, state error dan kosong yang menyebut kegagalannya, serta layout yang menjaga kumpulan hasil besar tetap terbaca. Menghubungkan front end ke kontrak layanan yang sudah diekspos pipeline — TypeScript ujung ke ujung di klien.",
    },
    outcome: {
      en: "People using the services see progress and partial results instead of a spinner that lies. Long jobs are operable from the browser. The same discipline — stream when you can, state when you must — is what this portfolio chat applies to its own tool cards.",
      id: "Pengguna layanan melihat progress dan hasil parsial, bukan spinner yang berbohong. Pekerjaan panjang bisa dioperasikan dari browser. Disiplin yang sama — stream bila bisa, state bila harus — diterapkan chat portofolio ini pada kartu tool-nya sendiri.",
    },
    stack: ["Next.js", "React", "TypeScript", "streaming"],
    confidential: true,
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
