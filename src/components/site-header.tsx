"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { LocaleSwitch } from "./locale-switch";
import { SoundToggle } from "./sound-toggle";
import { MagneticPill } from "./ui/magnetic-pill";

/** Primary destinations in order of homepage flow. */
const SECTIONS = ["work", "about", "evidence", "contact", "ask"] as const;

/** Same-page anchor ids. "work" is handled separately by `navHref` below. */
const ANCHORS: Record<(typeof SECTIONS)[number], string> = {
  work: "work",
  about: "about",
  evidence: "evidence",
  contact: "contact",
  ask: "ask",
};

/**
 * On the home page, Work jumps to the selected-work chapter. Everywhere
 * else it opens the full index at /work.
 */
function isHomePath(pathname: string): boolean {
  return /^\/[a-z]{2}\/?$/.test(pathname);
}

function navHref(
  lang: Locale,
  section: (typeof SECTIONS)[number] | "contact",
  pathname: string,
): string {
  if (section === "work") {
    return isHomePath(pathname) ? `/${lang}#work` : `/${lang}/work`;
  }
  return `/${lang}#${ANCHORS[section]}`;
}

type NavCopy = Record<
  (typeof SECTIONS)[number] | "contact" | "shelf" | "skipToContent",
  string
>;

/**
 * Client component for one reason: the mobile menu has to close when a link is
 * followed. A `<details>` disclosure would ship no JS but would stay open over
 * the section the user just jumped to.
 */
export function SiteHeader({
  lang,
  nav,
  localeSwitch,
}: {
  lang: Locale;
  nav: NavCopy;
  localeSwitch: { label: string } & Record<Locale, string>;
}) {
  const [open, setOpen] = useState(false);
  const mark = profile.name.split(" ")[0] ?? profile.name;
  const shouldReduceMotion = useReducedMotion();

  const pathname = usePathname();
  const startsHero = isHomePath(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(startsHero ? "cover" : null);

  useEffect(() => {
    const node = headerRef.current;
    const hero = document.querySelector<HTMLElement>("[data-anim=hero]");

    if (!startsHero || !node || !hero) {
      if (node) node.dataset.hero = "false";
      return;
    }

    const apply = (overHero: boolean) => {
      node.dataset.hero = String(overHero);
    };

    apply(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        apply(entry.isIntersecting && entry.boundingClientRect.bottom > 80);
      },
      { threshold: [0, 0.08, 0.25, 0.6, 1] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [startsHero]);

  useEffect(() => {
    const ids = SECTIONS;
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [pathname]);

  const linkClass = cn(
    "relative px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
    TEXT.subtle,
    "hover:text-foreground",
  );

  return (
    <header
      ref={headerRef}
      data-hero={startsHero ? "true" : "false"}
      className={cn(
        "nav-bar fixed inset-x-0 top-0 z-50",
        open && "!bg-background",
      )}
    >
      <nav
        className={`${CONTAINER} flex h-14 items-center justify-between gap-4 sm:h-16`}
        aria-label="Primary"
      >
        <MagneticPill strength={0.2}>
          <Link
            href={`/${lang}#cover`}
            className="shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition-opacity hover:opacity-70"
          >
            {mark}
          </Link>
        </MagneticPill>

        <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-surface-1/60 p-1 backdrop-blur-md md:flex">
          {SECTIONS.map((section) => {
            const href = navHref(lang, section, pathname);
            const current =
              section === "work"
                ? activeId === "work" || pathname.startsWith(`/${lang}/work`)
                : activeId === ANCHORS[section];
            return (
              <Link
                key={section}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(linkClass, current && "text-foreground font-semibold")}
              >
                {current && !shouldReduceMotion ? (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-full bg-surface-2 shadow-sm border border-border/80"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{nav[section]}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SoundToggle />
          <LocaleSwitch
            current={lang}
            label={localeSwitch.label}
            names={{ en: localeSwitch.en, id: localeSwitch.id }}
          />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-2 flex size-10 items-center justify-center text-foreground md:hidden"
          >
            <span className="sr-only">{nav.shelf}</span>
            <span className="relative block h-3 w-5" aria-hidden>
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-200",
                  open && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[6px] h-px bg-current transition-opacity duration-200",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[12px] h-px bg-current transition-transform duration-200",
                  open && "-translate-y-[6px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background px-5 pb-6 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {SECTIONS.map((section) => (
              <li key={section} className="border-b border-border last:border-b-0">
                <Link
                  href={navHref(lang, section, pathname)}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-display text-2xl font-medium tracking-tight text-foreground"
                >
                  {nav[section]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
