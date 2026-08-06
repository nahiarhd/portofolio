import { notFound } from "next/navigation";

import { AboutSection } from "@/components/about-section";
import { CapabilityMarquee } from "@/components/capability-marquee";
import { CertificationsSection } from "@/components/certifications-section";
import { ChatMount } from "@/components/chat/chat-mount";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { WorkIndex } from "@/components/work-index";
import { WorkStage, type WorkStageItem } from "@/components/work-stage";
import { projects } from "@/content/projects";
import { isLocale } from "@/lib/locale";
import { resolvePublicMedia } from "@/lib/public-media";

import { getDictionary } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  // Resolve covers on the server (node:fs) before the client work stage.
  // Keep {{redacted}} in confidential summaries for the redaction UI.
  const stageProjects: WorkStageItem[] = projects.map((project) => ({
    slug: project.slug,
    title: project.title[lang],
    summary: project.summary[lang],
    pillar: project.pillar,
    confidential: project.confidential,
    coverSrc: resolvePublicMedia(project.coverImage),
  }));

  // hero → selected work (stage) → all work → ask → about → certs → contact.
  return (
    <main id="content" className="flex-1">
      <Hero lang={lang} copy={dictionary.hero} />
      <CapabilityMarquee />
      <WorkStage
        lang={lang}
        projects={stageProjects}
        dictionary={dictionary.work}
        heading={dictionary.work.stageHeading}
      />
      <WorkIndex
        lang={lang}
        heading={dictionary.work.indexHeading}
        dictionary={dictionary.work}
      />
      <Statement />
      <ChatMount
        lang={lang}
        copy={dictionary.chat}
        work={dictionary.work}
        heading={dictionary.nav.ask}
      />
      <AboutSection
        lang={lang}
        heading={dictionary.nav.about}
        dictionary={dictionary.about}
      />
      <CertificationsSection lang={lang} dictionary={dictionary.certifications} />
      <ContactSection
        heading={dictionary.nav.contact}
        body={dictionary.contact.body}
        lang={lang}
      />
    </main>
  );
}
