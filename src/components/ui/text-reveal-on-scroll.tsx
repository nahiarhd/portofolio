"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, { useRef } from "react";

import { cn } from "@/lib/utils";

interface TextRevealOnScrollProps {
  text: string;
  className?: string;
  mutedColor?: string;
  primaryColor?: string;
  accentWords?: string[];
  accentColor?: string;
  mode?: "word" | "character";
  balance?: boolean;
}

interface RevealItemProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  mutedColor: string;
  targetColor: string;
}

function RevealItem({
  children,
  progress,
  range,
  mutedColor,
  targetColor,
}: RevealItemProps) {
  const color = useTransform(progress, range, [mutedColor, targetColor]);
  const opacity = useTransform(progress, range, [0.3, 1]);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span
      style={{ color, opacity, y }}
      className="inline-block transition-colors will-change-transform"
    >
      {children}
    </motion.span>
  );
}

export function TextRevealOnScroll({
  text,
  className,
  mutedColor = "rgba(255, 255, 255, 0.2)",
  primaryColor = "rgba(255, 255, 255, 1)",
  accentWords = [],
  accentColor = "#b883ec",
  mode = "word",
  balance = true,
}: TextRevealOnScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 45%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return (
      <div
        className={cn("text-foreground", className)}
        style={{ textWrap: balance ? "balance" : "wrap" }}
      >
        {text}
      </div>
    );
  }

  // Parse text into tokens
  const tokens =
    mode === "character"
      ? text.split("")
      : text.match(/([\S]+|\s+)/g) || [];

  const nonWhitespaceTokens = tokens.filter((t) => t.trim().length > 0);
  const totalValids = nonWhitespaceTokens.length;

  let currentIdx = 0;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={text}
      className={cn("relative w-full", className)}
      style={{ textWrap: balance ? "balance" : "wrap", whiteSpace: "pre-wrap" }}
    >
      <span aria-hidden="true">
        {tokens.map((token, idx) => {
          if (token.trim().length === 0 && token !== "\n") {
            return (
              <React.Fragment key={`space-${idx}`}>{token}</React.Fragment>
            );
          }
          if (token === "\n") {
            return <br key={`br-${idx}`} />;
          }

          const start = currentIdx / Math.max(totalValids, 1);
          const end = (currentIdx + 1) / Math.max(totalValids, 1);
          currentIdx++;

          const isAccent = accentWords.some((w) =>
            token.toLowerCase().includes(w.toLowerCase()),
          );
          const targetColor = isAccent ? accentColor : primaryColor;

          return (
            <RevealItem
              key={`token-${idx}`}
              progress={smoothProgress}
              range={[start, end]}
              mutedColor={mutedColor}
              targetColor={targetColor}
            >
              {token}
            </RevealItem>
          );
        })}
      </span>
    </div>
  );
}

export default TextRevealOnScroll;
