import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate only — a cookie *presence* check, no DB read and no crypto,
 * so it stays cheap on every navigation. It can be fooled by a forged cookie,
 * which is fine: real authorization lives in the route guards
 * (`requirePortalUser` / `requireAdminUser`). Never treat a passing proxy check
 * as proof a user is authenticated.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
