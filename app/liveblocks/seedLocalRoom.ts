import { Liveblocks, LiveblocksError } from "@liveblocks/node";

import { room as ROOM_ID } from "@/app/constants";
import {
  INITIAL_TOURNAMENT_NAME,
  INITIAL_TOURNAMENT_DESCRIPTION,
  INITIAL_PARTICIPANTS,
} from "@/app/liveblocks/initialStorageData";

// Seeds the tournament room on a local Liveblocks dev server
// (`npm run dev:liveblocks`), so server components like TopNav and the login
// page don't 404 before any client has connected. Called from
// instrumentation.ts on every Next.js server boot; no-ops unless
// NEXT_PUBLIC_LIVEBLOCKS_BASE_URL is set (i.e. developing against a local
// dev server rather than the Liveblocks cloud), and does nothing if the
// room already exists.
export async function seedLocalLiveblocksRoomIfNeeded() {
  const baseUrl = process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL;
  if (!baseUrl) return;

  // The dev server only ever accepts the magic "sk_localdev" key, so don't
  // use LIVEBLOCKS_SECRET here — it could be a real key.
  const liveblocks = new Liveblocks({ secret: "sk_localdev", baseUrl });

  if (await roomExists(liveblocks)) return;

  try {
    await liveblocks.createRoom(ROOM_ID, { defaultAccesses: [] });
    await liveblocks.initializeStorageDocument(ROOM_ID, {
      liveblocksType: "LiveObject",
      data: {
        name: INITIAL_TOURNAMENT_NAME,
        description: INITIAL_TOURNAMENT_DESCRIPTION,
        participants: {
          liveblocksType: "LiveList",
          data: INITIAL_PARTICIPANTS,
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
    });
    console.log(`[liveblocks] Seeded local room "${ROOM_ID}" at ${baseUrl}`);
  } catch {
    console.warn(
      `[liveblocks] Could not reach the local dev server at ${baseUrl}. ` +
        `Start it with \`npm run dev:liveblocks\` in another terminal. ` +
        `The app will fail to load Liveblocks data until it's running.`,
    );
  }
}

async function roomExists(liveblocks: Liveblocks) {
  try {
    await liveblocks.getRoom(ROOM_ID);
    return true;
  } catch (error) {
    if (error instanceof LiveblocksError && error.status === 404) {
      return false;
    }
    // Dev server unreachable or some other error — treat as "doesn't exist"
    // so the createRoom/initializeStorageDocument attempt below can surface
    // (and report) the real failure.
    return false;
  }
}
