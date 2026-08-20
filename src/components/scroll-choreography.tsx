"use client";

/**
 * The page's motion layer, in one client island.
 *
 * Sections stay server components and only carry `data-anim` hooks, so nothing
 * above the fold waits on hydration and no content depends on this file
 * running. Everything here is enhancement.
 *
 * GSAP is imported dynamically and only after the reduced-motion check, so a
 * reader who asked for less motion never downloads the ~70 KB. That matters:
 * the frame budget for this project was measured on a Redmi Note 11.
 */

import { useEffect } from "react";

export function ScrollChoreography() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        /* Reading progress. */
        gsap.to(".scroll-line", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });

        /* Hero: bars pull off the headline, then the supporting copy arrives.
         * `fromTo` with scaleX 1 -> 0 keeps the resting state readable.
         * Guarded: /work and case studies have no hero, and empty GSAP
         * targets log "target not found" on every visit. */
        const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
        if (hero) {
          const heroBars = gsap.utils.toArray<HTMLElement>(
            '[data-anim="hero"] [data-anim="redact-bar"]',
          );
          const heroCopy = gsap.utils.toArray<HTMLElement>(
            '[data-anim="hero"] [data-anim="hero-copy"]',
          );
          const heroPortrait = hero.querySelector<HTMLElement>(
            '[data-anim="hero-portrait"]',
          );
          const heroBody = hero.querySelector<HTMLElement>('[data-anim="hero-body"]');

          const intro = gsap.timeline({ defaults: { ease: "power3.inOut" } });

          if (heroBars.length) {
            intro.fromTo(
              heroBars,
              { scaleX: 1 },
              { scaleX: 0, duration: 0.85, stagger: 0.12 },
              0.15,
            );
          }
          if (heroPortrait) {
            intro.from(
              heroPortrait,
              { opacity: 0, scale: 1.06, duration: 1.4, ease: "power2.out" },
              0,
            );
          }
          if (heroCopy.length) {
            intro.from(
              heroCopy,
              { opacity: 0, y: 24, duration: 0.7, stagger: 0.08, ease: "power2.out" },
              "-=0.45",
            );
          }

          if (heroBody) {
            gsap.to(heroBody, {
              y: -80,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        }

        /* Section headings: redaction bars pull off the title (signature),
         * then the lead develops through a line mask. Bars alone stay for
         * heads without a lead (e.g. contact). */
        gsap.utils
          .toArray<HTMLElement>('[data-anim="reveal-head"]')
          .forEach((head) => {
            const bars = head.querySelectorAll('[data-anim="redact-bar"]');
            const leads = head.querySelectorAll<HTMLElement>(":scope > p");
            if (bars.length) {
              gsap.fromTo(
                bars,
                { scaleX: 1 },
                {
                  scaleX: 0,
                  duration: 0.8,
                  stagger: 0.1,
                  ease: "power3.inOut",
                  scrollTrigger: { trigger: head, start: "top 82%", once: true },
                },
              );
            }
            if (leads.length) {
              gsap.fromTo(
                leads,
                { clipPath: "inset(0 0 100% 0)", y: 12 },
                {
                  clipPath: "inset(0 0 -12% 0)",
                  y: 0,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: "power3.out",
                  scrollTrigger: { trigger: head, start: "top 82%", once: true },
                },
              );
            }
          });

        /* Media drifts inside its frame so image and type travel at different
         * rates. The frame clips; the scale reserves the travel distance. */
        gsap.utils
          .toArray<HTMLElement>('[data-anim="parallax"]')
          .forEach((frame) => {
            const img = frame.querySelector("img");
            if (!img) return;
            gsap.fromTo(
              img,
              { yPercent: -7, scale: 1.16 },
              {
                yPercent: 7,
                scale: 1.16,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

        /* Statement: pins and pulls lines apart with 3D scale, drift, and gradient glow */
        const statement = document.querySelector<HTMLElement>(
          '[data-anim="statement"]',
        );
        if (statement) {
          const line1 = statement.querySelector<HTMLElement>('[data-anim="statement-line-1"]');
          const line2 = statement.querySelector<HTMLElement>('[data-anim="statement-line-2"]');
          const fill = statement.querySelector<HTMLElement>('.statement-fill');
          const badge = statement.querySelector<HTMLElement>('[data-anim="statement-badge"]');
          const meta = statement.querySelector<HTMLElement>('[data-anim="statement-meta"]');

          const stTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: statement,
                start: "top 12%",
                end: "+=48%",
                pin: true,
                scrub: 0.45,
                anticipatePin: 1,
              },
            });

          if (line1) {
            stTl.fromTo(
              line1,
              { xPercent: -3, scale: 1, opacity: 1 },
              { xPercent: 2, scale: 1.02, opacity: 1, ease: "none" },
              0,
            );
          }

          if (line2) {
            stTl.fromTo(
              line2,
              { xPercent: 3, scale: 1, opacity: 1 },
              { xPercent: -2, scale: 1.02, opacity: 1, ease: "none" },
              0,
            );
          }

          if (fill) {
            stTl.fromTo(
              fill,
              { filter: "brightness(0.8) drop-shadow(0 0 0px rgba(184,131,236,0))" },
              { filter: "brightness(1.25) drop-shadow(0 0 24px rgba(184,131,236,0.5))", ease: "none" },
              0,
            );
          }

          if (badge) {
            stTl.fromTo(
              badge,
              { opacity: 0.4, y: 10 },
              { opacity: 1, y: 0, ease: "none" },
              0,
            );
          }

          if (meta) {
            stTl.fromTo(
              meta,
              { opacity: 0.4, y: -10 },
              { opacity: 1, y: 0, ease: "none" },
              0,
            );
          }
        }

        /* Cards rise and sharpen as their row enters. The blur stays at 6px —
         * heavy blur is the expensive kind. Replaces the IntersectionObserver
         * fade so the two do not both own the same transform. */
        gsap.utils.toArray<HTMLElement>('[data-anim="stagger"]').forEach((group) => {
          gsap.from(group.children, {
            opacity: 0,
            y: 32,
            filter: "blur(6px)",
            duration: 0.8,
            stagger: 0.09,
            ease: "power2.out",
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          });
        });

        /* Line-mask entrances — text develops upward through a clip. For the
         * case-study header, the one page family without redaction bars. */
        gsap.utils.toArray<HTMLElement>('[data-anim="mask-in"]').forEach((group) => {
          gsap.fromTo(
            group.children,
            { clipPath: "inset(0 0 100% 0)", y: 14 },
            {
              clipPath: "inset(0 0 -12% 0)",
              y: 0,
              duration: 0.9,
              stagger: 0.09,
              ease: "power3.out",
              scrollTrigger: { trigger: group, start: "top 85%", once: true },
            },
          );
        });

        /* Media develops on entry: the frame clips open bottom-up while the
         * image settles from slightly oversized. Entrance only — frames that
         * also carry `parallax` are excluded, since parallax reserves the
         * image's scale for travel. */
        gsap.utils.toArray<HTMLElement>('[data-anim="media-in"]').forEach((frame) => {
          const img = frame.querySelector("img");
          gsap.fromTo(
            frame,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0% 0 0% 0)",
              duration: 1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: frame, start: "top 82%", once: true },
            },
          );
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.12 },
              {
                scale: 1,
                duration: 1.3,
                ease: "power3.out",
                scrollTrigger: { trigger: frame, start: "top 82%", once: true },
              },
            );
          }
        });
      });

      /* The WebGL stage and the chat both change page height after mount. */
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
