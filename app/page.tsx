import { Room } from "@/app/Room";
import { MysteryRoundPageDynamicWrapper } from "@/app/MysteryRoundPageDynamicWrapper";
import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";

export default async function Home() {
  const username = await getUsername();
  if (!username) {
    return redirect("/login");
  }
  return (
    <Room>
      <MysteryRoundPageDynamicWrapper />
    </Room>
  );
}
