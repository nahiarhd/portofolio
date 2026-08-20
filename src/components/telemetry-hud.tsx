"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { SoundToggle } from "./sound-toggle";
import { MagneticPill } from "./ui/magnetic-pill";

interface TelemetryHudProps {
  lang: Locale;
}

const CHAPTERS = [
  { id: "cover", labelEn: "COVER", labelId: "SAMPUL" },
  { id: "work", labelEn: "WORK", labelId: "KARYA" },
  { id: "about", labelEn: "DOSSIER", labelId: "DOSIR" },
  { id: "evidence", labelEn: "EVIDENCE", labelId: "BUKTI" },
  { id: "ask", labelEn: "AGENT CHAT", labelId: "OBROLAN" },
  { id: "contact", labelEn: "CONTACT", labelId: "KONTAK" },
] as const;

export function TelemetryHud({ lang }: TelemetryHudProps) {
  const [activeChapter, setActiveChapter] = useState<string>("cover");
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [percent, setPercent] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setPercent(Math.round(latest * 100));
      setIsScrolled(latest > 0.04);
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveChapter(CHAPTERS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    playSound("blip");
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const currentChapterObj = CHAPTERS.find((c) => c.id === activeChapter) ?? CHAPTERS[0];
  const chapterName = lang === "id" ? currentChapterObj.labelId : currentChapterObj.labelEn;

  return (
    <motion.aside
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.8 }}
      className="pointer-events-none fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 sm:bottom-6"
      aria-label="Telemetry HUD"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/80 bg-background/85 px-3.5 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-primary/40 sm:gap-4 sm:px-4">
        {/* Active Chapter Badge */}
        <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="font-semibold text-foreground">{chapterName}</span>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-px bg-border" aria-hidden />

        {/* Live Scroll Progress Pill */}
        <div className="flex items-center gap-2 font-mono text-[0.62rem] text-muted-foreground">
          <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-surface-2 sm:w-16">
            <motion.div
              style={{ scaleX }}
              className="h-full w-full origin-left bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <span className="w-7 text-right font-medium text-foreground">{percent}%</span>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-px bg-border" aria-hidden />

        {/* Sound Toggle */}
        <SoundToggle />

        {/* Scroll To Top Quick Button (Appears when scrolled) */}
        {isScrolled ? (
          <MagneticPill strength={0.2}>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={lang === "id" ? "Kembali ke atas" : "Scroll to top"}
              title={lang === "id" ? "Kembali ke atas" : "Scroll to top"}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border border-border bg-surface-1 text-xs text-muted-foreground",
                "transition-all duration-200 hover:border-primary hover:text-primary active:scale-95",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
              )}
            >
              &#8593;
            </button>
          </MagneticPill>
        ) : null}
      </div>
    </motion.aside>
  );
}
