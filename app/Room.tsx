"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveList } from "@liveblocks/client";

const defaultParticipants = [
  "Anssi",
  "Antti",
  "Eetu",
  "Jarkko",
  "Jussi",
  "Juuso",
  "Jörö",
  "Lauri",
  "Pyry",
  "Toni",
];

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id="hevilan:lanit-2025-kevat"
        initialStorage={{
          name: "Lanit 2025",
          participants: new LiveList(defaultParticipants),
          startTime: null,
          completedTime: null,
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
