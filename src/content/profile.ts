import type { Localized } from "@/lib/locale";

/**
 * Facts about Raihan, sourced from his own public LinkedIn profile.
 *
 * Nothing here may name a current employer's products or clients — see
 * AGENTS.md § Confidentiality. Past roles he has already published himself are
 * fine; inventing a detail he has not published is not.
 */

/**
 * A photo under `/public`. `MediaFrame` probes the path at runtime, so a missing
 * file degrades to a skeleton rather than a broken image.
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
   * Scan under `/public/certifications/`. Export as JPG or PNG: `MediaFrame`
   * probes with an `<img>`, so a PDF will never load.
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
    en: "Developer working across web, blockchain, and data. I build AI agent pipelines, media processing, and the interfaces on top of them, and I care as much about how a thing is presented as about whether it runs.",
    id: "Developer yang bekerja di web, blockchain, dan data. Saya membangun pipeline AI agent, pemrosesan media, dan antarmuka di atasnya — dan saya peduli pada bagaimana sesuatu disajikan, bukan hanya apakah ia berjalan.",
  },
  email: "raihanhd.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/raihanhd/",
  portrait: {
    src: "/portrait.svg",
    alt: {
      en: "Raihan Hidayatullah Djunaedi",
      id: "Raihan Hidayatullah Djunaedi",
    },
  },
} as const;

export const experience: readonly Experience[] = [
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
    organization: "ADS Digital Partner (PT. Adma Digital Solusi)",
    role: { en: "Web Developer", id: "Web Developer" },
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
      src: "/about/ads-team.svg",
      alt: {
        en: "The ADS Digital Partner team in Surabaya, 2023",
        id: "Tim ADS Digital Partner di Surabaya, 2023",
      },
    },
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
    image: "/certifications/dataiku-generative-ai-practitioner.svg",
  },
  {
    name: "Dataiku ML Practitioner",
    issuer: "Dataiku",
    image: "/certifications/dataiku-ml-practitioner.svg",
  },
  {
    name: "Dataiku Advanced Designer",
    issuer: "Dataiku",
    image: "/certifications/dataiku-advanced-designer.svg",
  },
  {
    name: "Dataiku Developer",
    issuer: "Dataiku",
    image: "/certifications/dataiku-developer.svg",
  },
  {
    name: "Sertifikat MSIB",
    issuer: "Kampus Merdeka",
    image: "/certifications/msib.svg",
  },
];
