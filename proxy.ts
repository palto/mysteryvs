import { NextResponse, type NextRequest } from "next/server";

import { USER_ID_COOKIE } from "@/app/userId";

/**
 * Issues a stable, unguessable per-user id to every visitor.
 *
 * The id lives in an httpOnly cookie and acts as the user's secret identity:
 * it cannot be read by client JS or forged the way the freely-chosen player
 * `username` cookie can. Server code keys per-user external resources (the
 * Composio / Google connection, and anything we add later) on this id rather
 * than the player name, so impersonating a player name does not grant access
 * to another person's connected accounts.
 *
 * Issuance only — never treat the presence of this cookie as authorization.
 * Each consumer (e.g. the assistant route) must read it server-side at the
 * point of use and tolerate it being absent.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(USER_ID_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(USER_ID_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  return response;
}

export const config = {
  // Run on page navigations only; skip API routes, static assets and metadata
  // files. The id only needs to exist by the time a page loads — the cookie is
  // then sent on the subsequent requests that actually consume it.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
