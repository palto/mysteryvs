import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import _ from "lodash";
import { ParticipantNameButton } from "@/app/ParticipantNameButton";
import { ParticipantActionButton } from "@/app/ParticipantActionButton";
import { shallow, useStorage } from "@liveblocks/react/suspense";

export function Participants() {
  const participants = useParticipants();

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
            {_.sortBy(participants, ["completedTime", "id"]).map(
              (participant) => {
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
              },
            )}
          </TableBody>
        </Table>
      )}
    </div>
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
