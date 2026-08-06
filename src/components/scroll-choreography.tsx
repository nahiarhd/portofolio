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
         * `fromTo` with scaleX 1 -> 0 keeps the resting state readable. */
        const heroBars = gsap.utils.toArray<HTMLElement>(
          '[data-anim="hero"] [data-anim="redact-bar"]',
        );
        const heroCopy = gsap.utils.toArray<HTMLElement>(
          '[data-anim="hero"] [data-anim="hero-copy"]',
        );

        const intro = gsap.timeline({ defaults: { ease: "power3.inOut" } });

        intro
          .fromTo(
            heroBars,
            { scaleX: 1 },
            { scaleX: 0, duration: 0.85, stagger: 0.12 },
            0.15,
          )
          .from(
            '[data-anim="hero-portrait"]',
            { opacity: 0, scale: 1.06, duration: 1.4, ease: "power2.out" },
            0,
          )
          .from(
            heroCopy,
            { opacity: 0, y: 24, duration: 0.7, stagger: 0.08, ease: "power2.out" },
            "-=0.45",
          );

        /* Hero leaves under the next section rather than just scrolling off. */
        gsap.to('[data-anim="hero"] > div:last-child', {
          y: -80,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-anim="hero"]',
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        /* Section headings get the same wipe, once, on the way in. */
        gsap.utils
          .toArray<HTMLElement>('[data-anim="reveal-head"]')
          .forEach((head) => {
            const bars = head.querySelectorAll('[data-anim="redact-bar"]');
            if (!bars.length) return;
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

        /* Statement pins briefly and pulls its two lines apart as you scroll. */
        const statement = document.querySelector<HTMLElement>(
          '[data-anim="statement"]',
        );
        if (statement) {
          const lines = statement.querySelectorAll('[data-anim="statement-line"]');
          gsap
            .timeline({
              scrollTrigger: {
                trigger: statement,
                start: "top top",
                end: "+=70%",
                pin: true,
                scrub: 0.4,
                anticipatePin: 1,
              },
            })
            .fromTo(
              lines[0]!,
              { xPercent: 0 },
              { xPercent: -6, ease: "none" },
              0,
            )
            .fromTo(lines[1]!, { xPercent: 0 }, { xPercent: 9, ease: "none" }, 0);
        }

        /* Cards rise as their row enters. Replaces the IntersectionObserver
         * fade so the two do not both own the same transform. */
        gsap.utils.toArray<HTMLElement>('[data-anim="stagger"]').forEach((group) => {
          gsap.from(group.children, {
            opacity: 0,
            y: 40,
            duration: 0.7,
            stagger: 0.09,
            ease: "power2.out",
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          });
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
