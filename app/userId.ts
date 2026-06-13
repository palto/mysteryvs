import { cookies } from "next/headers";

/**
 * Cookie holding the stable, unguessable per-user id.
 *
 * Distinct from the `username` cookie: `username` is the freely-chosen player
 * the user is showing as (forgeable, fine), while this is the user's secret
 * identity used to scope per-user external resources. Issued by `proxy.ts`.
 */
export const USER_ID_COOKIE = "uid";

/**
 * Reads the current user's id. May be undefined if the cookie has not been
 * issued yet — callers must handle that case rather than assuming it exists.
 */
export async function getUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_ID_COOKIE)?.value;
}
