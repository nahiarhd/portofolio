import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";

/** Closing statement. Centred on purpose: it is the one section with a single
 * message and no supporting content, and every section above is left-aligned. */
export function ContactSection({
  heading,
  body,
  lang,
}: {
  heading: string;
  body: string;
  lang: Locale;
}) {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
      <div className={CONTAINER}>
        <div data-anim="reveal-head">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-medium leading-[1.05] tracking-tight">
              <RedactLine>{heading}</RedactLine>
            </h2>
            <p
              className={cn(
                "mx-auto mt-5 max-w-[42ch] text-base leading-relaxed sm:text-lead",
                TEXT.subtle,
              )}
            >
              {body}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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

            <p
              className={cn(
                "mt-8 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                TEXT.faint,
              )}
            >
              {profile.location[lang]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
