import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Participant } from "@/app/participants";
import { useMutation } from "@liveblocks/react/suspense";
import {
  useIsRunning,
  useParticipantTime,
  useStartTime,
} from "@/app/mysteryhooks";

export function ParticipantNameButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  const isRunning = useIsRunning();
  const startTime = useStartTime();

  const participantFinish = useParticipantFinish(participant.id);

  return (
    <>
      {!completedTime && isRunning && (
        <Button onClick={participantFinish}>
          {participant.name.toUpperCase()}!!!
        </Button>
      )}
      {(completedTime || !isRunning) && (
        <>
          {participant.name}&nbsp;
          {startTime &&
            completedTime &&
            format(completedTime - startTime, "mm:ss:SSS")}
          {startTime && !completedTime && <>DNF</>}
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
