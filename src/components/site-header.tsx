import Link from "next/link";

import { profile } from "@/content/profile";
import { CONTAINER } from "@/lib/design";
import type { Locale } from "@/lib/locale";

import { LocaleSwitch } from "./locale-switch";

/**
 * Section links are absolute (`/en#work`) rather than bare fragments so they
 * also work from a case study page, where `#work` would point at nothing.
 */
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
  return (
    <header className="border-b border-border">
      {/*
        Wraps rather than collapsing into a hamburger: three anchor links do not
        justify a menu, and a wrapped row keeps every destination reachable
        without JavaScript. On the 393px reference device the name and locale
        sit on the first line and the nav falls to the second; from `sm` up it
        is a single 56px row. Each control is rendered once — duplicating the
        nav behind breakpoints is how two copies drift apart.
      */}
      <div
        className={`${CONTAINER} flex flex-wrap items-center gap-x-6 gap-y-3 py-3 sm:h-14 sm:flex-nowrap sm:py-0`}
      >
        <Link
          href={`/${lang}`}
          className="mr-auto whitespace-nowrap text-sm font-medium tracking-tight transition-colors hover:text-primary"
        >
          {profile.name}
        </Link>

        <nav className="order-last flex w-full items-center gap-5 sm:order-none sm:w-auto">
          {SECTIONS.map((section) => (
            <Link
              key={section}
              href={`/${lang}#${section}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {nav[section]}
            </Link>
          ))}
        </nav>

        <LocaleSwitch
          current={lang}
          label={localeSwitch.label}
          names={{ en: localeSwitch.en, id: localeSwitch.id }}
        />
      </div>
    </header>
  );
}
