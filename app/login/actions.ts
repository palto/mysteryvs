"use server";
import { cookies } from "next/headers";

/**
 * Sets a cookie "username" that identifies the user for all the requests
 * @param formData
 */
export async function loginFormSubmit(formData: FormData) {
  const cookieStore = await cookies();

  const username = formData.get("username") as string;
  if (!username) {
    throw new Error("Username is required");
  }
  cookieStore.set("username", username);
}

export async function loginParticipant(username: string) {
  const cookieStore = await cookies();
  if (!username) {
    throw new Error("Username is required");
  }
  cookieStore.set("username", username);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("username");
}
