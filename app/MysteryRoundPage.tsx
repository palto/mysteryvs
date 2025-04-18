"use client";
import { useStorage } from "@liveblocks/react/suspense";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/components/ui/participants";

export function MysteryRoundPage() {
  const tournamentName = useStorage((root) => root.name);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>{tournamentName}</h1>

        <h2>Ajastin!</h2>
        <Timer />

        <h2>Osallistujat</h2>
        <Participants />
      </main>
    </div>
  );
}
