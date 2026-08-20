import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  GITHUB_URL,
  HUGGINGFACE_URL,
  certifications,
  publications,
} from "@/content/profile";
import { BUTTON, CONTAINER, EYEBROW, SECTION, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { resolvePublicMedia } from "@/lib/public-media";
import { cn } from "@/lib/utils";

import { RedactLine } from "./redact-line";
import { LinkPreview } from "./ui/link-preview";
import { MagneticPill } from "./ui/magnetic-pill";
import { ProductSlideshow } from "./ui/product-slideshow";
import { SpotlightCard } from "./ui/spotlight-card";

/**
 * The answer to the site's central problem: four of six case studies are under
 * NDA and unprovable. Everything in this section is public and checkable in one
 * click, which is the only thing that converts an assertion into evidence.
 *
 * Ordered by strength, not by convention: published models first (strangers
 * chose to use them), then the paper, then code, then certifications.
 */
export function EvidenceSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary["evidence"];
}) {
  return (
    <section id="evidence" className={`${CONTAINER} ${SECTION}`}>
      <div data-anim="reveal-head">
        <h2 className="font-display text-title font-medium tracking-tight">
          <RedactLine>{dictionary.heading}</RedactLine>
        </h2>
        <p className={cn("mt-3 max-w-[54ch]", TEXT.lead)}>
          {dictionary.lead}
        </p>
      </div>

      {/* Models — the strongest claim, so it leads. */}
      <div data-anim="stagger" className="mt-16">
        <p className={EYEBROW}>{dictionary.modelsHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.modelsLead}
        </p>

        {/* Editorial Story Block with Rich Inline LinkPreviews */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-surface-1/70 p-6 backdrop-blur-xs sm:p-8">
          <span className="chapter-stamp chapter-stamp--classified text-[0.6rem] tracking-widest">
            {lang === "id"
              ? "TAKSONOMI MODEL NLP & OPEN-WEIGHTS"
              : "NLP MODEL TAXONOMY & OPEN WEIGHTS"}
          </span>

          <p className="mt-4 font-display text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl md:text-2xl">
            {lang === "id" ? (
              <>
                Mengembangkan dan melatih arsitektur open-weights NLP khusus teks berbahasa Indonesia & multilingual, mencakup{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/sentiment-analysis-v2"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Sentiment Analysis
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/xlm-roberta-ner-v2"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Named Entity Recognition (NER)
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Hate Speech Detection
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Bot Detection
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Emotion Classification
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/spam-detection-xlm-roberta-v3"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Spam Detection
                </LinkPreview>
                , dan{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Topic Modelling
                </LinkPreview>
                —seluruh bobot model dirilis ke publik di{" "}
                <LinkPreview
                  url={HUGGINGFACE_URL}
                  className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent underline underline-offset-4 decoration-purple-400"
                >
                  Hugging Face
                </LinkPreview>
                .
              </>
            ) : (
              <>
                Trained and published specialized open-weights NLP architectures for Indonesian and multilingual text, spanning{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/sentiment-analysis-v2"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Sentiment Analysis
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/xlm-roberta-ner-v2"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Named Entity Recognition (NER)
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Hate Speech Detection
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Bot Detection
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Emotion Classification
                </LinkPreview>
                ,{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar/spam-detection-xlm-roberta-v3"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Spam Detection
                </LinkPreview>
                , and{" "}
                <LinkPreview
                  url="https://huggingface.co/nahiar"
                  className="font-bold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
                >
                  Topic Modelling
                </LinkPreview>
                —all weights and checkpoints published publicly on{" "}
                <LinkPreview
                  url={HUGGINGFACE_URL}
                  className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent underline underline-offset-4 decoration-purple-400"
                >
                  Hugging Face
                </LinkPreview>
                .
              </>
            )}
          </p>
        </div>
      </div>

      {/* Publication. */}
      {publications.map((paper) => (
        <div key={paper.doi} data-anim="stagger" className="mt-20 border-t border-border pt-10">
          <SpotlightCard className="p-6 sm:p-8">
            <p className={EYEBROW}>{dictionary.paperHeading}</p>
            <h3 className="mt-4 max-w-[46ch] font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
              <LinkPreview url={paper.doi} className="hover:text-primary transition-colors">
                {paper.title}
              </LinkPreview>
            </h3>
            <p className={cn("mt-3 max-w-[52ch] text-sm leading-relaxed", TEXT.subtle)}>
              {paper.venue}, {paper.year} ·{" "}
              {dictionary.paperAuthor
                .replace("{position}", String(paper.authorPosition))
                .replace("{count}", String(paper.authorCount))}
            </p>
            <p className={cn("mt-4 max-w-[52ch] text-base leading-relaxed", TEXT.subtle)}>
              {paper.contribution[lang]}
            </p>
            <MagneticPill strength={0.25} className="mt-6 inline-block">
              <LinkPreview
                url={paper.doi}
                className={cn(BUTTON.secondary, "inline-flex items-center gap-1.5")}
              >
                {dictionary.paperRead} &#8599;
              </LinkPreview>
            </MagneticPill>
          </SpotlightCard>
        </div>
      ))}

      {/* Code. */}
      <div data-anim="stagger" className="mt-20 border-t border-border pt-10">
        <p className={EYEBROW}>{dictionary.codeHeading}</p>
        <p className={cn("mt-3 max-w-[46ch] text-base leading-relaxed", TEXT.subtle)}>
          {dictionary.codeLead}
        </p>
        <MagneticPill strength={0.25} className="mt-6 inline-block">
          <LinkPreview
            url={GITHUB_URL}
            className={cn(BUTTON.secondary, "inline-flex items-center gap-1.5")}
          >
            {GITHUB_URL.replace(/^https?:\/\//, "")} &#8599;
          </LinkPreview>
        </MagneticPill>
      </div>

      {/* Certifications Interactive Product Slideshow */}
      <div className="mt-20 border-t border-border pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="chapter-stamp chapter-stamp--classified text-[0.62rem] tracking-widest">
              {lang === "id"
                ? "KREDENSIAL TERVERIFIKASI · 7 SERTIFIKASI"
                : "VERIFIED CREDENTIALS · 07 CERTIFICATIONS"}
            </span>
            <h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              {dictionary.certificationsHeading}
            </h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {lang === "id"
                ? "Dataiku AI/MLOps & Kampus Merdeka MSIB · Terverifikasi Publik"
                : "Dataiku AI/MLOps & Kampus Merdeka MSIB · Publicly Verifiable"}
            </p>
          </div>
        </div>

        <ProductSlideshow
          items={certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            issued: c.issued,
            credentialId: c.credentialId,
            verifyUrl: c.verifyUrl,
            image: resolvePublicMedia(c.image),
          }))}
          lang={lang}
          verifyLabel={dictionary.verify}
        />
      </div>
    </section>
  );
}
