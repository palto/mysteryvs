import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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

type Participant = {
  id: string;
  name: string;
};

const participantFormSchema = z.object({
  name: z.string().min(2).max(100),
});

export function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([]);

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

  return (
    <div>
      {participants.length > 0 && (
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nimi</TableHead>
              <TableHead>Toiminnot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => {
              return (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>Poista</TableCell>
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
