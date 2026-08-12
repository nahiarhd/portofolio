import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { GraphActivityProvider } from "@/components/graph/activity";
import { RoutePulse } from "@/components/graph/route-pulse";
import { WorldGraph } from "@/components/graph/world";
import { ScrollChoreography } from "@/components/scroll-choreography";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";
import { LOCALES, isLocale } from "@/lib/locale";
import { buildPageMetadata, titleTemplate } from "@/lib/metadata";

import { getDictionary } from "./dictionaries";

import "../globals.css";

type LangParams = { params: Promise<{ lang: string }> };

/** Outfit is the display and body face; Space Mono carries meta and labels. */
const outfit = Outfit({
  variable: "--font-outfit",
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
      className={`${outfit.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-full flex-col bg-background font-sans text-foreground">
        <GraphActivityProvider>
          {/* The persistent world graph — fixed behind every chapter. It is
           * the receiver for `GraphActivityProvider`: streaming brightens it,
           * `showProject` lights its nodes, and RoutePulse sweeps a wave on
           * every navigation. Renders nothing when WebGL is blocked or motion
           * is reduced; the hero keeps its still instead. */}
          <WorldGraph />
          <RoutePulse />

          <div className="bg-grid-lines" aria-hidden />
          <div className="bg-grain" aria-hidden />
          <div className="scroll-line" aria-hidden />
          <ScrollChoreography />

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

          <SiteFooter rights={dictionary.footer.rights} lang={lang} />
        </GraphActivityProvider>
      </body>
    </html>
  );
}
