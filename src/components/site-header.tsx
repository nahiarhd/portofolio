import Link from "next/link";

import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { LocaleSwitch } from "./locale-switch";

/** Primary destinations only — shelf stays on-page but not in chrome noise. */
const SECTIONS = ["work", "about", "contact"] as const;
const SECONDARY = ["shelf", "ask"] as const;

export function SiteHeader({
  lang,
  nav,
  localeSwitch,
}: {
  lang: Locale;
  nav: Record<(typeof SECTIONS)[number] | (typeof SECONDARY)[number], string>;
  localeSwitch: { label: string } & Record<Locale, string>;
}) {
  const first = profile.name.split(" ")[0] ?? profile.name;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <div className={`${CONTAINER} flex justify-center`}>
        <div
          className={cn(
            "nav-pill pointer-events-auto flex max-w-full items-center gap-0.5 px-1.5 py-1.5 sm:gap-1 sm:px-2",
          )}
        >
          <Link
            href={`/${lang}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {first}
          </Link>

          <nav className="flex min-w-0 items-center gap-0.5" aria-label="Primary">
            {SECTIONS.map((section) => (
              <Link
                key={section}
                href={`/${lang}#${section}`}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                  TEXT.subtle,
                  "hover:bg-white/5 hover:text-foreground",
                )}
              >
                {nav[section]}
              </Link>
            ))}
            {SECONDARY.map((section) => (
              <Link
                key={section}
                href={`/${lang}#${section}`}
                className={cn(
                  "hidden rounded-full px-3 py-1.5 text-sm transition-colors md:inline-flex",
                  TEXT.subtle,
                  "hover:bg-white/5 hover:text-foreground",
                )}
              >
                {nav[section]}
              </Link>
            ))}
          </nav>

          <div className="mx-0.5 hidden h-4 w-px bg-white/10 sm:mx-1 sm:block" aria-hidden />

          <LocaleSwitch
            current={lang}
            label={localeSwitch.label}
            names={{ en: localeSwitch.en, id: localeSwitch.id }}
          />
        </div>
      </div>
    </header>
  );
}
