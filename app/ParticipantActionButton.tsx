import { Participant } from "@/app/participants";
import { Button } from "@/components/ui/button";
import { useIsRunning, useParticipantTime } from "@/app/mysteryhooks";
import { useMutation } from "@liveblocks/react/suspense";

export function ParticipantActionButton({
  participant,
}: {
  participant: Participant;
}) {
  const completedTime = useParticipantTime(participant.id);
  const unFinish = useParticipantUnFinish(participant.id);
  const isRunning = useIsRunning();
  if (!isRunning || !completedTime) {
    return null;
  }
  return (
    <Button variant="link" onClick={unFinish}>
      Huijasi!
    </Button>
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
