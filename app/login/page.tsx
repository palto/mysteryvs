import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";

import { LoginClientPage } from "@/app/login/LoginClientPage";

export default async function Login() {
  const username = await getUsername();
  if (username) {
    return redirect("/");
  }

  return <LoginClientPage />;
}
