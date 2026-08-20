"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TimelineEntry {
  title: string;
  category?: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  heading?: string;
  description?: string;
  className?: string;
}

export function Timeline({
  data,
  heading,
  description,
  className,
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
    >
      {heading ? (
        <div className="mx-auto mb-12 max-w-5xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          {description ? (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={ref} className="relative mx-auto pb-12">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-16"
          >
            {/* Sticky Date/Year Node */}
            <div className="sticky top-40 z-30 flex max-w-xs self-start items-center md:w-full md:max-w-xs lg:max-w-sm">
              <div className="absolute left-3 flex size-10 items-center justify-center rounded-full border border-border bg-surface-1 shadow-[0_0_16px_rgba(184,131,236,0.15)] md:left-3">
                <div className="size-3 rounded-full border border-primary/60 bg-primary animate-pulse" />
              </div>
              <div className="hidden pl-20 md:block">
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  {item.title}
                </h3>
                {item.category ? (
                  <p className="font-mono text-[0.65rem] uppercase tracking-widest text-primary">
                    {item.category}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Content Slot */}
            <div className="relative w-full pl-20 pr-2 md:pl-4">
              <div className="mb-4 md:hidden">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                {item.category ? (
                  <p className="font-mono text-[0.62rem] uppercase tracking-widest text-primary">
                    {item.category}
                  </p>
                ) : null}
              </div>

              {item.content}
            </div>
          </div>
        ))}

        {/* Ambient Rail Line */}
        <div
          style={{
            height: `${height}px`,
          }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-gradient-to-b from-transparent via-border to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
          aria-hidden
        >
          {/* Glowing Animated Laser Progress Beam */}
          {!shouldReduceMotion ? (
            <motion.div
              style={{
                height: heightTransform,
                opacity: opacityTransform,
              }}
              className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-primary via-cyan-400 to-transparent shadow-[0_0_12px_rgba(184,131,236,0.8)]"
            />
          ) : (
            <div className="h-full w-[2px] bg-primary/50" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
