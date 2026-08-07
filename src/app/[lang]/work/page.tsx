import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkIndex } from "@/components/work-index";
import { isLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";

import { getDictionary } from "../dictionaries";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dictionary = await getDictionary(lang);
  return buildPageMetadata({
    lang,
    pathAfterLocale: "/work",
    title: dictionary.work.indexHeading,
    description: dictionary.work.listLead,
  });
}

export default async function WorkPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <main id="content" className="flex-1 pt-24">
      <WorkIndex
        lang={lang}
        heading={dictionary.work.indexHeading}
        dictionary={dictionary.work}
      />
    </main>
  );
}
