import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "@/app/login/session";

export async function getUsername(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return undefined;
  }
  const session = await verifySessionToken(token);
  return session?.username;
}
