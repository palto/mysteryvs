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

type Participant = {
  ulid: string;
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
    setParticipants([...participants, { ulid: ulid(), ...values }]);
    form.reset({ name: "" });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pelaajan nimi</FormLabel>
                <FormControl>
                  <Input placeholder="syötä nimi tähän" {...field} />
                </FormControl>
                <FormDescription>Tämä on pelaajan nimi</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Lisää</Button>
        </form>
      </Form>
      <div>
        <ol>
          {participants.map((participant) => (
            <li key={participant.ulid}>{participant.name}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
