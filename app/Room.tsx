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

export function Room({
  nav,
  children,
}: {
  nav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      // Point at a local `npx liveblocks dev` server instead of the Liveblocks
      // cloud. Undefined (the default) means the cloud endpoint is used.
      baseUrl={process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL}
      badgeLocation="bottom-left"
    >
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
          roundInstructions: null,
          hostRounds: new LiveMap(),
        }}
      >
        {nav}
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
