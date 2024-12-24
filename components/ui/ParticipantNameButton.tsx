import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { store, useParticipantTime, useStartTime } from "@/app/mysterystore";
import { Participant } from "@/components/ui/participants";

export function ParticipantNameButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  const startTime = useStartTime();

  return (
    <>
      {!completedTime && (
        <Button
          onClick={() =>
            store.send({ type: "finish", participantId: participant.id })
          }
        >
          {participant.name.toUpperCase()}!!!
        </Button>
      )}
      {completedTime && (
        <>
          {participant.name}&nbsp;
          {startTime && format(completedTime - startTime, "mm:ss:SSS")}
        </>
      )}
    </>
  );
}
