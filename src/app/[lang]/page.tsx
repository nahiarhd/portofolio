import { notFound } from "next/navigation";

import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
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

  // `flex-1`, not `min-h-screen`: the body is already a column with a header and
  // footer, so a full-viewport main pushes the footer off the screen.
  return (
    <main id="content" className="flex-1">
      <Hero lang={lang} />
      <WorkIndex lang={lang} heading={dictionary.nav.work} dictionary={dictionary.work} />
      <AboutSection
        lang={lang}
        heading={dictionary.nav.about}
        dictionary={dictionary.about}
      />
      <ContactSection heading={dictionary.nav.contact} body={dictionary.contact.body} />
    </main>
  );
}
