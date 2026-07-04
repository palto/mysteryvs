"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { room } from "@/app/constants";
import { initialStorage } from "@/app/liveblocks/initialStorage";

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
      badgeLocation="bottom-left"
    >
      <RoomProvider id={room} initialStorage={initialStorage()}>
        {nav}
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
