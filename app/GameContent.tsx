"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { MysteryRoundPage } from "@/app/MysteryRoundPage";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center px-4 py-8 gap-8 sm:py-12">
      <main className="flex flex-col gap-6 w-full max-w-2xl animate-pulse">
        <div className="h-12 bg-muted rounded-xl w-2/3" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="flex flex-col gap-3">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </main>
    </div>
  );
}

export function GameContent() {
  return (
    <ClientSideSuspense fallback={<LoadingSkeleton />}>
      <MysteryRoundPage />
    </ClientSideSuspense>
  );
}
