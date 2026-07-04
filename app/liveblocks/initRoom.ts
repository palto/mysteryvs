import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";
import { initialStoragePlainLson } from "@/app/liveblocks/initialStorage";

export async function initRoom() {
  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const storage = await liveblocks.getStorageDocument(room, "plain-lson");
  const isEmpty = !storage.data || Object.keys(storage.data).length === 0;

  if (isEmpty) {
    await liveblocks.initializeStorageDocument(room, initialStoragePlainLson);
    console.log(`Initialized room "${room}" with default storage.`);
  }
}
