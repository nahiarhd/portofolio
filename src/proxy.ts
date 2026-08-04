import { NextResponse, type NextRequest } from "next/server";

import { LOCALES, resolveLocale } from "@/lib/locale";

/**
 * Locale detection and redirect. There is no auth on this site.
 *
 * Any path that does not already start with a supported locale is redirected
 * under one. That guarantees every request reaching `app/[lang]/*` has a valid
 * `lang`, so no page has to defend against a bogus locale: `/fr/about` becomes
 * `/en/fr/about` and 404s normally, instead of reaching a layout that would try
 * to load a dictionary that does not exist.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Skip Next internals, API routes, and anything with a file extension
   * (favicon, images, robots.txt) — none of those belong under a locale prefix.
   *
   * `api` is not optional: without it, `POST /api/chat` is 307-redirected to
   * `/en/api/chat`, the route never runs, and the chat is dead. A redirect also
   * turns the POST into a GET, so the failure looks like a routing bug rather
   * than a proxy one.
   */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
