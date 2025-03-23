"use server";
import { cookies } from "next/headers";

/**
 * Sets a cookie "username" that identifies the user for all the requests
 * @param formData
 */
export async function login(formData: FormData) {
  const cookieStore = await cookies();

  const username = formData.get("username") as string;
  if (!username) {
    throw new Error("Username is required");
  }
  cookieStore.set("username", username);
}
