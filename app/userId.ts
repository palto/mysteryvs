import { getSession } from "@/app/login/getSession";

/**
 * Reads the current user's stable, unguessable id. Distinct from the
 * freely-chosen player `username`: this is the secret identity used to scope
 * per-user external resources. May be undefined if the session has not been
 * issued yet — callers must handle that case rather than assuming it exists.
 */
export async function getUserId(): Promise<string | undefined> {
  return (await getSession())?.sub;
}
