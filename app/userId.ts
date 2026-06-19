import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "@/app/login/session";

/**
 * Reads the current user's stable, unguessable id. Distinct from the
 * freely-chosen player `username`: this is the secret identity used to scope
 * per-user external resources. May be undefined if the session has not been
 * issued yet — callers must handle that case rather than assuming it exists.
 */
export async function getUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return undefined;
  }
  const session = await verifySessionToken(token);
  return session?.uid;
}
