import { cookies } from "next/headers";

export async function getUsername(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("username")?.value;
}
