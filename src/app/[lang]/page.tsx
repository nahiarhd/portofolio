import { notFound } from "next/navigation";

import { AboutSection } from "@/components/about-section";
import { CertificationsSection } from "@/components/certifications-section";
import { ChatMount } from "@/components/chat/chat-mount";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { ShelfIsland } from "@/components/shelf/shelf-island";
import { WorkIndex } from "@/components/work-index";
import { isLocale } from "@/lib/locale";
import { shelfBooksForLocale } from "@/lib/shelf-books";

import { getDictionary } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);
  const books = shelfBooksForLocale(lang, {
    problem: dictionary.work.problem,
    role: dictionary.work.role,
    outcome: dictionary.work.outcome,
    stack: dictionary.work.stack,
  });

  // One Object: shelf is the immersive setpiece; work list is the non-WebGL path.
  return (
    <main id="content" className="flex-1">
      <Hero lang={lang} />
      <ShelfIsland lang={lang} books={books} readLabel={dictionary.work.read} />
      <WorkIndex lang={lang} heading={dictionary.nav.work} dictionary={dictionary.work} />
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
      <ContactSection heading={dictionary.nav.contact} body={dictionary.contact.body} />
    </main>
  );
}
