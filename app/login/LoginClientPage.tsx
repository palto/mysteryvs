"use client";

import { ParticipantLoginButton } from "@/app/login/ParticipantLoginButton";
import { useParticipants } from "@/app/Participants";
import { useDescription, useName } from "@/app/mysteryhooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LoginClientPage() {
  const participants = useParticipants();
  const tournamentName = useName();
  const description = useDescription();

  return (
    <div className="flex flex-col items-center px-4 py-12 gap-12 max-w-2xl mx-auto">
      {/* Welcome hero */}
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-4xl font-bold">{tournamentName}</h1>
        {description ? (
          <div className="prose prose-sm dark:prose-invert text-center">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground text-base">Tervetuloa mukaan!</p>
        )}
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
        </div>
      </div>
    </div>
  );
}
