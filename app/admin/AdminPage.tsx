"use client";
import {
  addParticipant,
  removeParticipant,
  reorderParticipants,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TournamentNameEditor } from "@/app/admin/TournamentNameEditor";
import { TournamentDescriptionEditor } from "@/app/admin/TournamentDescriptionEditor";
import { useTransition, useState } from "react";
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
  arrayMove,
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

export function AdminPage({
  participants,
  name,
  description,
}: {
  participants: readonly string[];
  name: string;
  description: string;
}) {
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();
  const [prevParticipants, setPrevParticipants] = useState(participants);
  const [items, setItems] = useState([...participants]);
  if (prevParticipants !== participants) {
    setPrevParticipants(participants);
    setItems([...participants]);
  }

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    startTransition(async () => {
      await reorderParticipants(newItems);
    });
  }

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
      <TournamentDescriptionEditor initialDescription={description} />
      <h2 className="mb-3">Osallistujat</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 mb-6">
            {items.map((participant) => (
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
