"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Education, Experience } from "@/content/profile";
import { formatMonth, formatRange } from "@/lib/format";
import type { Locale } from "@/lib/locale";

import { MediaFrame } from "./media-frame";
import { BorderBeam } from "./ui/border-beam";
import { LinkPreview } from "./ui/link-preview";
import { MagneticPill } from "./ui/magnetic-pill";
import { SpotlightCard } from "./ui/spotlight-card";
import { Timeline, type TimelineEntry } from "./ui/timeline";

export type ResolvedExperience = Experience & {
  resolvedPhotoSrc?: string;
  photoDropHint?: string;
};

interface AboutTimelineProps {
  lang: Locale;
  dictionary: Dictionary["about"];
  experiences: readonly ResolvedExperience[];
  education: readonly Education[];
}

export function AboutTimeline({
  lang,
  dictionary,
  experiences,
  education: eduList,
}: AboutTimelineProps) {
  // Construct chronological Aceternity timeline data
  const timelineData: TimelineEntry[] = [
    // 1. Current AI Lead Role
    {
      title: "2025 — Present",
      category: "AI LEADERSHIP",
      content: (
        <SpotlightCard className="relative overflow-hidden p-6 sm:p-8" enableTilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {experiences[3]?.organization ?? "ADS Digital Partner"}
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {experiences[3]?.role[lang] ?? "AI Lead Engineer"}
              </h4>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {experiences[3]?.location ?? "Jakarta, Indonesia"}
            </span>
          </div>

          <p className="mt-4 text-sm font-medium leading-relaxed text-foreground sm:text-base">
            {lang === "id"
              ? "Memimpin rekayasa sistem AI on-premises di balik firewall klien, pipeline multi-agent otonom, dan pemrosesan dokumen/media skala enterprise."
              : "Directing on-premises enterprise AI deployments behind client firewalls, autonomous multi-agent pipelines, and large-scale document/media processing."}
          </p>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {experiences[3]?.highlights.map((highlight) => (
              <li key={highlight.en} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{highlight[lang]}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-border/60 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">On-Premises LLMs</span>
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">Deterministic Tool Execution</span>
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">Zero Data Egress</span>
          </div>

          <BorderBeam size={260} duration={14} colorFrom="#b883ec" colorTo="#38bdf8" />
        </SpotlightCard>
      ),
    },

    // 2. Data Scientist Role
    {
      title: "Late 2024",
      category: "DATA PLATFORM",
      content: (
        <SpotlightCard className="p-6 sm:p-8" enableTilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {experiences[2]?.organization ?? "ARMS"}
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {experiences[2]?.role[lang] ?? "Data Scientist"}
              </h4>
            </div>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {formatRange(experiences[2]?.start ?? "2024-11", experiences[2]?.end ?? "2024-12", lang, dictionary.present)}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {experiences[2]?.highlights.map((highlight) => (
              <li key={highlight.en} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{highlight[lang]}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-border/60 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">6x Dataiku Certified</span>
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">Enterprise Revenue Platform</span>
          </div>
        </SpotlightCard>
      ),
    },

    // 3. Blockchain Mentor & Smart Contracts
    {
      title: "Mid 2024",
      category: "BLOCKCHAIN & CONSENSUS",
      content: (
        <SpotlightCard className="p-6 sm:p-8" enableTilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {experiences[1]?.organization ?? "Politeknik Negeri Malang"}
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {experiences[1]?.role[lang] ?? "Blockchain Mentor"}
              </h4>
            </div>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {formatRange(experiences[1]?.start ?? "2024-08", experiences[1]?.end ?? "2024-12", lang, dictionary.present)}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {experiences[1]?.highlights.map((highlight) => (
              <li key={highlight.en} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{highlight[lang]}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-border/60 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">Hyperledger Besu</span>
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">Solidity Contracts</span>
            <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1">ERC-20 Tokenization</span>
          </div>
        </SpotlightCard>
      ),
    },

    // 4. Web Developer Intern & Early Analytics
    {
      title: "Late 2023",
      category: "FULL-STACK ANALYTICS",
      content: (
        <SpotlightCard className="p-6 sm:p-8" enableTilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {experiences[0]?.organization ?? "ADS Digital Partner"}
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {experiences[0]?.role[lang] ?? "Web Developer (Intern)"}
              </h4>
            </div>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {formatRange(experiences[0]?.start ?? "2023-08", experiences[0]?.end ?? "2023-12", lang, dictionary.present)}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {experiences[0]?.highlights.map((highlight) => (
              <li key={highlight.en} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{highlight[lang]}</span>
              </li>
            ))}
          </ul>

          {experiences[0]?.resolvedPhotoSrc || experiences[0]?.photo ? (
            <div className="mt-6 max-w-sm">
              <MediaFrame
                src={experiences[0]?.resolvedPhotoSrc}
                alt={experiences[0]?.photo?.alt[lang] ?? "ADS Team"}
                label={dictionary.photo}
                slot={experiences[0]?.photoDropHint}
                aspectClassName="aspect-[16/9]"
                sizes="(max-width: 768px) 100vw, 24rem"
                className="rounded-xl border-border-strong"
              />
            </div>
          ) : null}
        </SpotlightCard>
      ),
    },

    // 5. Academic Foundation & IEEE Publication
    {
      title: "2020 — 2024",
      category: "ACADEMIC FOUNDATION",
      content: (
        <SpotlightCard className="p-6 sm:p-8" enableTilt={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {dictionary.education}
              </span>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {eduList[0]?.institution ?? "Politeknik Negeri Malang"}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">{eduList[0]?.degree[lang]}</p>
            </div>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {formatMonth(eduList[0]?.start ?? "2020-02", lang)} — {formatMonth(eduList[0]?.end ?? "2024-08", lang)}
            </span>
          </div>

          <div className="mt-6 rounded-xl border border-border/80 bg-surface-2/40 p-5">
            <span className="chapter-stamp chapter-stamp--classified !text-[0.6rem] tracking-widest">
              {lang === "id" ? "PUBLIKASI RISET IEEE" : "IEEE PEER-REVIEWED PUBLICATION"}
            </span>
            <h5 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
              Towards Trustless Academic Records in Higher Education: Integrating Blockchain and IPFS
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {lang === "id"
                ? "Mengimplementasikan jaringan Hyperledger Besu berizin, smart contract kredensial dengan RBAC, lapisan penyimpanan IPFS, dan klien ReactJS di atas Thirdweb SDK."
                : "Engineered permissioned Hyperledger Besu network, verifiable smart contracts with role-based access control, IPFS storage layer, and ReactJS client."}
            </p>

            <div className="mt-4">
              <MagneticPill strength={0.25} className="inline-block">
                <LinkPreview
                  url="https://doi.org/10.1109/3ICT68299.2025.11442139"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-primary hover:opacity-80 transition-opacity"
                >
                  Verify IEEE Publication DOI &#8599;
                </LinkPreview>
              </MagneticPill>
            </div>
          </div>
        </SpotlightCard>
      ),
    },
  ];

  return (
    <div className="relative w-full">
      <Timeline data={timelineData} />
    </div>
  );
}
