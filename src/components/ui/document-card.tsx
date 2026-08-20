"use client";

import { motion, useReducedMotion } from "framer-motion";
import React, { useState } from "react";

import { GITHUB_URL, HUGGINGFACE_URL, engagement, profile } from "@/content/profile";
import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { BorderBeam } from "./border-beam";
import { MagneticPill } from "./magnetic-pill";

interface DocumentCardProps {
  lang: Locale;
  className?: string;
}

export function DocumentCard({ lang, className }: DocumentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) setIsFlipped(false);
    playSound("blip");
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
      playSound("blip");
    } else {
      setIsFlipped((prev) => !prev);
      playSound("tick");
    }
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      playSound("blip");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-xl flex-col items-center justify-center py-6 [perspective:1400px]",
        className,
      )}
    >
      {/* Interactive Helper Banner */}
      <div className="mb-6 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground">
        <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
        <span>
          {isOpen
            ? lang === "id"
              ? "KLIK KARTU UNTUK MEMBALIK · KLIK MAP UNTUK MENUTUP"
              : "KLIK CARD TO FLIP · CLICK FOLDER TO TUCK IN"
            : lang === "id"
              ? "KLIK MAP UNTUK MEMBUKA DOKUMEN"
              : "CLICK FOLDER TO UNLOCK TRANSMISSION CARD"}
        </span>
      </div>

      {/* Main Folder Jacket Stage (320px x 400px) */}
      <div
        onMouseEnter={() => {
          setIsHovered(true);
          playSound("tick");
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleToggleOpen}
        className="group relative h-[390px] w-[310px] cursor-pointer sm:h-[410px] sm:w-[330px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 1. Folder Back Foundation */}
        <div
          className="absolute inset-0 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-indigo-950/90 via-surface-1 to-surface-2 p-5 shadow-2xl backdrop-blur-md"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border/40 p-4 font-mono text-[0.62rem] uppercase tracking-widest text-muted-foreground/70">
            <div className="flex items-center justify-between">
              <span>DOSSIER: RH-2026</span>
              <span className="font-bold text-primary">SECURE CHANNEL</span>
            </div>
            <div className="text-center text-muted-foreground/30">
              AIR-GAPPED COMPLIANCE · DIRECT INBOX
            </div>
          </div>
        </div>

        {/* 2. Message / Transmission Card (Slides out and flips on click) */}
        <motion.div
          onClick={handleCardClick}
          animate={
            shouldReduceMotion
              ? {}
              : isOpen
                ? {
                    y: -24,
                    rotate: isFlipped ? 0 : -4,
                    rotateY: isFlipped ? 180 : 0,
                    scale: 1.04,
                    zIndex: 30,
                  }
                : isHovered
                  ? { y: -14, x: 12, rotate: 6, zIndex: 20 }
                  : { y: 0, x: 0, rotate: 0, zIndex: 10 }
          }
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="absolute inset-x-3.5 inset-y-3.5 rounded-2xl border-2 border-primary/60 bg-surface-1 shadow-[0_0_35px_rgba(184,131,236,0.35)] [transform-style:preserve-3d]"
        >
          {/* FRONT OF MESSAGE CARD */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-between rounded-2xl bg-surface-1/95 p-5 [backface-visibility:hidden]",
              isFlipped ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100",
            )}
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono text-[0.62rem] uppercase tracking-widest">
                <span className="font-bold text-primary">TRANSMISSION CARD</span>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">
                  AUTHORIZED
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">ENGINEER:</span>
                  <p className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base">
                    {profile.name}
                  </p>
                </div>

                <div>
                  <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">FOCUS:</span>
                  <p className="font-sans text-[0.72rem] leading-relaxed text-foreground/90">
                    On-Premises LLMs · Agent Systems · Zero Egress
                  </p>
                </div>

                <div className="border-t border-border/60 pt-2">
                  <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">DIRECT CHANNEL:</span>
                  <p className="truncate font-bold text-primary">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/80 pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex-1 rounded-lg border border-primary/60 bg-primary/10 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-black cursor-pointer"
                >
                  {copied ? "✓ COPIED" : "COPY EMAIL"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                    playSound("tick");
                  }}
                  className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  FLIP ↻
                </button>
              </div>

              <div className="flex items-center justify-between font-mono text-[0.58rem] text-muted-foreground">
                <span>SLA: &lt; 48H RESPONSE</span>
                <span>UTC+7 (WIB)</span>
              </div>
            </div>

            <BorderBeam size={140} duration={10} colorFrom="#b883ec" colorTo="#38bdf8" />
          </div>

          {/* BACK OF MESSAGE CARD */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-between rounded-2xl bg-surface-2/95 p-5 [transform:rotateY(180deg)] [backface-visibility:hidden]",
              !isFlipped ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100",
            )}
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono text-[0.62rem] uppercase tracking-widest text-primary">
                <span>OPERATIONAL PROTOCOL</span>
                <span>SECURE</span>
              </div>

              <div className="mt-3.5 space-y-2.5 font-mono text-xs">
                <p className="font-sans text-[0.72rem] leading-relaxed text-foreground/90">
                  {lang === "id"
                    ? "Seluruh pesan dipantau langsung oleh Raihan untuk inisiasi proyek arsitektur AI dan advisory freelance."
                    : "All transmissions are monitored directly by Raihan for autonomous agent system advisory and enterprise AI deployment."}
                </p>

                <div className="rounded-lg border border-border/80 bg-surface-1/80 p-2.5 text-[0.65rem]">
                  <span className="font-bold text-primary">CAPACITY: </span>
                  <span>
                    {engagement.hoursPerWeek.from}–{engagement.hoursPerWeek.to} hrs/week available
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/80 pt-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                  playSound("tick");
                }}
                className="w-full rounded-lg border border-border bg-surface-1 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                ← FLIP TO CONTACT INFO
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3. Folder Front Cover (Opens in 3D on hover; docks behind when unlocked) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : isOpen
                ? { rotateY: 0, zIndex: 0, opacity: 0.25 }
                : isHovered
                  ? { rotateY: -38, originX: 0, zIndex: 25, opacity: 1 }
                  : { rotateY: 0, originX: 0, zIndex: 25, opacity: 1 }
          }
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="absolute inset-0 rounded-3xl border-2 border-primary/50 bg-gradient-to-br from-primary/30 via-indigo-950 to-surface-1 p-5 shadow-2xl backdrop-blur-xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 p-5">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="chapter-stamp chapter-stamp--classified text-[0.58rem] tracking-widest">
                TOP SECRET
              </span>
              <div className="flex size-4 items-center justify-center rounded-full border border-primary/60 bg-primary/20">
                <span className="size-1.5 rounded-full bg-primary" />
              </div>
            </div>

            {/* Center Label */}
            <div className="my-auto space-y-1.5 text-center">
              <h4 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                CONFIDENTIAL
              </h4>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
                AI SYSTEMS & CONTACT DOSSIER
              </p>
            </div>

            {/* Footer Stencil */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 font-mono text-[0.6rem] uppercase tracking-wider text-white/60">
              <span className="text-primary font-bold">{isOpen ? "[UNLOCKED]" : "[CLICK TO OPEN]"}</span>
              <span>RH-2026</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* External Action Links Below Folder */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <MagneticPill strength={0.3}>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/20 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(184,131,236,0.3)] transition-all hover:bg-primary hover:text-black"
          >
            {profile.email} &#8599;
          </a>
        </MagneticPill>

        <MagneticPill strength={0.2}>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary transition-colors"
          >
            LinkedIn &#8599;
          </a>
        </MagneticPill>

        <MagneticPill strength={0.2}>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary transition-colors"
          >
            GitHub &#8599;
          </a>
        </MagneticPill>

        <MagneticPill strength={0.2}>
          <a
            href={HUGGINGFACE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary transition-colors"
          >
            Hugging Face &#8599;
          </a>
        </MagneticPill>
      </div>
    </div>
  );
}

export default DocumentCard;
