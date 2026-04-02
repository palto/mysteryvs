"use client";

import React, { useState } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Clock,
  Trophy,
  ChevronLeft,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  useHost,
  useRoundInstructions,
  useRoundLength,
} from "@/app/mysteryhooks";
import { useStorage } from "@liveblocks/react/suspense";
import { useParticipants } from "@/app/Participants";
import { LiveMap } from "@liveblocks/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { NewPlayerDrawer } from "@/app/login/NewPlayerDrawer";

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { label: "Järjestäjä" },
  { label: "Kierrostyyppi" },
  { label: "Ohjeet" },
  { label: "Aloita" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full mb-2">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-xs text-center leading-tight ${
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-5 transition-colors ${done ? "bg-green-500" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function SetupWizard() {
  const host = useHost();
  const rawRoundType = useStorage((root) => root.roundType);
  const roundInstructions = useRoundInstructions();

  const currentStep = !host
    ? 1
    : rawRoundType === null
      ? 2
      : roundInstructions === null
        ? 3
        : 4;

  return (
    <div className="flex flex-col gap-6 w-full">
      <StepIndicator current={currentStep} />
      {currentStep === 1 && <Step1SelectHost />}
      {currentStep === 2 && <Step2RoundType />}
      {currentStep === 3 && <Step3Instructions />}
      {currentStep === 4 && <Step4Start />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Select host
// ---------------------------------------------------------------------------

function SortableParticipantRow({
  id,
  index,
  onSelect,
  onRemove,
}: {
  id: string;
  index: number;
  onSelect: (name: string) => void;
  onRemove: (name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Card className="w-full bg-secondary border-border/40">
        <CardContent className="flex items-center gap-2 py-3 px-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-muted-foreground shrink-0"
            aria-label="Järjestä"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="text-sm font-mono text-muted-foreground w-5 shrink-0 text-right">
            {index + 1}.
          </span>
          <button
            onClick={() => onSelect(id)}
            className="flex-1 text-left text-base font-semibold hover:text-primary transition-colors py-1"
          >
            {id}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(id)}
            aria-label="Poista"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Step1SelectHost() {
  const participants = useParticipants();
  const [prevParticipants, setPrevParticipants] = useState(participants);
  const [items, setItems] = useState(participants.map((p) => p.id));
  if (prevParticipants !== participants) {
    setPrevParticipants(participants);
    setItems(participants.map((p) => p.id));
  }

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const setHost = useMutation(({ storage }, name: string) => {
    storage.set("host", name);
  }, []);

  const removeParticipant = useMutation(({ storage }, name: string) => {
    const p = storage.get("participants");
    const idx = p.findIndex((x) => x === name);
    if (idx !== -1) p.delete(idx);
  }, []);

  const reorderParticipants = useMutation(({ storage }, newOrder: string[]) => {
    const p = storage.get("participants");
    while (p.length > 0) p.delete(0);
    for (const name of newOrder) p.push(name);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorderParticipants(newItems);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Valitse kierroksen järjestäjä</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Klikkaa nimeäsi ottaaksesi vuoron järjestäjänä. Järjestäjä valitsee
          kierrostyypin ja aloittaa kierroksen.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((id, i) => (
              <SortableParticipantRow
                key={id}
                id={id}
                index={i}
                onSelect={setHost}
                onRemove={removeParticipant}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div>
        <NewPlayerDrawer />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Round type
// ---------------------------------------------------------------------------

function Step2RoundType() {
  const roundLength = useRoundLength();
  const [minutesValue, setMinutesValue] = React.useState(
    String(Math.round(roundLength / 60000)),
  );

  const setRoundType = useMutation(({ storage }, type: "time" | "score") => {
    storage.set("roundType", type);
  }, []);

  const setRoundLengthMutation = useMutation(({ storage }, minutes: number) => {
    storage.set("roundLength", minutes * 60000);
  }, []);

  const unsetHost = useMutation(({ storage }) => {
    storage.set("host", null);
  }, []);

  function handleMinutesBlur() {
    const num = Number(minutesValue);
    if (Number.isFinite(num) && num > 0) {
      setRoundLengthMutation(num);
    } else {
      setMinutesValue(String(Math.round(roundLength / 60000)));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kierrostyyppi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Valitse haluatko kilpailla ajalla vai pisteillä.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="roundLengthInput"
          className="text-sm font-medium text-foreground"
        >
          Kierroksen pituus (minuuttia)
        </label>
        <input
          id="roundLengthInput"
          type="number"
          min="1"
          step="1"
          value={minutesValue}
          onChange={(e) => setMinutesValue(e.target.value)}
          onBlur={handleMinutesBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="w-28 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setRoundType("time")}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <Card className="h-full cursor-pointer transition-colors border-2 hover:border-primary hover:bg-primary/5">
            <CardContent className="flex flex-col items-center gap-2 py-6 px-4">
              <Clock className="w-8 h-8 text-primary" />
              <span className="text-base font-semibold">Aika</span>
              <span className="text-xs text-muted-foreground text-center">
                Pelaajat kilpailevat nopeimmasta ratkaisuajasta
              </span>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => setRoundType("score")}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <Card className="h-full cursor-pointer transition-colors border-2 hover:border-primary hover:bg-primary/5">
            <CardContent className="flex flex-col items-center gap-2 py-6 px-4">
              <Trophy className="w-8 h-8 text-primary" />
              <span className="text-base font-semibold">Pisteet</span>
              <span className="text-xs text-muted-foreground text-center">
                Pelaajille syötetään pisteet kierroksen jälkeen
              </span>
            </CardContent>
          </Card>
        </button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={unsetHost}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Takaisin
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Instructions (BlockNote, everyone can edit)
// ---------------------------------------------------------------------------

function Step3Instructions() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    { field: "round-instructions" },
  );

  const saveInstructions = useMutation(({ storage }, markdown: string) => {
    storage.set("roundInstructions", markdown);
  }, []);

  async function handleReady() {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    saveInstructions(markdown.trim());
  }

  const unsetRoundType = useMutation(({ storage }) => {
    storage.set("roundType", null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kierroksen ohjeet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kirjoita ohjeet muille pelaajille. Kaikki voivat muokata ohjeita
          samanaikaisesti. Klikkaa &ldquo;Ohjeet valmiit&rdquo; kun valmis.
        </p>
      </div>

      <div className="rounded-md border">
        <BlockNoteView editor={editor} theme="dark" />
      </div>

      <Button onClick={handleReady}>
        <Check className="w-4 h-4 mr-1" />
        Ohjeet valmiit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={unsetRoundType}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Takaisin
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Start round
// ---------------------------------------------------------------------------

function Step4Start() {
  const host = useHost()!;
  const rawRoundType = useStorage((root) => root.roundType);
  const roundInstructions = useRoundInstructions();
  const roundLength = useRoundLength();
  const roundMinutes = Math.round(roundLength / 60000);

  const startRound = useMutation(({ storage }) => {
    storage.update({
      startTime: Date.now(),
      completedTime: null,
      participantTimes: new LiveMap(),
      participantScores: new LiveMap(),
    });
  }, []);

  const unsetInstructionsReady = useMutation(({ storage }) => {
    storage.set("roundInstructions", null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Valmis aloittamaan!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kaikki valmista. Käynnistä kierros kun kaikki pelaajat ovat valmiina.
        </p>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-4 px-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Järjestäjä</span>
              <span className="text-lg font-bold">{host}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Kierrosaika</span>
              <span className="text-lg font-bold">{roundMinutes} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {rawRoundType === "score" ? (
              <>
                <Trophy className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">Pistekierros</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">Aikakierros</span>
              </>
            )}
          </div>
          {roundInstructions ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {roundInstructions}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Ei ohjeita kirjoitettu.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button
          size="lg"
          onClick={startRound}
          className="font-bold tracking-wide"
        >
          AIKA ALKAA NYT!
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={unsetInstructionsReady}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Takaisin
        </Button>
      </div>
    </div>
  );
}
