import { room } from "@/app/constants";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function getParticipants() {
  const storage = await liveblocks.getStorageDocument(room, "json");
  return storage.participants;
}
