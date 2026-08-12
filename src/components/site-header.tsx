"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { profile } from "@/content/profile";
import { BUTTON, CONTAINER, TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { LocaleSwitch } from "./locale-switch";

/** Primary destinations. `contact` is the pill, so it is not repeated here. */
const SECTIONS = ["work", "about", "ask"] as const;

/** Same-page anchor ids. "work" is handled separately by `navHref` below. */
const ANCHORS: Record<(typeof SECTIONS)[number] | "contact", string> = {
  work: "work",
  about: "about",
  ask: "ask",
  contact: "contact",
};

/**
 * "work" no longer anchors here — the full case-study index moved to its own
 * route (`/work`) — so it resolves there instead of a same-page hash. Every
 * other section is still a same-page anchor on the home page.
 */
function navHref(lang: Locale, section: (typeof SECTIONS)[number] | "contact"): string {
  return section === "work" ? `/${lang}/work` : `/${lang}#${ANCHORS[section]}`;
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

  /* The home page opens on an ink chapter and the header sits over it, so the
   * header carries that chapter's tokens until the hero ends.
   *
   * The initial value comes from the route, not from measurement, so the first
   * paint is already correct and the bar never flashes ink over the hero.
   *
   * Updates are written straight to the DOM node instead of through state:
   * `react-hooks/set-state-in-effect` is an error here, and a re-render per
   * scroll boundary would be wasted work either way.
   *
   * The sentinel is watched rather than the hero itself, because
   * `intersectionRatio` is a fraction of the *target's* area — a 900px hero
   * clipped to the header band reads as ~0.05 and crosses no useful threshold.
   * The `top` test covers a hero taller than the viewport, where the sentinel
   * starts below the fold. */
  const pathname = usePathname();
  const startsHero = /^\/[a-z]{2}\/?$/.test(pathname);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = headerRef.current;
    const sentinel = document.querySelector("[data-hero-chapter-end]");

    /* Non-home routes are ink for the whole visit — no sentinel to watch. */
    if (!startsHero || !node || !sentinel) {
      if (node) node.dataset.hero = "false";
      document.body.dataset.chapter = "ink";
      return;
    }

    const apply = (overHero: boolean) => {
      node.dataset.hero = String(overHero);
      /* Grain + any future chapter chrome read this; keep it off React state
       * so a scroll boundary never re-renders the shell. */
      document.body.dataset.chapter = overHero ? "paper" : "ink";
    };

    /* First paint matches the route default (paper on home); correct if the
     * reader restored a mid-page scroll before the observer fires. */
    apply(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const overHero = entry.isIntersecting || entry.boundingClientRect.top > 0;
        apply(overHero);
      },
      /* Trigger slightly before the sentinel hits the bar so the token flip
       * and the paper rule land as one expensive cut, not two. */
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      delete document.body.dataset.chapter;
    };
  }, [startsHero]);

  const linkClass = cn(
    "link-underline text-xs font-medium uppercase tracking-[0.14em] transition-colors",
    TEXT.subtle,
    "hover:text-primary",
  );

  return (
    <header
      ref={headerRef}
      data-hero={startsHero ? "true" : "false"}
      className={cn(
        "nav-bar fixed inset-x-0 top-0 z-50",
        // The open menu needs a surface; tokens still come from data-hero, so
        // it reads paper over the hero and ink below it.
        open && "!bg-background",
      )}
    >
      <nav
        className={`${CONTAINER} flex h-14 items-center justify-between gap-4 sm:h-16`}
        aria-label="Primary"
      >
        <Link
          href={`/${lang}#cover`}
          className="shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition-opacity hover:opacity-70"
        >
          {mark}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((section) => (
            <Link key={section} href={navHref(lang, section)} className={linkClass}>
              {nav[section]}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitch
            current={lang}
            label={localeSwitch.label}
            names={{ en: localeSwitch.en, id: localeSwitch.id }}
          />
          <Link
            href={navHref(lang, "contact")}
            className={cn(BUTTON.primary, "hidden !min-h-9 !px-4 !py-1.5 text-xs sm:inline-flex")}
          >
            {nav.contact}
          </Link>

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
            {[...SECTIONS, "contact" as const].map((section) => (
              <li key={section} className="border-b border-border last:border-b-0">
                <Link
                  href={navHref(lang, section)}
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
