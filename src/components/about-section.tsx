import type { Dictionary } from "@/app/[lang]/dictionaries";
import { education, experience, profile } from "@/content/profile";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { AboutTimeline, type ResolvedExperience } from "./about-timeline";
import { RedactLine } from "./redact-line";
import { ScrambleText } from "./ui/scramble-text";

/**
 * About Section (Server Component): Resolves static media on the server
 * and renders the interactive Bento Grid timeline.
 */
export function AboutSection({
  lang,
  heading,
  dictionary,
}: {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["about"];
}) {
  const resolvedExperiences: ResolvedExperience[] = experience.map((entry) => ({
    ...entry,
    resolvedPhotoSrc: entry.photo ? resolvePublicMedia(entry.photo.src) : undefined,
    photoDropHint: entry.photo ? mediaDropHint(entry.photo.src) : undefined,
  }));

  return (
    <section id="about" className={`${CONTAINER} ${SECTION}`}>
      {/* Section Eyebrow & Headline */}
      <div data-anim="reveal-head" className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
            <ScrambleText
              text={
                lang === "id"
                  ? "DOSIR SUBJEK · PROFIL REKAYASA"
                  : "SUBJECT DOSSIER · ENGINEERING PROFILE"
              }
            />
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted-foreground">
            {profile.name}
          </span>
        </div>

        <h2 className="font-display text-title font-medium tracking-tight text-foreground">
          <RedactLine>{heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[54ch]", TEXT.lead)}>{dictionary.lead}</p>
      </div>

      {/* Bento Grid Experience & Specialization */}
      <AboutTimeline
        lang={lang}
        dictionary={dictionary}
        experiences={resolvedExperiences}
        education={education}
      />
    </section>
  );
}
