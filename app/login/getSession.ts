import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  type Session,
  verifySessionToken,
} from "@/app/login/session";

/**
 * Reads and verifies the current request's session cookie. Returns the decoded
 * session, or `null` when the cookie is missing, tampered with, or expired.
 *
 * This is the single read+verify path for the session: `getUsername`,
 * `getUserId`, and the login/logout actions all build on it, so there is one
 * place to evolve as the session grows.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}
