import { Participant } from "@/app/Participants";
import { Button } from "@/components/ui/button";
import {
  useHost,
  useIsRunning,
  useParticipantTime,
  useStartTime,
} from "@/app/mysteryhooks";
import { useMutation } from "@liveblocks/react/suspense";

export function ParticipantActionButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  const unFinish = useParticipantUnFinish(participant.id);
  const isRunning = useIsRunning();
  const startTime = useStartTime();
  const host = useHost();
  const setHost = useSetHost(participant.id);
  return (
    <>
      {isRunning && completedTime && (
        <Button variant="link" onClick={unFinish}>
          Huijasi!
        </Button>
      )}
      {!startTime && !host && (
        <Button onClick={setHost} variant="link">
          Järjestäjä
        </Button>
      )}
    </>
  );
}

function useParticipantUnFinish(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.get("participantTimes").delete(id);
    },
    [id],
  );
}

function useSetHost(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.set("host", id);
    },
    [id],
  );
}
