"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addParticipant, removeParticipant } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import Form from "next/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TournamentNameEditor } from "@/app/admin/TournamentNameEditor";

export function AdminPage({
  participants,
  name,
}: {
  participants: readonly string[];
  name: string;
}) {
  return (
    <div className="overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6">Hallintapaneeli</h1>
      <TournamentNameEditor initialName={name} />
      <h2>Osallistujat</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-75">Nimi</TableHead>
            <TableHead>Toiminnot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.toSorted().map((participant) => {
            return (
              <TableRow key={participant}>
                <TableCell>{participant}</TableCell>
                <TableCell>
                  <Button onClick={() => removeParticipant(participant)}>
                    Poista
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Form action={addParticipant} className="space-y-8">
        <Label htmlFor="username">Syötä uuden pelaajan nimi</Label>
        <Input placeholder="Nimimerkki" name={"username"} />
        <Button>Tallenna</Button>
      </Form>
    </div>
  );
}
