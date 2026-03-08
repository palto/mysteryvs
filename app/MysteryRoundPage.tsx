"use client";
import { useMutation } from "@liveblocks/react/suspense";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import { Button } from "@/components/ui/button";
import { useHost, useStartTime } from "@/app/mysteryhooks";
import { WakeLock } from "@/app/WakeLock";
import Link from "next/link";

export function MysteryRoundPage() {
  const host = useHost();
  const unsetHost = useUnsetHost();
  const startTime = useStartTime();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-(family-name:--font-geist-sans)">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          Seuraa turnauksen edistymistä{" "}
          <Link href="https://docs.google.com/spreadsheets/d/1SqQ6xzUvr1K-nnNueDl90F8mpMyQRdzCWssQ8N09mbA/edit#gid=1460718855">
            Google sheetsistä
          </Link>
        </div>

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

        <WakeLock />
      </main>
    </div>
  );
}

function useUnsetHost() {
  return useMutation(({ storage }) => {
    storage.set("host", null);
  }, []);
}
