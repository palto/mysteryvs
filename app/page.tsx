import { Room } from "@/app/Room";
import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";
import { MysteryRoundPage } from "@/app/MysteryRoundPage";

export default async function Home() {
  const username = await getUsername();
  if (!username) {
    return redirect("/login");
  }
  return (
    <Room>
      <MysteryRoundPage username={username} />
    </Room>
  );
}
