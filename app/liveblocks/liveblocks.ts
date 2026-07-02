import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
  // Point at a local `npx liveblocks dev` server instead of the Liveblocks
  // cloud. Undefined (the default) means the cloud endpoint is used.
  baseUrl: process.env.LIVEBLOCKS_BASE_URL,
});
