"use client";

import { ParticipantLoginButton } from "@/app/login/ParticipantLoginButton";
import { NewPlayerDrawer } from "@/app/login/NewPlayerDrawer";
import { useParticipants } from "@/app/Participants";
import { EditableTournamentTitle } from "@/app/EditableTournamentTitle";
import { EditableTournamentDescription } from "@/app/EditableTournamentDescription";

export function LoginClientPage() {
  const participants = useParticipants();

  return (
    <div className="flex flex-col items-center px-4 py-12 gap-12 max-w-2xl mx-auto">
      {/* Welcome hero */}
      <div className="flex flex-col items-center gap-2">
        <EditableTournamentTitle />
        <EditableTournamentDescription />
      </div>

      {/* Participant selection */}
      <div className="w-full">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">
          Valitse pelaajasi
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {participants.map((participant) => (
            <ParticipantLoginButton
              key={participant.id}
              username={participant.id}
            />
          ))}
          <NewPlayerDrawer />
        </div>
      </div>
    </div>
  );
}
