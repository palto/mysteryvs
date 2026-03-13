"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveList, LiveMap } from "@liveblocks/client";
import { room } from "@/app/constants";

const defaultParticipants = [
  "murgo",
  "Janne",
  "grrooovy",
  "Alex (VE's)",
  "Maksi",
  "GinToni",
];

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={room}
        initialStorage={{
          name: "PTI Mysteeri 2025",
          description: "",
          participants: new LiveList(defaultParticipants),
          startTime: null,
          completedTime: null,
          participantTimes: new LiveMap(),
          participantScores: new LiveMap(),
          host: null,
          roundLength: null,
          roundType: null,
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
