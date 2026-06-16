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
  const cookieStore = await cookies();
  if (!username) {
    throw new Error("Username is required");
  }
  const token = await createSessionToken(username);
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
  console.log(`User ${username} logged in`);
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const username = token
    ? (await verifySessionToken(token))?.username
    : undefined;
  console.log(`User ${username} logged out`);
  cookieStore.delete(SESSION_COOKIE);
}
