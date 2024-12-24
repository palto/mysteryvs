import { Participant } from "@/components/ui/participants";
import { Button } from "@/components/ui/button";
import { store, useParticipantTime } from "@/app/mysterystore";

export function ParticipantActionButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  return (
    <>
      {completedTime && (
        <Button
          variant="link"
          onClick={() =>
            store.send({ type: "cancel", participantId: participant.id })
          }
        >
          Huijasi!
        </Button>
      )}
      {!completedTime && (
        <Button
          variant="link"
          onClick={() =>
            store.send({
              type: "removeParticipant",
              participantId: participant.id,
            })
          }
        >
          Poista!
        </Button>
      )}
    </>
  );
}
