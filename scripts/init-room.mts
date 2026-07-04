import nextEnv from "@next/env";

// Load .env / .env.local BEFORE importing modules that read process.env at
// module-eval time (constants.ts reads NEXT_PUBLIC_LIVEBLOCKS_ROOM;
// liveblocks.ts reads LIVEBLOCKS_SECRET). Hence the dynamic import below.
nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const { initRoom } = await import("../app/liveblocks/initRoom.ts");
  await initRoom();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
