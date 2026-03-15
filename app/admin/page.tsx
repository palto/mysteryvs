import { getParticipants } from "@/app/login/getParticipants";
import { AdminPage } from "@/app/admin/AdminPage";
import { TopNav } from "@/app/TopNav";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";
import { Room } from "@/app/Room";

export default async function AdminPageServer() {
  const [participants, storage] = await Promise.all([
    getParticipants(),
    liveblocks.getStorageDocument(room, "json"),
  ]);
  return (
    <>
      <TopNav />
      <Room>
        <AdminPage
          participants={participants}
          name={storage.name}
          description={storage.description ?? ""}
          roundLength={storage.roundLength ?? 20 * 60 * 1000}
        />
      </Room>
    </>
  );
}
