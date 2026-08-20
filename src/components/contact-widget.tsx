"use client";

import { useEffect, useState } from "react";

import { engagement, profile } from "@/content/profile";
import { TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { BorderBeam } from "./ui/border-beam";
import { DocumentCard } from "./ui/document-card";
import { SpotlightCard } from "./ui/spotlight-card";

interface ContactWidgetProps {
  lang: Locale;
  freelanceHeading: string;
  freelanceScope: string;
  freelanceCapacity: string;
  freelanceRate?: string;
  freelanceResponse: string;
  fulltimeHeading: string;
  fulltimeBody: string;
}

export function ContactWidget({
  lang,
  freelanceHeading,
  freelanceScope,
  freelanceCapacity,
  freelanceRate,
  freelanceResponse,
  fulltimeHeading,
  fulltimeBody,
}: ContactWidgetProps) {
  const [timeString, setTimeString] = useState("");

  // Live Jakarta (UTC+7) clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat("en-GB", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Live Status & Timezone Radar Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface-1/80 p-4 backdrop-blur-md sm:p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              {lang === "id" ? "STATUS OPERASIONAL: TERSEDIA" : "OPERATIONAL STATUS: AVAILABLE"}
            </span>
            <p className={cn("font-mono text-[0.65rem] uppercase tracking-wider", TEXT.faint)}>
              {lang === "id"
                ? "Proyek Freelance & Konsultasi Arsitektur AI"
                : "Freelance Projects & AI Architecture Advisory"}
            </p>
          </div>
        </div>

        {/* Live Jakarta Clock */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 font-mono text-xs">
          <span className="text-muted-foreground">JAKARTA (UTC+7):</span>
          <span className="font-bold text-foreground tabular-nums">
            {timeString || "15:00:00"} WIB
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Document Folder on Left / Engagement Scope on Right */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Column: 3D Classified Dossier Folder */}
        <div className="lg:col-span-6 flex justify-center">
          <DocumentCard lang={lang} />
        </div>

        {/* Right Column: Structured Scope Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Freelance Scope */}
          <SpotlightCard className="relative flex flex-col justify-between p-6 sm:p-8" enableTilt={false}>
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                  {freelanceHeading}
                </span>
                <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  {engagement.hoursPerWeek.from}–{engagement.hoursPerWeek.to} hrs/week
                </span>
              </div>

              <p className="mt-4 text-sm font-medium leading-relaxed text-foreground sm:text-base">
                {freelanceScope}
              </p>
              <p className={cn("mt-3 text-xs leading-relaxed sm:text-sm", TEXT.subtle)}>
                {freelanceCapacity}
              </p>

              {freelanceRate ? (
                <p className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                  {freelanceRate}
                </p>
              ) : null}
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <span className={cn("font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
                {freelanceResponse}
              </span>
            </div>

            <BorderBeam size={220} duration={14} colorFrom="#b883ec" colorTo="#38bdf8" />
          </SpotlightCard>

          {/* Card 2: Full-Time Leadership Scope */}
          <SpotlightCard className="flex flex-col justify-between p-6 sm:p-8" enableTilt={false}>
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                  {fulltimeHeading}
                </span>
                <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Lead / Principal Scope
                </span>
              </div>

              <p className={cn("mt-4 text-sm leading-relaxed sm:text-base", TEXT.subtle)}>
                {fulltimeBody}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.16em]", TEXT.faint)}>
                {profile.location[lang]}
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
