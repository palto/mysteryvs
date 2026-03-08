import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";

import { LoginClientPage } from "@/app/login/LoginClientPage";
import { Room } from "@/app/Room";
import { TopNav } from "@/app/TopNav";
import { TournamentName } from "@/app/TournamentName";

export default async function Login() {
  const username = await getUsername();
  if (username) {
    return redirect("/");
  }

  return (
    <Room>
      <TopNav title={<TournamentName />} />
      <LoginClientPage />
    </Room>
  );
}
