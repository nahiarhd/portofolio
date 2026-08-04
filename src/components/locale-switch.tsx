"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, localizePath, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * Client-only because it needs the current pathname to keep the reader on the
 * same page across the switch. Rendered as links rather than buttons so it
 * works without JavaScript and so each locale is a real, crawlable URL.
 */
export function LocaleSwitch({
  current,
  label,
  names,
}: {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
}) {
  const pathname = usePathname() ?? `/${current}`;

  return (
    <nav aria-label={label} className="flex items-center gap-1">
      {LOCALES.map((locale) => {
        const isCurrent = locale === current;
        return (
          <Link
            key={locale}
            href={localizePath(pathname, locale)}
            hrefLang={locale}
            aria-current={isCurrent ? "true" : undefined}
            // Visible label is the locale code; accessible name must include that
            // code (Lighthouse label-content-name-mismatch) plus the language name.
            aria-label={`${locale} — ${names[locale]}`}
            className={cn(
              "rounded-sm px-1.5 py-1 font-mono text-eyebrow uppercase transition-colors",
              isCurrent
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
