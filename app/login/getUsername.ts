import { getSession } from "@/app/login/getSession";

export async function getUsername(): Promise<string | undefined> {
  return (await getSession())?.username;
}
