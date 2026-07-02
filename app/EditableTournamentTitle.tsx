"use client";
import { useState } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { useName } from "@/app/mysteryhooks";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

export function EditableTournamentTitle() {
  const name = useName();
  const [draft, setDraft] = useState<string | null>(null);

  const setName = useMutation(({ storage }, value: string) => {
    storage.set("name", value);
  }, []);

  function save() {
    if (draft === null) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      setName(trimmed);
    }
    setDraft(null);
  }

  if (draft !== null) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setDraft(null);
          }
        }}
        aria-label="Turnauksen nimi"
        className="h-auto py-1.5 text-3xl font-bold md:text-3xl"
      />
    );
  }

  return (
    <h1 className="text-3xl font-bold">
      <button
        type="button"
        onClick={() => setDraft(name)}
        title="Muokkaa nimeä"
        className="inline-flex items-baseline gap-2 text-left hover:text-muted-foreground transition-colors"
      >
        {name}
        <Pencil
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="sr-only">Muokkaa turnauksen nimeä</span>
      </button>
    </h1>
  );
}
