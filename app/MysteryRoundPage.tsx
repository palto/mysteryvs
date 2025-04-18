"use client";
import { useStorage } from "@liveblocks/react/suspense";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/participants";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

export function MysteryRoundPage({ username }: { username: string }) {
  const tournamentName = useStorage((root) => root.name);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>{tournamentName}</h1>

        <h2>
          Tervetuloa {username}{" "}
          <Button variant="link" onClick={logout}>
            Vaihda!
          </Button>{" "}
        </h2>

        <h2>Ajastin!</h2>
        <Timer />

        <h2>Osallistujat</h2>
        <Participants />
      </main>
    </div>
  );
}
