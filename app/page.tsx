import { Room } from "@/app/Room";
import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";
import { MysteryRoundPage } from "@/app/MysteryRoundPage";
import { TopNav } from "@/app/TopNav";
import { TournamentName } from "@/app/TournamentName";

export default async function Home() {
  const username = await getUsername();
  if (!username) {
    return redirect("/login");
  }
  return (
    <Room>
      <TopNav title={<TournamentName />} />
      <MysteryRoundPage />
    </Room>
  );
}
