import type { Localized } from "@/lib/locale";

/**
 * Facts about Raihan, sourced from his own public LinkedIn profile.
 *
 * Nothing here may name a current employer's products or clients — see
 * AGENTS.md § Confidentiality. Past roles he has already published himself are
 * fine; inventing a detail he has not published is not.
 */

/**
 * Logical path under `/public` (extension optional). Resolved via
 * `resolvePublicMedia` — jpg/png win over svg stubs. See public/MEDIA.md.
 */
type Photo = {
  src: string;
  alt: Localized;
};

export type Experience = {
  organization: string;
  role: Localized;
  /** ISO month, e.g. "2024-08". Rendered per locale at display time. */
  start: string;
  /** Absent means current. */
  end?: string;
  location: string;
  highlights: Localized[];
  /** Optional team or on-site photo, shown beside the entry. */
  photo?: Photo;
};

export type Education = {
  institution: string;
  degree: Localized;
  start: string;
  end: string;
};

export type Certification = {
  name: string;
  issuer: string;
  /** ISO month, e.g. "2024-06". Omit until the real date is to hand. */
  issued?: string;
  /** The issuer's public verification page — the part a client can check. */
  verifyUrl?: string;
  /** Credential ID exactly as printed on the certificate. */
  credentialId?: string;
  /**
   * Logical path under `/public/certifications/` (no extension required).
   * PDF will never resolve — use JPG or PNG.
   */
  image?: string;
};

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

export const profile = {
  name: "Raihan Hidayatullah Djunaedi",
  tagline: {
    en: "Developer by Passion, Data by Precision",
    id: "Developer by Passion, Data by Precision",
  },
  location: {
    en: "Bekasi, West Java, Indonesia",
    id: "Bekasi, Jawa Barat, Indonesia",
  },
  bio: {
    en: "AI lead engineer. I build agent pipelines, document and media processing, and the operator-facing interfaces on top of them — mostly on-premises, behind client firewalls. Earlier work in blockchain and data still shows up in how I think about systems.",
    id: "AI lead engineer. Saya membangun pipeline agent, pemrosesan dokumen dan media, serta antarmuka operator di atasnya — sebagian besar on-premises, di balik firewall klien. Pengalaman awal di blockchain dan data masih membentuk cara saya memandang sistem.",
  },
  email: "raihanhd.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/raihanhd/",
  portrait: {
    /** Formal plate photo for Subject chapter (prefer rectangular, not cutout). */
    src: "/portrait",
    alt: {
      en: "Raihan Hidayatullah Djunaedi",
      id: "Raihan Hidayatullah Djunaedi",
    },
  },
} as const;

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

export const education: readonly Education[] = [
  {
    institution: "Politeknik Negeri Malang",
    degree: {
      en: "Bachelor's degree, Information Technology",
      id: "Sarjana Terapan, Teknologi Informasi",
    },
    start: "2020-02",
    end: "2024-08",
  },
];

export const certifications: readonly Certification[] = [
  {
    name: "MLOps Practitioner Certificate",
    issuer: "Dataiku",
    issued: "2025-01",
    credentialId: "rriyymrx88zz",
    verifyUrl: "https://verify.skilljar.com/c/rriyymrx88zz",
    image: "/certifications/dataiku-mlops-practitioner",
  },
  {
    name: "Developer Certificate",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "7pj8jh3ruaue",
    verifyUrl: "https://verify.skilljar.com/c/7pj8jh3ruaue",
    image: "/certifications/dataiku-developer",
  },
  {
    name: "Generative AI Practitioner Certificate",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "tuj5pxkizvjo",
    verifyUrl: "https://verify.skilljar.com/c/tuj5pxkizvjo",
    image: "/certifications/dataiku-generative-ai-practitioner",
  },
  {
    name: "ML Practitioner Certificate",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "bwqycmmtuced",
    verifyUrl: "https://verify.skilljar.com/c/bwqycmmtuced",
    image: "/certifications/dataiku-ml-practitioner",
  },
  {
    name: "Advanced Designer Certificate",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "v439v63i2daa",
    verifyUrl: "https://verify.skilljar.com/c/v439v63i2daa",
    image: "/certifications/dataiku-advanced-designer",
  },
  {
    name: "Core Designer Certificate",
    issuer: "Dataiku",
    issued: "2024-12",
    credentialId: "6uqybt6jajtr",
    verifyUrl: "https://verify.skilljar.com/c/6uqybt6jajtr",
    image: "/certifications/dataiku-core-designer",
  },
  {
    name: "Sertifikat MSIB",
    issuer: "Kampus Merdeka",
    issued: "2023-12",
    image: "/certifications/msib",
  },
];

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
