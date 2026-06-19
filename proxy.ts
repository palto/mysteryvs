import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/app/login/session";

/**
 * Issues a signed session to every visitor before they've logged in.
 *
 * The session carries a server-generated `uid` — a stable, unguessable per-user
 * identity distinct from the freely-chosen player `username`. Because it's a
 * signed JWT, the client can't set or alter its own uid the way it could with a
 * plain cookie. Server code keys per-user external resources (the Composio /
 * Google connection, and anything we add later) on this id, so impersonating a
 * player name does not grant access to another person's connected accounts.
 * Logging in later adds `username` to this same session, keeping the uid.
 */
export async function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const token = await createSessionToken({ uid: crypto.randomUUID() });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}

export const config = {
  // Run on page navigations only; skip API routes, static assets and metadata
  // files. The session only needs to exist by the time a page loads — the
  // cookie is then sent on the subsequent requests that actually consume it.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
