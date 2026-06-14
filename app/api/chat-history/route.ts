import { getUserId } from "@/app/userId";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) {
    return Response.json([]);
  }

  const storage = await liveblocks.getStorageDocument(room, "json");
  const chatHistories = (storage.chatHistories ?? {}) as Record<string, string>;
  const raw = chatHistories[uid];

  if (!raw) {
    return Response.json([]);
  }

  try {
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json([]);
  }
}
