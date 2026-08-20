"use client";

import { useEffect, useRef, useState } from "react";

import { playSound } from "@/lib/sound";

const SCRAMBLE_CHARS = "█▓▒░%&$#01X/§<>!*?";

/**
 * Interactive theatrical redaction bar client component.
 *
 * Runs a rapid cyber-decryption character scramble on hover / focus,
 * revealing the NDA label accompanied by synthesized tactile audio.
 */
export function RedactionBar({ label, announced }: { label: string; announced: string }) {
  const targetText = `[${label}]`;
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef<number | null>(null);

  const startScramble = () => {
    setIsHovered(true);
    playSound("decrypt");

    const totalFrames = 14;
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealCount = Math.floor(progress * targetText.length);

      let result = "";
      for (let i = 0; i < targetText.length; i++) {
        if (i < revealCount) {
          result += targetText[i];
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      setDisplayText(result);

      if (frame < totalFrames) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(targetText);
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);
  };

  const stopScramble = () => {
    setIsHovered(false);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setDisplayText(null);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <span
      className="redaction inline-flex cursor-help items-baseline align-baseline select-none"
      tabIndex={0}
      onPointerEnter={startScramble}
      onPointerLeave={stopScramble}
      onFocus={startScramble}
      onBlur={stopScramble}
      aria-label={announced}
    >
      <span
        className="font-mono text-[0.78em] font-semibold tracking-wider text-stamp transition-colors duration-150"
        aria-hidden
      >
        {isHovered && displayText ? (
          <span className="bg-stamp/15 px-1 py-0.5 rounded text-stamp border border-stamp/30">
            {displayText}
          </span>
        ) : (
          <span className="redaction__bar inline-block min-w-[4.5ch] bg-foreground text-transparent">
            ████████
          </span>
        )}
      </span>
      <span className="sr-only">{announced}</span>
    </span>
  );
}
