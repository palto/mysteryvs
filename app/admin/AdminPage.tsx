"use client";
import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TournamentNameEditor } from "@/app/admin/TournamentNameEditor";
import { TournamentDescriptionEditor } from "@/app/admin/TournamentDescriptionEditor";
import { RoundLengthEditor } from "@/app/admin/RoundLengthEditor";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function SortableParticipantCard({ participant }: { participant: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant });

  const removeParticipant = useMutation(({ storage }, name: string) => {
    const list = storage.get("participants");
    const index = list.indexOf(name);
    if (index !== -1) list.delete(index);
    storage.get("hostRounds").delete(name);
  }, []);

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center justify-between px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground"
          aria-label="Järjestä"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="font-medium">{participant}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => removeParticipant(participant)}
      >
        Poista
      </Button>
    </Card>
  );
}

export function AdminPage() {
  const [username, setUsername] = useState("");
  const participants = useStorage((root) => [...root.participants], shallow);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const moveParticipant = useMutation(
    ({ storage }, fromIndex: number, toIndex: number) => {
      storage.get("participants").move(fromIndex, toIndex);
    },
    [],
  );

  const addParticipant = useMutation(({ storage }, name: string) => {
    const list = storage.get("participants");
    if (list.indexOf(name) !== -1) {
      throw new Error("Username already exists");
    }
    list.push(name);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = participants.indexOf(active.id as string);
    const newIndex = participants.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    moveParticipant(oldIndex, newIndex);
  }

  const trimmed = username.trim();
  const isDuplicate = participants.includes(trimmed);
  const canSubmit = trimmed.length > 0 && !isDuplicate;

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    addParticipant(trimmed);
    setUsername("");
  }

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6">Hallintapaneeli</h1>
      <TournamentNameEditor />
      <TournamentDescriptionEditor />
      <RoundLengthEditor />
      <h2 className="mb-3">Osallistujat</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={participants}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 mb-6">
            {participants.map((participant) => (
              <SortableParticipantCard
                key={participant}
                participant={participant}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
