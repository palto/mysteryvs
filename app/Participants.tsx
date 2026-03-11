import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import _ from "lodash";
import { ParticipantNameButton } from "@/app/ParticipantNameButton";
import { ParticipantActionButton } from "@/app/ParticipantActionButton";
import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import { useHost, useStartTime } from "@/app/mysteryhooks";

export function Participants() {
  const host = useHost();
  const startTime = useStartTime();
  let participants = useParticipants();
  participants = participants.filter((p) => p.id !== host);

  if (!host && !startTime) {
    return (
      <div className="flex flex-wrap gap-4">
        {participants.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {participants.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nimi</TableHead>
              <TableHead>Toiminnot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {_.sortBy(participants, ["completedTime"]).map((participant) => {
              return (
                <TableRow key={participant.id}>
                  <TableCell>
                    <ParticipantNameButton participant={participant} />
                  </TableCell>
                  <TableCell>
                    <ParticipantActionButton participant={participant} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
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
    <button onClick={setHost}>
      <Card className="w-40 h-24 cursor-pointer hover:bg-accent transition-colors">
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
