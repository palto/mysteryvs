import { getSession } from "@/app/login/getSession";

/**
 * Reads the current user's stable, server-issued id. Distinct from the
 * freely-chosen player `username`: it is set by the server and carried in a
 * signed session, so it is the trustworthy identity used to scope per-user
 * external resources. May be undefined if the session has not been issued yet
 * — callers must handle that case rather than assuming it exists.
 */
export async function getUserId(): Promise<string | undefined> {
  return (await getSession())?.sub;
}
