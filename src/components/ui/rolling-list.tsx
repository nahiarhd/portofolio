"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useState } from "react";

import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface RollingListItem {
  id: string;
  title: string;
  category?: string;
  meta?: string;
  description?: string;
  highlights?: string[];
  image?: string;
  imageAlt?: string;
}

interface RollingListProps {
  items: RollingListItem[];
  className?: string;
  onItemClick?: (item: RollingListItem) => void;
}

export function RollingList({ items, className, onItemClick }: RollingListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    playSound("tick");
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleClick = (index: number, item: RollingListItem) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
    playSound("blip");
    onItemClick?.(item);
  };

  return (
    <div className={cn("relative w-full border-t border-border/80", className)}>
      <ul className="divide-y divide-border/80">
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isExpanded = expandedIndex === index;

          return (
            <li
              key={item.id}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="group relative overflow-hidden transition-colors"
            >
              {/* Row Interactive Header */}
              <button
                type="button"
                onClick={() => handleClick(index, item)}
                className="flex w-full items-center justify-between py-8 text-left transition-all sm:py-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {/* Rolling Text Effect */}
                <div className="relative overflow-hidden">
                  <motion.div
                    className="flex flex-col"
                    animate={
                      !shouldReduceMotion && isHovered
                        ? { y: "-50%" }
                        : { y: "0%" }
                    }
                    transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                  >
                    {/* Primary Text */}
                    <span className="block font-display text-2xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl md:text-5xl lg:text-6xl">
                      {item.title}
                    </span>
                    {/* Rolled Duplicate Text */}
                    <span
                      aria-hidden
                      className="block font-display text-2xl font-bold uppercase tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                      {item.title}
                    </span>
                  </motion.div>
                </div>

                {/* Right Meta Info */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {item.category ? (
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs">
                      {item.category}
                    </span>
                  ) : null}

                  {item.meta ? (
                    <span className="hidden font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground-faint sm:inline-block">
                      {item.meta}
                    </span>
                  ) : null}

                  {/* Expand Toggle Chevron */}
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border border-border font-mono text-xs transition-transform duration-300",
                      isExpanded ? "rotate-90 border-primary text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden
                  >
                    →
                  </span>
                </div>
              </button>

              {/* Floating Image Reveal on Hover (Desktop) */}
              <AnimatePresence>
                {isHovered && item.image && !shouldReduceMotion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, x: 20, rotate: 2 }}
                    animate={{ opacity: 1, scale: 1, x: 0, rotate: -2 }}
                    exit={{ opacity: 0, scale: 0.85, x: 20, rotate: 2 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="pointer-events-none absolute right-24 top-1/2 z-20 hidden -translate-y-1/2 overflow-hidden rounded-2xl border-2 border-primary/60 bg-surface-1 shadow-2xl md:block md:w-56 lg:w-64"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.imageAlt ?? item.title}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="bg-surface-1/90 px-3 py-1.5 backdrop-blur-xs">
                      <p className="font-mono text-[0.62rem] uppercase tracking-wider text-primary">
                        {item.title}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded Highlights Accordion */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden pb-8"
                  >
                    <div className="rounded-2xl border border-border/80 bg-surface-1/60 p-6 backdrop-blur-xs">
                      {item.description ? (
                        <p className="text-sm font-medium text-foreground sm:text-base">
                          {item.description}
                        </p>
                      ) : null}

                      {item.highlights && item.highlights.length > 0 ? (
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                          {item.highlights.map((highlight, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RollingList;
