"use server";
import { cookies } from "next/headers";

/**
 * Sets a cookie "username" that identifies the user for all the requests
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
  cookieStore.set("username", username);
  console.log(`User ${username} logged in`);
}

export async function logout() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;
  console.log(`User ${username} logged out`);
  cookieStore.delete("username");
}
