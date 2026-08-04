import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { profile } from "@/content/profile";
import { LOCALES, isLocale } from "@/lib/locale";

import "../globals.css";

/**
 * Typed explicitly rather than with Next's global `LayoutProps` helper: those
 * globals are generated into `.next/types` by a build, and CI runs `typecheck`
 * before `build`. On a clean clone the generated types do not exist yet, so
 * depending on them makes the gate fail for a reason that has nothing to do
 * with the code.
 */
type LangParams = { params: Promise<{ lang: string }> };

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
