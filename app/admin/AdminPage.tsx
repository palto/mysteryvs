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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TournamentNameEditor } from "@/app/admin/TournamentNameEditor";
import { useTransition, useState } from "react";

export function AdminPage({
  participants,
  name,
}: {
  participants: readonly string[];
  name: string;
}) {
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();

  const trimmed = username.trim();
  const isDuplicate = participants.includes(trimmed);
  const canSubmit = trimmed.length > 0 && !isDuplicate && !isPending;

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      await addParticipant(data);
      setUsername("");
    });
  }

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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="username">Syötä uuden pelaajan nimi</Label>
          <Input
            id="username"
            placeholder="Nimimerkki"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {isDuplicate && trimmed.length > 0 && (
            <p className="text-sm text-destructive">Pelaaja on jo olemassa.</p>
          )}
        </div>
        <Button disabled={!canSubmit}>Tallenna</Button>
      </form>
    </div>
  );
}
