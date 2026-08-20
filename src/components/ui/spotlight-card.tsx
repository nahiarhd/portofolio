"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { type MouseEvent, type ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  enableTilt?: boolean;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(184, 131, 236, 0.14)",
  enableTilt = true,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const rotateXSpring = useSpring(0, { damping: 20, stiffness: 200 });
  const rotateYSpring = useSpring(0, { damping: 20, stiffness: 200 });

  const rotateX = useTransform(rotateXSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(rotateYSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    mouseX.set(x);
    mouseY.set(y);

    if (enableTilt && !shouldReduceMotion) {
      const normalizedX = (x / width) - 0.5;
      const normalizedY = (y / height) - 0.5;
      rotateXSpring.set(normalizedY);
      rotateYSpring.set(normalizedX);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
    rotateXSpring.set(0);
    rotateYSpring.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        enableTilt && !shouldReduceMotion
          ? {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface-1 transition-colors duration-300 hover:border-primary/40",
        className,
      )}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(400px circle at ${x}px ${y}px, ${spotlightColor}, transparent 70%)`,
          ),
        }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
