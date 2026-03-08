"use client";

import { ParticipantLoginButton } from "@/app/login/ParticipantLoginButton";
import { useParticipants } from "@/app/Participants";

export function LoginClientPage() {
  const participants = useParticipants();
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold mb-6">Valitse pelaajasi!</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {participants.toSorted().map((participant) => (
          <div key={participant.id}>
            <ParticipantLoginButton username={participant.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
