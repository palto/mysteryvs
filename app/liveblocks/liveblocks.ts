import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
  baseUrl: process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL || undefined,
});
