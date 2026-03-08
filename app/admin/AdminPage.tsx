"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addParticipant,
  removeParticipant,
  setName,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import Form from "next/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState, useTransition } from "react";

function InlineNameEdit({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setValue(name);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await setName(trimmed);
      setEditing(false);
    });
  }

  function cancel() {
    setValue(name);
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            cancel();
          }
        }}
        disabled={isPending}
        autoFocus
        className="max-w-sm"
      />
    );
  }

  return (
    <span
      className="cursor-pointer rounded px-1 hover:bg-accent"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
    </span>
  );
}

export function AdminPage({
  participants,
  name,
}: {
  participants: readonly string[];
  name: string;
}) {
  return (
    <div>
      <h1>Pelaajien hallinta</h1>
      <h2>Turnauksen nimi</h2>
      <InlineNameEdit name={name} />
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
