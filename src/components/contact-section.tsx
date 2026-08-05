import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, SECTION, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

export function ContactSection({ heading, body }: { heading: string; body: string }) {
  return (
    <section id="contact" className={`${CONTAINER} ${SECTION}`}>
      <Reveal>
        <div className="relative max-w-2xl">
          <h2 className="font-display text-title font-semibold tracking-tight">{heading}</h2>
          <p className={cn("mt-5 max-w-[48ch] text-base leading-relaxed sm:text-lead", TEXT.subtle)}>
            {body}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className={BUTTON.primary}>
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              rel="me noreferrer"
              target="_blank"
              aria-label="LinkedIn (opens in a new tab)"
              className={BUTTON.secondary}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
