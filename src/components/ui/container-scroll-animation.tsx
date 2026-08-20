"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ContainerScrollProps {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContainerScroll({
  titleComponent,
  children,
  className,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = isMobile ? [0.85, 1] : [1.05, 1];

  const rotate = useTransform(scrollYProgress, [0, 0.65], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.65], scaleDimensions);
  const translate = useTransform(scrollYProgress, [0, 0.65], [0, -50]);

  if (shouldReduceMotion) {
    return (
      <div className={cn("relative py-12 md:py-20", className)} ref={containerRef}>
        <div className="mx-auto max-w-5xl text-center">{titleComponent}</div>
        <div className="mx-auto mt-8 max-w-5xl rounded-[24px] border border-border bg-surface-1 p-3 shadow-xl md:p-5">
          <div className="overflow-hidden rounded-xl border border-border bg-background p-2">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative flex items-center justify-center py-16 md:py-28", className)}
      ref={containerRef}
    >
      <div
        className="relative w-full"
        style={{
          perspective: "1200px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

interface HeaderProps {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}

export function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

interface CardProps {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}

export function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a",
      }}
      className="mx-auto mt-6 h-[24rem] w-full max-w-5xl rounded-[28px] border border-border-strong/80 bg-surface-1/90 p-2 backdrop-blur-md shadow-2xl transition-colors sm:p-4 md:h-[34rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl border border-border/80 bg-background/90 md:rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
}

export default ContainerScroll;
