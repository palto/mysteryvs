import { Room } from "@/app/Room";
import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";
import { MysteryRoundPage } from "@/app/MysteryRoundPage";
import { TopNav } from "@/app/TopNav";
import { AssistantFAB } from "@/app/AssistantFAB";

export default async function Home() {
  const username = await getUsername();
  if (!username) {
    return redirect("/login");
  }
  return (
    <>
      <TopNav />
      <Room>
        <MysteryRoundPage />
        <AssistantFAB />
      </Room>
    </>
  );
}
