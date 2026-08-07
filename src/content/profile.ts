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

/**
 * `issued`, `credentialId` and `verifyUrl` are deliberately absent: they are
 * facts Raihan has not published here yet, and inventing them would be worse
 * than omitting them. Every field is optional — fill them in as they arrive.
 */
export const certifications: readonly Certification[] = [
  {
    name: "Dataiku Generative AI Practitioner",
    issuer: "Dataiku",
    image: "/certifications/dataiku-generative-ai-practitioner",
  },
  {
    name: "Dataiku ML Practitioner",
    issuer: "Dataiku",
    image: "/certifications/dataiku-ml-practitioner",
  },
  {
    name: "Dataiku Advanced Designer",
    issuer: "Dataiku",
    image: "/certifications/dataiku-advanced-designer",
  },
  {
    name: "Dataiku Developer",
    issuer: "Dataiku",
    image: "/certifications/dataiku-developer",
  },
  {
    name: "Sertifikat MSIB",
    issuer: "Kampus Merdeka",
    image: "/certifications/msib",
  },
];
