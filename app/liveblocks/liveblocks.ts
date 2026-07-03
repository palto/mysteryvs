import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
  // The dev server only ever accepts "sk_localdev". next.config.ts only
  // leaves LIVEBLOCKS_SECRET unset when it has confirmed (by detecting the
  // local dev server, or a manually configured base URL) that local mode is
  // in play, so defaulting here is safe.
  secret: process.env.LIVEBLOCKS_SECRET ?? "sk_localdev",
  // Point at a local `npx liveblocks dev` server instead of the Liveblocks
  // cloud. Undefined (the default) means the cloud endpoint is used. Reuses
  // the NEXT_PUBLIC_ variable (also read by the browser client in Room.tsx)
  // since a base URL isn't secret and this avoids configuring it twice.
  baseUrl: process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL,
});
