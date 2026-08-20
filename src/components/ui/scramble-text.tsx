"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { playSound } from "@/lib/sound";

const CYPHER_CHARS = "01XZ#$*&%▓▒░█/<>_~";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleOnMount?: boolean;
  scrambleOnHover?: boolean;
  children?: ReactNode;
}

export function ScrambleText({
  text,
  className = "",
  scrambleOnMount = false,
  scrambleOnHover = true,
  children,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isScrambling = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const startScramble = useCallback(() => {
    if (isScrambling.current || shouldReduceMotion) return;
    isScrambling.current = true;
    playSound("decrypt");

    let iteration = 0;
    const maxIterations = text.length * 2.5;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration / 2.5) {
              return text[index];
            }
            return CYPHER_CHARS[Math.floor(Math.random() * CYPHER_CHARS.length)];
          })
          .join(""),
      );

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        isScrambling.current = false;
      }

      iteration += 1;
    }, 28);
  }, [text, shouldReduceMotion]);

  useEffect(() => {
    if (scrambleOnMount && !shouldReduceMotion) {
      startScramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scrambleOnMount, shouldReduceMotion, startScramble]);

  if (shouldReduceMotion) {
    return <span className={className}>{children ?? text}</span>;
  }

  return (
    <span
      onMouseEnter={scrambleOnHover ? startScramble : undefined}
      onTouchStart={scrambleOnHover ? startScramble : undefined}
      className={className}
      data-scramble-ready="true"
    >
      {children ?? displayText}
    </span>
  );
}
