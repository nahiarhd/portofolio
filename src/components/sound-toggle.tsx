"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

import {
  getSoundSnapshot,
  getServerSoundSnapshot,
  subscribeSound,
  toggleSound,
} from "@/lib/sound";
import { cn } from "@/lib/utils";

export function SoundToggle({
  label = "Sound",
}: {
  label?: string;
}) {
  const enabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getServerSoundSnapshot,
  );
  const shouldReduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={() => toggleSound()}
      aria-label={`${label}: ${enabled ? "ON" : "OFF"}`}
      aria-pressed={enabled}
      title={
        enabled
          ? "Sound ON: Ambient Drone & UI Haptics Active (Click to Mute)"
          : "Sound OFF: Click to enable Ambient Cyber Drone & Tactile Audio"
      }
      className={cn(
        "group flex h-8 items-center gap-2 rounded-full border px-2.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary cursor-pointer",
        enabled
          ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_14px_rgba(184,131,236,0.3)]"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {/* 4-Bar Animated Equalizer */}
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0.6, 1.0, 0.4, 0.8].map((maxHeight, idx) => (
          <motion.span
            key={idx}
            className={cn(
              "w-[2px] rounded-full bg-current",
              enabled ? "opacity-100" : "opacity-30",
            )}
            animate={
              enabled && !shouldReduceMotion
                ? {
                    height: ["3px", `${maxHeight * 12}px`, "4px"],
                  }
                : { height: "3px" }
            }
            transition={
              enabled && !shouldReduceMotion
                ? {
                    duration: 0.5 + idx * 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }
                : undefined
            }
          />
        ))}
      </span>

      <span>{enabled ? "BGM ON" : "AUDIO"}</span>
    </button>
  );
}

export default SoundToggle;
