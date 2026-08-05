import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { GraphActivityProvider } from "@/components/graph/activity";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";
import { LOCALES, isLocale } from "@/lib/locale";
import { buildPageMetadata, titleTemplate } from "@/lib/metadata";

import { getDictionary } from "./dictionaries";

import "../globals.css";

type LangParams = { params: Promise<{ lang: string }> };

/** Body: Outfit (not Inter) — cleaner tech sans with presence. */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return {
    ...buildPageMetadata({
      lang,
      pathAfterLocale: "",
      title: profile.name,
      description: profile.tagline[lang],
    }),
    title: titleTemplate,
    description: profile.tagline[lang],
  };
}

export default async function RootLayout({
  children,
  params,
}: LangParams & { children: ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${outfit.variable} ${bricolage.variable} ${spaceMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-full flex-col bg-background font-sans text-foreground">
        <div className="bg-grid-lines" aria-hidden />
        <div className="ambient-glow ambient-glow--primary" aria-hidden />
        <div className="ambient-glow ambient-glow--secondary" aria-hidden />
        <div className="bg-grain" aria-hidden />

        <GraphActivityProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            {dictionary.nav.skipToContent}
          </a>

          <SiteHeader
            lang={lang}
            nav={dictionary.nav}
            localeSwitch={dictionary.localeSwitch}
          />

          {children}

          <SiteFooter rights={dictionary.footer.rights} />
        </GraphActivityProvider>
      </body>
    </html>
  );
}
