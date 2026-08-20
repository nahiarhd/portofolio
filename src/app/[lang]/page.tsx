import { notFound } from "next/navigation";

import { AboutSection } from "@/components/about-section";
import { CapabilityMarquee } from "@/components/capability-marquee";
import { ChatMount } from "@/components/chat/chat-mount";
import { ContactSection } from "@/components/contact-section";
import { EvidenceSection } from "@/components/evidence-section";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { ScrollZoomReveal } from "@/components/ui/scroll-zoom-reveal";
import { WorkIndex } from "@/components/work-index";
import { isLocale } from "@/lib/locale";

import { getDictionary } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <main id="content" className="flex-1">
      <Hero lang={lang} copy={dictionary.hero} />
      <CapabilityMarquee />
      <ScrollZoomReveal
        leftText={lang === "id" ? "© 2026 · TERVERIFIKASI" : "© 2026 · DECLASSIFIED"}
        rightText={lang === "id" ? "ARSITEKTUR SISTEM AI" : "AI SYSTEMS ARCHITECTURE"}
        badge={lang === "id" ? "PORTAL · LEVEL-4 CLEARANCE" : "PORTAL · LEVEL-4 CLEARANCE"}
        title={
          lang === "id"
            ? "Sistem AI Produksi & Pipeline On-Premises"
            : "Production AI Systems & Air-Gapped Pipelines"
        }
        subtitle={
          lang === "id"
            ? "12 studi kasus terverifikasi dalam orkestrasi agent otonom, data intelligence, dan kepatuhan zero egress."
            : "12 verifiable case studies in autonomous tool calling, revenue intelligence, and zero data egress architectures."
        }
        buttonText={lang === "id" ? "Buka Katalog Produksi ↗" : "Explore Production Catalog ↗"}
        buttonHref="#work"
      />
      <WorkIndex
        lang={lang}
        heading={dictionary.work.featuredHeading}
        dictionary={dictionary.work}
        featured
        viewAllHref={`/${lang}/work`}
      />
      <Statement lang={lang} />
      <AboutSection
        lang={lang}
        heading={dictionary.nav.about}
        dictionary={dictionary.about}
      />
      <EvidenceSection lang={lang} dictionary={dictionary.evidence} />
      <ContactSection lang={lang} dictionary={dictionary.contact} />
      <ChatMount
        lang={lang}
        copy={dictionary.chat}
        work={dictionary.work}
        heading={dictionary.nav.ask}
      />
    </main>
  );
}
