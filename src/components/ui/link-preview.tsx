"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import React, { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export function LinkPreview({
  children,
  url,
  className,
  width = 240,
  height = 140,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) {
  let src: string;
  if (!isStatic) {
    const params = new URLSearchParams({
      url,
      screenshot: "true",
      meta: "false",
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": "true",
      "viewport.deviceScaleFactor": "1",
      "viewport.width": String(width * 2.5),
      "viewport.height": String(height * 2.5),
    });
    src = `https://api.microlink.io/?${params.toString()}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const shouldReduceMotion = useReducedMotion();

  const springConfig = { stiffness: 120, damping: 18 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <>
      {isMounted && !shouldReduceMotion ? (
        <div className="hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={width} height={height} alt="preload preview" />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={120}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          asChild
          onMouseMove={handleMouseMove}
          className={cn("cursor-pointer", className)}
        >
          <a href={url} target="_blank" rel="noreferrer">
            {children}
          </a>
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Portal>
          <HoverCardPrimitive.Content
            className="z-50 [transform-origin:var(--radix-hover-card-content-transform-origin)]"
            side="top"
            align="center"
            sideOffset={12}
          >
            <AnimatePresence>
              {isOpen && !shouldReduceMotion && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    },
                  }}
                  exit={{ opacity: 0, y: 16, scale: 0.8 }}
                  className="rounded-2xl border-2 border-primary/50 bg-surface-1/95 p-1.5 shadow-[0_0_30px_rgba(184,131,236,0.35)] backdrop-blur-md"
                  style={{
                    x: translateX,
                  }}
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-xl bg-surface-2"
                    style={{ fontSize: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      className="rounded-lg object-cover"
                      alt={`${url} live preview`}
                    />
                    <div className="flex items-center justify-between bg-surface-1/90 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground backdrop-blur-xs">
                      <span className="truncate max-w-[180px] text-foreground font-semibold">
                        {url.replace(/^https?:\/\//, "")}
                      </span>
                      <span className="text-primary font-bold">↗</span>
                    </div>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      </HoverCardPrimitive.Root>
    </>
  );
}

export default LinkPreview;
