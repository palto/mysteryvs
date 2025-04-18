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

export function AdminPage({
  participants,
}: {
  participants: readonly string[];
}) {
  return (
    <div>
      <h1>Pelaajien hallinta</h1>
      <h2>Osallistujat</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nimi</TableHead>
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
