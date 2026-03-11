import { Card, CardContent } from "@/components/ui/card";
import _ from "lodash";
import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import { useHost, useStartTime } from "@/app/mysteryhooks";
import { format } from "date-fns";

export function Participants() {
  const host = useHost();
  const startTime = useStartTime();
  let participants = useParticipants();
  participants = participants.filter((p) => p.id !== host);

  if (!host && !startTime) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {participants.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}
      </div>
    );
  }

  const inProgress = participants.filter((p) => !p.completedTime);
  const finished = _.sortBy(
    participants.filter((p) => p.completedTime),
    ["completedTime"],
  );

  return (
    <div className="grid grid-cols-2 gap-6 w-full">
      <div>
        <h2 className="text-lg font-semibold mb-3">Matkalla</h2>
        <div className="flex flex-col gap-2">
          {inProgress.map((participant) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
            />
          ))}
          {inProgress.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              Kaikki maalissa!
            </p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Maalissa</h2>
        <div className="flex flex-col gap-2">
          {finished.map((participant) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
            />
          ))}
          {finished.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              Ei vielä ketään
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoundParticipantCard({
  participant,
  startTime,
}: {
  participant: Participant;
  startTime: number | null;
}) {
  const finish = useParticipantFinish(participant.id);
  const unFinish = useParticipantUnFinish(participant.id);
  const isFinished = !!participant.completedTime;

  return (
    <button
      onClick={isFinished ? unFinish : finish}
      className="w-full text-left"
    >
      <Card
        className={`w-full cursor-pointer hover:bg-accent transition-colors ${isFinished ? "border-green-500" : ""}`}
      >
        <CardContent className="flex items-center justify-between py-3 px-4 pt-3">
          <span className="text-base font-medium">{participant.name}</span>
          {isFinished && startTime && participant.completedTime && (
            <span className="text-sm text-muted-foreground font-mono">
              {format(participant.completedTime - startTime, "mm:ss")}
            </span>
          )}
        </CardContent>
      </Card>
    </button>
  );
}

function ParticipantCard({ participant }: { participant: Participant }) {
  const setHost = useMutation(
    ({ storage }) => {
      storage.set("host", participant.id);
    },
    [participant.id],
  );

  return (
    <button onClick={setHost} className="w-full">
      <Card className="w-full h-20 cursor-pointer hover:bg-accent transition-colors">
        <CardContent className="flex items-center justify-center h-full pt-6">
          <span className="text-xl font-semibold">{participant.name}</span>
        </CardContent>
      </Card>
    </button>
  );
}

export interface Participant {
  id: string;
  name: string;
  completedTime?: number;
}

export function useParticipants(): Participant[] {
  return useStorage(
    (root) =>
      root.participants.map((p) => ({
        id: p,
        name: p,
        completedTime: root.participantTimes.get(p),
      })),
    shallow,
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

function useParticipantUnFinish(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.get("participantTimes").delete(id);
    },
    [id],
  );
}
