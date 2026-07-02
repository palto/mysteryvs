import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
  // Point at a local `npx liveblocks dev` server instead of the Liveblocks
  // cloud. Undefined (the default) means the cloud endpoint is used. Reuses
  // the NEXT_PUBLIC_ variable (also read by the browser client in Room.tsx)
  // since a base URL isn't secret and this avoids configuring it twice.
  baseUrl: process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL,
});
