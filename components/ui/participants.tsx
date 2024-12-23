import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ulid } from "ulid";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { produce } from "immer";
import _ from "lodash";
import { useLocalStorage } from "usehooks-ts";
import { START_TIME_KEY } from "@/components/ui/timer";
import { format } from "date-fns";

export type Participant = {
  id: string;
  name: string;
  completedTime?: number;
};

const participantFormSchema = z.object({
  name: z.string().min(2).max(100),
});

export const PARTICIPANTS_KEY = "participants";

const defaultSeedTime = Date.parse("2024-11-16T20:00:00").valueOf();

export const defaultParticipants: Participant[] = [
  {
    id: ulid(defaultSeedTime),
    name: "Anssi",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Antti",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Eetu",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Jarkko",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Jussi",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Juuso",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Jörö",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Lauri",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Pyry",
  },
  {
    id: ulid(defaultSeedTime),
    name: "Toni",
  },
];

export function Participants() {
  const [participants, setParticipants] = useLocalStorage<Participant[]>(
    PARTICIPANTS_KEY,
    defaultParticipants,
    {
      initializeWithValue: false,
    },
  );

  const form = useForm<z.infer<typeof participantFormSchema>>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof participantFormSchema>) {
    setParticipants([...participants, { id: ulid(), ...values }]);
    form.reset({ name: "" });
  }

  function onCompleted(id: string) {
    setParticipants(
      produce((draft) => {
        const participant = draft.find((p) => p.id === id);
        if (!participant) {
          throw new Error("Participant not found with id " + id);
        }
        participant.completedTime = Date.now();
      }),
    );
  }

  function onCancel(id: string) {
    setParticipants(
      produce((draft) => {
        const participant = draft.find((p) => p.id === id);
        if (!participant) {
          throw new Error("Participant not found with id " + id);
        }
        participant.completedTime = undefined;
      }),
    );
  }

  function onDelete(id: string) {
    setParticipants(
      produce((draft) => {
        const index = draft.findIndex((p) => p.id === id);
        if (index === undefined) {
          throw new Error("Participant not found with id " + id);
        }
        draft.splice(index, 1);
      }),
    );
  }

  const startTime = useStartTime();

  return (
    <div>
      {participants.length > 0 && (
        <Table>
          <TableCaption>Lisää uusi pelaaja</TableCaption>
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
                    {!participant.completedTime && (
                      <Button onClick={() => onCompleted(participant.id)}>
                        {participant.name.toUpperCase()}!!!
                      </Button>
                    )}
                    {participant.completedTime && (
                      <>
                        {participant.name}&nbsp;
                        {startTime &&
                          format(
                            participant.completedTime - startTime,
                            "mm:ss:SSS",
                          )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {participant.completedTime && (
                      <Button
                        variant="link"
                        onClick={() => onCancel(participant.id)}
                      >
                        Huijasi!
                      </Button>
                    )}
                    {!participant.completedTime && (
                      <Button
                        variant="link"
                        onClick={() => onDelete(participant.id)}
                      >
                        Poista!
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {participants.length === 0 && (
        <div>Ei vielä yhtään osallistujaa. Lisää alla olevasta lomakkeesta</div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Uuden pelaajan nimi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Lisää</Button>
        </form>
      </Form>
    </div>
  );
}

function useStartTime() {
  const [startTime] = useLocalStorage(START_TIME_KEY, undefined, {
    initializeWithValue: false,
  });
  return startTime;
}
