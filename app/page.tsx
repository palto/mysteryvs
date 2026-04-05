import { Room } from "@/app/Room";
import { getUsername } from "@/app/login/getUsername";
import { redirect } from "next/navigation";
import { TopNav } from "@/app/TopNav";
import { GameContent } from "@/app/GameContent";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";

export default async function Home() {
  const username = await getUsername();
  if (!username) {
    return redirect("/login");
  }
  const storage = await liveblocks
    .getStorageDocument(room, "json")
    .catch(() => null);
  return (
    <Room>
      <TopNav title={storage?.name} />
      <GameContent />
    </Room>
  );
}
