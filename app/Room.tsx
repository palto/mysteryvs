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
  "Pyry",
  "Eetu",
  "Jarno",
  "Jarkko",
  "Jussi",
  "Irene",
  "Lauri",
  "Jörö",
  "Toni",
];

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={room}
        initialStorage={{
          name: "Lanit 2025 Syksy",
          participants: new LiveList(defaultParticipants),
          startTime: null,
          completedTime: null,
          participantTimes: new LiveMap(),
          host: null,
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
