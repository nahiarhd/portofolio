"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";

import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface TextArrowCTAProps {
  text: string;
  href: string;
  className?: string;
  lineColor?: string;
  activeColor?: string;
}

export function TextArrowCTA({
  text,
  href,
  className,
  lineColor = "currentColor",
  activeColor = "#b883ec",
}: TextArrowCTAProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseEnter = () => {
    setIsHovered(true);
    playSound("tick");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative inline-flex flex-col items-center justify-center overflow-visible py-2 text-decoration-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      {/* Top Text & Dual Animated Arrows */}
      <div className="relative flex items-center gap-3">
        {/* Left Arrow (Slides in on hover) */}
        {!shouldReduceMotion ? (
          <motion.span
            animate={
              isHovered
                ? { opacity: 1, x: 0, rotate: 0, scale: 1 }
                : { opacity: 0, x: -12, rotate: -45, scale: 0.5 }
            }
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="font-mono text-sm font-bold text-primary"
            aria-hidden
          >
            ↗
          </motion.span>
        ) : null}

        {/* Text Label */}
        <span className="font-display text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
          {text}
        </span>

        {/* Right Arrow (Slides out on hover) */}
        {!shouldReduceMotion ? (
          <motion.span
            animate={
              isHovered
                ? { opacity: 0, x: 12, rotate: 45, scale: 0.5 }
                : { opacity: 1, x: 0, rotate: 0, scale: 1 }
            }
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="font-mono text-sm font-bold text-muted-foreground transition-colors group-hover:text-primary"
            aria-hidden
          >
            ↗
          </motion.span>
        ) : (
          <span className="font-mono text-sm font-bold text-primary">↗</span>
        )}
      </div>

      {/* Bottom Expanding Sweep Underline */}
      <div className="relative mt-1.5 h-[2px] w-full overflow-hidden bg-border/60">
        <motion.div
          animate={isHovered ? { x: "0%" } : { x: "-100%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full"
          style={{ backgroundColor: activeColor || lineColor }}
        />
      </div>
    </Link>
  );
}

export default TextArrowCTA;
