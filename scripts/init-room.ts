import { loadEnvConfig } from "@next/env";

// Load .env / .env.local BEFORE importing modules that read process.env at
// module-eval time (constants.ts reads NEXT_PUBLIC_LIVEBLOCKS_ROOM;
// liveblocks.ts reads LIVEBLOCKS_SECRET). Hence the dynamic imports below.
loadEnvConfig(process.cwd());

async function main() {
  const { liveblocks } = await import("../app/liveblocks/liveblocks");
  const { room } = await import("../app/constants");
  const { initialStoragePlainLson } =
    await import("../app/liveblocks/initialStorage");

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const storage = await liveblocks.getStorageDocument(room, "plain-lson");
  const isEmpty = !storage.data || Object.keys(storage.data).length === 0;

  if (isEmpty) {
    await liveblocks.initializeStorageDocument(room, initialStoragePlainLson);
    console.log(`Initialized room "${room}" with default storage.`);
  } else {
    console.log(`Room "${room}" already has storage — left untouched.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
