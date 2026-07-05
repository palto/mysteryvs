"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getSession } from "@/app/login/getSession";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/app/login/session";
import { room } from "@/app/constants";
import { liveblocks } from "@/app/liveblocks/liveblocks";

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
  const existingSession = await getSession();

  const token = await createSessionToken({ ...existingSession, username });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
  console.info(`User ${username} logged in`);
}

export async function addParticipant(data: FormData) {
  const username = (data.get("username") as string)?.trim();
  if (!username) {
    throw new Error("Username is required");
  }
  await liveblocks.mutateStorage(room, async ({ root }) => {
    const participants = root.get("participants");
    if (participants.findIndex((p) => p === username) !== -1) {
      throw new Error("Username already exists");
    }
    participants.push(username);
    console.log(`Added participant ${username}`);
  });
  revalidatePath("/login");
}

export async function logout() {
  const session = await getSession();
  console.info(`User ${session?.username} logged out`);

  const cookieStore = await cookies();
  if (session?.sub) {
    const anonymousToken = await createSessionToken({ sub: session.sub });
    cookieStore.set(SESSION_COOKIE, anonymousToken, sessionCookieOptions);
  } else {
    cookieStore.delete(SESSION_COOKIE);
  }
}
