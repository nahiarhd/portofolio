import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { profile } from "@/content/profile";
import { LOCALES, isLocale } from "@/lib/locale";

import { getDictionary } from "./dictionaries";

import "../globals.css";

/**
 * Typed explicitly rather than with Next's global `LayoutProps` helper: those
 * globals are generated into `.next/types` by a build, and CI runs `typecheck`
 * before `build`. On a clean clone the generated types do not exist yet, so
 * depending on them makes the gate fail for a reason that has nothing to do
 * with the code.
 */
type LangParams = { params: Promise<{ lang: string }> };

/**
 * Archivo carries both display and body: a grotesque with enough width and
 * weight range to be set very large and very tight without needing a second
 * display face. IBM Plex Mono is structural, not ornamental — it is what the
 * eyebrow labels are set in, and those only ever hold real data.
 *
 * `display: "swap"` so text paints on the reference device before the webfont
 * arrives; a blocking font is the cheapest way to lose the LCP budget.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * The root layout lives under `[lang]` so `<html lang>` matches the locale
 * being rendered. Next supports a root layout inside a top-level dynamic
 * segment; see the internationalization guide in `next/dist/docs`.
 */
export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return {
    title: profile.name,
    description: profile.tagline[lang],
  };
}

export default async function RootLayout({
  children,
  params,
}: LangParams & { children: ReactNode }) {
  const { lang } = await params;
  // The proxy prefixes every request with a supported locale, so this is a
  // defence in depth rather than the primary guard.
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          First focusable element on the page. Visually hidden until focused,
          so keyboard users can jump the header instead of tabbing the nav on
          every page.
        */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
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

        {/*
          Client island. Closed by default — pages work fully without opening
          it. Locale + copy come from the server dictionary so the panel never
          hardcodes English.
        */}
        <ChatPanel lang={lang} copy={dictionary.chat} work={dictionary.work} />
      </body>
    </html>
  );
}
