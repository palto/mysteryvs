"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useMutation } from "@liveblocks/react/suspense";
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
  const [error, setError] = useState<string | null>(null);
  const participants = useParticipants();

  const addParticipant = useMutation(({ storage }, name: string) => {
    const list = storage.get("participants");
    if (list.indexOf(name) !== -1) {
      throw new Error("Username already exists");
    }
    list.push(name);
  }, []);

  const trimmed = username.trim();
  const isDuplicate = participants.some((p) => p.id === trimmed);
  const canSubmit = trimmed.length > 0 && !isDuplicate;

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setUsername("");
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      addParticipant(trimmed);
      setOpen(false);
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jokin meni pieleen.");
    }
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
                  setError(null);
                }}
                autoComplete="off"
                autoFocus
              />
              {isDuplicate && trimmed.length > 0 && (
                <p className="text-sm text-destructive">
                  Pelaaja on jo olemassa.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DrawerFooter className="px-0">
              <Button type="submit" disabled={!canSubmit}>
                Lisää pelaaja
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
