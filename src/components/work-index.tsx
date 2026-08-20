import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MediaFrame } from "@/components/media-frame";
import { withRedactions } from "@/components/redaction";
import { projects } from "@/content/projects";
import { CONTAINER, SECTION, TEXT } from "@/lib/design";
import { formatMonth } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { mediaDropHint, resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";
import { BorderBeam } from "./ui/border-beam";
import { FXSlider, type FXSliderItem } from "./ui/fx-slider";
import { ImageStreamHero } from "./ui/image-stream-hero";
import { TextArrowCTA } from "./ui/text-arrow-cta";
import { WorkCardLink } from "./work-card-link";

const PILLAR_ORDER = ["ai", "blockchain", "data"] as const;

/**
 * Work Section.
 * - On the homepage (featured=true): Renders the scroll-driven FXSlider that smoothly transitions
 *   case studies as the user scrolls down (with optional click jumping), followed by the animated TextArrowCTA.
 * - On /work (featured=false): Renders the 3D ImageStreamHero corridor and full indexed catalog grid.
 */
export function WorkIndex({
  lang,
  heading,
  dictionary,
  featured = false,
  viewAllHref,
}: {
  lang: Locale;
  heading: string;
  dictionary: Dictionary["work"];
  /** Home shows the featured projects in scroll-driven FXSlider; /work shows everything. */
  featured?: boolean;
  viewAllHref?: string;
}) {
  const source = featured ? projects.filter((p) => p.featured) : projects;
  const ordered = [...source].sort((a, b) => {
    const byPillar = PILLAR_ORDER.indexOf(a.pillar) - PILLAR_ORDER.indexOf(b.pillar);
    return byPillar !== 0 ? byPillar : b.started.localeCompare(a.started);
  });

  const sliderItems: FXSliderItem[] = projects.map((p) => ({
    id: p.slug,
    title: p.title[lang],
    category: dictionary.pillars[p.pillar],
    featured: `${formatMonth(p.started, lang)}${p.confidential ? ` · ${dictionary.confidential}` : ""}`,
    summary: p.confidential
      ? withRedactions(p.summary[lang], dictionary.redacted, dictionary.redactedAnnounced)
      : p.summary[lang],
    image: resolvePublicMedia(p.coverImage),
    href: `/${lang}/work/${p.slug}`,
  }));

  if (featured && viewAllHref) {
    return (
      <section id="work" aria-label={heading} className="scroll-mt-24 border-t border-border">
        {/* Scroll-Driven Sticky Stage: Case studies advance one-by-one as user scrolls down */}
        <FXSlider
          items={sliderItems}
          headerText={lang === "id" ? "ARSIP PRODUKSI · SISTEM TERPILIH" : "PRODUCTION ARCHITECTURES · SELECTED WORK"}
          footerText={lang === "id" ? "STUDI KASUS TERVERIFIKASI" : "DECLASSIFIED CASE STUDIES"}
        />

        {/* Animated Text Arrow CTA */}
        <div className="border-t border-border/80 bg-surface-1/40 py-16 flex justify-center text-center">
          <TextArrowCTA
            text={
              lang === "id"
                ? "Buka Seluruh Arsip Proyek (12 Arsitektur)"
                : "View All Production Systems [12 Case Studies]"
            }
            href={viewAllHref}
            activeColor="#b883ec"
          />
        </div>
      </section>
    );
  }

  const streamImages = ordered
    .map((p) => {
      const src = resolvePublicMedia(p.coverImage);
      return src ? { src, alt: p.title[lang] } : null;
    })
    .filter((img): img is { src: string; alt: string } => Boolean(img));

  return (
    <section id="work" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight text-foreground">
          <RedactLine>{heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[54ch]", TEXT.lead)}>{dictionary.listLead}</p>
      </div>

      {/* 3D Perspective Case Study Stream Corridor */}
      {streamImages.length > 0 ? (
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-border/80 bg-surface-1 shadow-2xl">
          <ImageStreamHero
            images={streamImages}
            cards={8}
            speed={24}
            className="h-[380px] w-full sm:h-[440px]"
          >
            <div className="relative z-10 flex h-full flex-col items-center justify-between p-8 text-center sm:p-10 pointer-events-none">
              <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest pointer-events-auto">
                {lang === "id" ? "ARSIP DEKLASIFIKASI · ALIRAN PROYEK" : "DECLASSIFIED ARCHIVE · PROJECT STREAM"}
              </span>
              <div className="max-w-lg">
                <h3 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  {lang === "id" ? "Eksplorasi Karya & Rekayasa AI" : "Autonomous Intelligence in Production"}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {lang === "id"
                    ? "6 Studi Kasus Enterprise · Terisolasi & Tanpa Kebocoran Data"
                    : "06 Enterprise Case Studies · Air-Gapped Compliance"}
                </p>
              </div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground-faint">
                [SCROLL TO BROWSE FULL DOSSIER ↓]
              </div>
            </div>
          </ImageStreamHero>
          <BorderBeam size={260} duration={16} colorFrom="#b883ec" colorTo="#38bdf8" />
        </div>
      ) : null}

      <ul data-anim="stagger" className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {ordered.map((project, i) => (
          <li key={project.slug}>
            <WorkCardLink
              href={`/${lang}/work/${project.slug}`}
              slug={project.slug}
              className="group flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <MediaFrame
                src={resolvePublicMedia(project.coverImage)}
                alt={project.title[lang]}
                label={dictionary.cover}
                slot={mediaDropHint(project.coverImage)}
                aspectClassName="aspect-[16/10]"
                priority={i < 2}
                sizes="(max-width: 640px) 100vw, 44vw"
                parallax
                transitionName={`work-cover-${project.slug}`}
                className="work-card-media w-full border-border-strong group-hover:border-primary"
              />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em]",
                    TEXT.faint,
                  )}
                >
                  {dictionary.pillars[project.pillar]}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.65rem] uppercase tracking-[0.16em]",
                    TEXT.faint,
                  )}
                >
                  {formatMonth(project.started, lang)}
                </span>
                {project.confidential ? (
                  <span className="chapter-stamp chapter-stamp--classified">
                    {dictionary.confidential}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                <span className="link-underline">{project.title[lang]}</span>
              </h3>

              <p className={cn("mt-2 flex-1 text-sm leading-relaxed", TEXT.subtle)}>
                {project.confidential
                  ? withRedactions(
                      project.summary[lang],
                      dictionary.redacted,
                      dictionary.redactedAnnounced,
                    )
                  : project.summary[lang]}
              </p>

              <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {dictionary.read}
                <span
                  aria-hidden
                  className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  &#8594;
                </span>
              </p>
            </WorkCardLink>
          </li>
        ))}
      </ul>

      {viewAllHref ? (
        <div className="mt-14 flex justify-center text-center">
          <TextArrowCTA
            text={
              lang === "id"
                ? "Lihat Seluruh Arsip Proyek →"
                : "View All Production Archives →"
            }
            href={viewAllHref}
            activeColor="#b883ec"
          />
        </div>
      ) : null}
    </section>
  );
}
