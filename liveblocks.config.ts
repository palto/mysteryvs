// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
import { LiveList, LiveMap } from "@liveblocks/client";

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Presence: {
      // Example, real-time cursor coordinates
      // cursor: { x: number; y: number };
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      name: string;
      description: string;
      participants: LiveList<string>;
      startTime: number | null;
      completedTime: number | null;
      participantTimes: LiveMap<string, number>;
      participantScores: LiveMap<string, number>;
      host: string | null;
      roundLength: number | null;
      roundType: string | null;
      roundInstructions: string | null;
      instructionsReady: boolean | null;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RoomEvent: {};
    // Example has two events, using a union
    // | { type: "PLAY" }
    // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    };
  }
}

export {};
