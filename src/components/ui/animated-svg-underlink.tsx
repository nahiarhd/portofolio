"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useCallback, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AnimatedSVGUnderlinkProps {
  children: React.ReactNode;
  className?: string;
  underlineColor?: string;
  strokeWidth?: number;
  gap?: number;
  autoPlay?: boolean;
}

const SVG_VARIANTS = [
  "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999",
  "M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242",
  "M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998",
];

export function AnimatedSVGUnderlink({
  children,
  className,
  underlineColor = "#b883ec",
  strokeWidth = 3,
  gap = 2,
  autoPlay = false,
}: AnimatedSVGUnderlinkProps) {
  const [isHovered, setIsHovered] = useState(autoPlay);
  const [variantIdx, setVariantIdx] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const shouldReduceMotion = useReducedMotion();

  const handleHoverStart = useCallback(() => {
    setVariantIdx((prev) => (prev + 1) % SVG_VARIANTS.length);
    setIsHovered(true);
  }, []);

  const handleHoverEnd = useCallback(() => {
    if (!autoPlay) setIsHovered(false);
  }, [autoPlay]);

  const svgPath = useMemo(() => SVG_VARIANTS[variantIdx], [variantIdx]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      className={cn(
        "relative inline-flex flex-col items-center justify-center cursor-pointer",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>

      {/* Animated Underline Track */}
      <span
        className="pointer-events-none absolute -bottom-1 left-0 right-0 h-2.5 overflow-visible"
        style={{ marginTop: `${gap}px` }}
        aria-hidden
      >
        <AnimatePresence>
          {(isHovered || autoPlay) && !shouldReduceMotion ? (
            <motion.svg
              key={`${id}-${variantIdx}`}
              viewBox="0 0 310 40"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full overflow-visible"
            >
              <motion.path
                d={svgPath}
                stroke={underlineColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </span>
    </span>
  );
}

export default AnimatedSVGUnderlink;
