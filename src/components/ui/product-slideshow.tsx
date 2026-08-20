"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { BorderBeam } from "@/components/ui/border-beam";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface ProductSlideshowItem {
  name: string;
  issuer: string;
  issued?: string;
  verifyUrl?: string;
  credentialId?: string;
  image?: string;
}

interface ProductSlideshowProps {
  items: ProductSlideshowItem[];
  lang: Locale;
  verifyLabel?: string;
  className?: string;
}

export function ProductSlideshow({
  items,
  lang,
  verifyLabel = "Verify Credential",
  className,
}: ProductSlideshowProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const isZoomedIn = selectedIndex !== null;
  const activeItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handleOpen = useCallback((idx: number) => {
    setSelectedIndex(idx);
    playSound("tick");
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
    playSound("tick");
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
    playSound("tick");
  }, [selectedIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    playSound("tick");
  }, [selectedIndex, items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomedIn) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomedIn, handleClose, handleNext, handlePrev]);

  if (!items || items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden py-6", className)}
    >
      {/* Horizontal Strip of Interactive Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar sm:gap-6">
        {items.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <motion.div
              key={item.credentialId || item.name}
              whileHover={!shouldReduceMotion ? { y: -6, scale: 1.02 } : undefined}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                playSound("tick");
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleOpen(idx)}
              className={cn(
                "group relative flex w-[280px] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-surface-1 p-4 shadow-lg transition-colors sm:w-[320px] sm:p-5",
                isHovered
                  ? "border-primary/80 shadow-[0_0_24px_rgba(184,131,236,0.25)]"
                  : "border-border/80 hover:border-primary/50",
              )}
            >
              {/* Top Issuer Stamp */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-widest text-primary">
                  {item.issuer}
                </span>
                {item.issued ? (
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                    {formatMonth(item.issued, lang)}
                  </span>
                ) : null}
              </div>

              {/* Certificate Image Frame */}
              <div className="relative my-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60 bg-surface-2">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[0.65rem] text-muted-foreground">
                    VERIFIED CREDENTIAL
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-white backdrop-blur-xs">
                  Inspect ↗
                </div>
              </div>

              {/* Title & Credential ID */}
              <div>
                <h4 className="font-display text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
                  {item.name}
                </h4>
                {item.credentialId ? (
                  <p className="mt-1 truncate font-mono text-[0.58rem] uppercase tracking-wider text-muted-foreground">
                    ID: {item.credentialId}
                  </p>
                ) : null}
              </div>

              {isHovered ? (
                <BorderBeam size={160} duration={8} colorFrom="#b883ec" colorTo="#38bdf8" />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Zoomed-In Slideshow Lightbox Modal */}
      <AnimatePresence>
        {isZoomedIn && activeItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-primary/60 bg-surface-1 shadow-[0_0_60px_rgba(184,131,236,0.35)]"
            >
              {/* Header with Navigation Controls & Close Button */}
              <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
                    {activeItem.issuer}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedIndex + 1} / {items.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label="Previous credential"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label="Next credential"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="ml-2 flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2 font-mono text-xs text-foreground transition-colors hover:border-red-500 hover:text-red-400"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Expanded Certificate Image Stage */}
              <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden bg-black/40 p-4 sm:min-h-[380px] sm:p-8">
                {activeItem.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeItem.image}
                    alt={activeItem.name}
                    className="max-h-[50vh] w-auto rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <div className="flex h-48 w-72 items-center justify-center rounded-xl border border-dashed border-border text-center font-mono text-xs text-muted-foreground">
                    OFFICIAL CERTIFICATE ARTIFACT
                  </div>
                )}
              </div>

              {/* Footer Information & Public Verification CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/80 bg-surface-2/60 px-6 py-5">
                <div className="max-w-md">
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {activeItem.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                    {activeItem.issued ? (
                      <span>Issued: {formatMonth(activeItem.issued, lang)}</span>
                    ) : null}
                    {activeItem.credentialId ? (
                      <>
                        <span>•</span>
                        <span className="truncate">ID: {activeItem.credentialId}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {activeItem.verifyUrl ? (
                  <a
                    href={activeItem.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(184,131,236,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(184,131,236,0.6)]"
                  >
                    {verifyLabel} ↗
                  </a>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default ProductSlideshow;
