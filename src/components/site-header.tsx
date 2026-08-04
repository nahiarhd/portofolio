import Link from "next/link";

import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { LocaleSwitch } from "./locale-switch";

const SECTIONS = ["work", "about", "contact"] as const;

export function SiteHeader({
  lang,
  nav,
  localeSwitch,
}: {
  lang: Locale;
  nav: Record<(typeof SECTIONS)[number], string>;
  localeSwitch: { label: string } & Record<Locale, string>;
}) {
  const first = profile.name.split(" ")[0] ?? profile.name;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-4 sm:pt-5">
      <div className={`${CONTAINER} flex justify-center`}>
        <div
          className={cn(
            "nav-pill pointer-events-auto flex max-w-full flex-wrap items-center gap-x-1 gap-y-2 px-2 py-2 sm:gap-x-2 sm:px-3",
          )}
        >
          <Link
            href={`/${lang}`}
            className="rounded-full px-3 py-1.5 text-sm font-medium tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="text-foreground">{first}</span>
            <span className={cn("ml-1.5 hidden sm:inline", TEXT.faint)}>· SYS</span>
          </Link>

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            {SECTIONS.map((section) => (
              <Link
                key={section}
                href={`/${lang}#${section}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  TEXT.subtle,
                  "hover:bg-white/5 hover:text-foreground",
                )}
              >
                {nav[section]}
              </Link>
            ))}
          </nav>

          <div className="mx-1 hidden h-4 w-px bg-white/10 sm:block" aria-hidden />

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
