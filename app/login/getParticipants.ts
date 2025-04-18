import { liveblocks } from "@/app/api/liveblocks-auth/route";
import { room } from "@/app/constants";

export async function getParticipants() {
  const storage = await liveblocks.getStorageDocument(room, "json");
  return storage.participants;
}
