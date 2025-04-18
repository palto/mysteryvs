import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Participant } from "@/components/ui/participants";
import { useMutation } from "@liveblocks/react/suspense";
import { useParticipantTime, useStartTime } from "@/app/mysteryhooks";

export function ParticipantNameButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  const startTime = useStartTime();

  const participantFinish = useParticipantFinish(participant.id);

  return (
    <>
      {!completedTime && (
        <Button onClick={participantFinish}>
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

function useParticipantFinish(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.get("participantTimes").set(id, Date.now());
    },
    [id],
  );
}
