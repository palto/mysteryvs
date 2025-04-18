"use client";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/ui/timer";

export function MysteryRoundPage(props: { username: string }) {
  const username = props.username;
  const tournamentName = useStorage((root) => root.name);
  const participants = useStorage((root) => root.participants);
  const addParticipant = useMutation(
    ({ storage }) => {
      storage.get("participants").push(username);
    },
    [username],
  );
  const isParticipated = participants.includes(username);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>{tournamentName}</h1>

        <h2>Ajastin!</h2>
        <Timer />

        <h2>Osallistujat</h2>
        {participants.map((participant) => (
          <div key={participant}>{participant}</div>
        ))}
        <Button disabled={isParticipated} onClick={addParticipant}>
          Osallistu!
        </Button>
      </main>
    </div>
  );
}
