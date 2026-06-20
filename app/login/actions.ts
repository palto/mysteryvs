"use server";
import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/app/login/session";

/**
 * Sets a signed session cookie that identifies the user for all the requests
 * @param formData
 */
export async function loginFormSubmit(formData: FormData) {
  const username = formData.get("username") as string;

  await loginParticipant(username);
}

export async function loginParticipant(username: string) {
  if (!username) {
    throw new Error("Username is required");
  }
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(SESSION_COOKIE)?.value;
  const existingSession = existingToken
    ? await verifySessionToken(existingToken)
    : null;

  const token = await createSessionToken({ ...existingSession, username });
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
  console.log(`User ${username} logged in`);
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  console.log(`User ${session?.username} logged out`);

  if (session?.uid) {
    const anonymousToken = await createSessionToken({ uid: session.uid });
    cookieStore.set(SESSION_COOKIE, anonymousToken, sessionCookieOptions);
  } else {
    cookieStore.delete(SESSION_COOKIE);
  }
}
