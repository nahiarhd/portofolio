"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, localizePath, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

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
    <nav aria-label={label} className="flex items-center gap-0.5">
      {LOCALES.map((locale) => {
        const isCurrent = locale === current;
        return (
          <Link
            key={locale}
            href={localizePath(pathname, locale)}
            hrefLang={locale}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`${locale} — ${names[locale]}`}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-eyebrow uppercase transition-colors",
              isCurrent
                ? "bg-white text-neutral-950"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
