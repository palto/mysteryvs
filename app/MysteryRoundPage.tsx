"use client";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { useHost, useStartTime } from "@/app/mysteryhooks";

export function MysteryRoundPage({ username }: { username: string }) {
  const tournamentName = useStorage((root) => root.name);
  const host = useHost();
  const unsetHost = useUnsetHost();
  const startTime = useStartTime();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>
          {username}, tervetuloa turnaukseen {tournamentName}
          <Button variant="link" onClick={logout}>
            Vaihda pelaajaa!
          </Button>
        </h1>

        {host && (
          <h2>
            Kierroksen järjestäjä: {host}
            {!startTime && (
              <Button onClick={unsetHost} variant="link">
                Vaihda!
              </Button>
            )}
          </h2>
        )}

        {!host && <h2>Valitse seuraavan kierroksen järjestäjä</h2>}

        <Timer />

        <Participants />
      </main>
    </div>
  );
}

function useUnsetHost() {
  return useMutation(({ storage }) => {
    storage.set("host", null);
  }, []);
}
