// Seeds the local Liveblocks dev server (`npm run dev:liveblocks`) with the
// tournament room so server components like TopNav and the login page don't
// 404 before the first client has connected. Safe to run repeatedly: it skips
// rooms whose storage is already initialized.
//
// Usage: npm run dev:liveblocks:seed
import { Liveblocks, LiveblocksError } from "@liveblocks/node";

// Must match `room` in app/constants.ts.
const ROOM_ID = "hevilan:pti-2025-syksy";

const baseUrl =
  process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL ?? "http://localhost:1153";

// The dev server only ever accepts the magic "sk_localdev" key, so don't
// inherit LIVEBLOCKS_SECRET from the environment — it could be a real key.
const liveblocks = new Liveblocks({ secret: "sk_localdev", baseUrl });

// Mirrors the `initialStorage` in app/Room.tsx.
const initialStorage = {
  liveblocksType: "LiveObject",
  data: {
    name: "PTI Mysteeri 2025",
    description: "",
    participants: {
      liveblocksType: "LiveList",
      data: ["murgo", "Janne", "grrooovy", "Alex (VE's)", "Maksi", "GinToni"],
    },
    startTime: null,
    completedTime: null,
    participantTimes: { liveblocksType: "LiveMap", data: {} },
    participantScores: { liveblocksType: "LiveMap", data: {} },
    host: null,
    roundLength: null,
    roundType: null,
    roundInstructions: null,
    hostRounds: { liveblocksType: "LiveMap", data: {} },
  },
};

try {
  await liveblocks.createRoom(ROOM_ID, { defaultAccesses: [] });
  console.log(`Created room "${ROOM_ID}"`);
} catch (error) {
  if (error instanceof LiveblocksError && error.status === 409) {
    console.log(`Room "${ROOM_ID}" already exists`);
  } else {
    throw error;
  }
}

try {
  await liveblocks.initializeStorageDocument(ROOM_ID, initialStorage);
  console.log(`Initialized storage for "${ROOM_ID}"`);
} catch (error) {
  if (error instanceof LiveblocksError && error.status === 409) {
    console.log(`Storage for "${ROOM_ID}" already initialized, leaving as-is`);
  } else {
    throw error;
  }
}

console.log(`Done. Local Liveblocks at ${baseUrl} is ready.`);
