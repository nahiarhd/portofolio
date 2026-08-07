import { notFound } from "next/navigation";

import { AboutSection } from "@/components/about-section";
import { CapabilityMarquee } from "@/components/capability-marquee";
import { ChatMount } from "@/components/chat/chat-mount";
import { ContactSection } from "@/components/contact-section";
import { EvidenceSection } from "@/components/evidence-section";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
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

  // hero → work → ask → about → certs → contact.
  //
  // One work section, not two. The stage and the index listed the same six
  // projects, so "Selected work" and "All work" were the same set under two
  // headings. Deleting the stage also drops the second continuous <Canvas>,
  // which is what buys the frame budget for the persistent hero graph.
  return (
    <main id="content" className="flex-1">
      <Hero lang={lang} copy={dictionary.hero} />
      <CapabilityMarquee />
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
      <EvidenceSection lang={lang} dictionary={dictionary.evidence} />
      <ContactSection lang={lang} dictionary={dictionary.contact} />
    </main>
  );
}
