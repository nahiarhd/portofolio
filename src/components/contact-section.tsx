import { profile } from "@/content/profile";
import { CONTAINER, SURFACE, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

export function ContactSection({ heading, body }: { heading: string; body: string }) {
  return (
    <section
      id="contact"
      className={`${CONTAINER} scroll-mt-28 border-t border-border/60 py-24 sm:py-32`}
    >
      <Reveal>
        <div className={cn(SURFACE.panelStrong, "relative overflow-hidden p-8 sm:p-10")}>
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <h2 className="font-display text-title font-semibold tracking-tight">
            {heading}
          </h2>
          <p className={cn("mt-5 max-w-[48ch] text-lead", TEXT.subtle)}>{body}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
            >
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              rel="me noreferrer"
              target="_blank"
              aria-label="LinkedIn (opens in a new tab)"
              className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-white/5"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
