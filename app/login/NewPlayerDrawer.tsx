"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { addParticipant } from "@/app/admin/actions";
import { useParticipants } from "@/app/Participants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function NewPlayerDrawer() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const participants = useParticipants();

  const trimmed = username.trim();
  const isDuplicate = participants.some((p) => p.id === trimmed);
  const canSubmit = trimmed.length > 0 && !isDuplicate && !isPending;

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setUsername("");
      setServerError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setServerError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addParticipant(data);
        setOpen(false);
        setUsername("");
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Jokin meni pieleen.",
        );
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-border bg-card hover:bg-accent transition-colors w-full text-muted-foreground">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-center leading-tight">
            Lisää pelaaja
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Uusi pelaaja</DrawerTitle>
            <DrawerDescription>Syötä uuden pelaajan nimi.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="px-4">
            <div className="space-y-2">
              <Label htmlFor="new-player-username">Nimi</Label>
              <Input
                id="new-player-username"
                name="username"
                placeholder="Pelaajan nimi"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setServerError(null);
                }}
                autoComplete="off"
                autoFocus
              />
              {isDuplicate && trimmed.length > 0 && (
                <p className="text-sm text-destructive">
                  Pelaaja on jo olemassa.
                </p>
              )}
              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}
            </div>
            <DrawerFooter className="px-0">
              <Button type="submit" disabled={!canSubmit}>
                {isPending ? "Lisätään…" : "Lisää pelaaja"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" type="button">
                  Peruuta
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
