"use client";

import React, { useMemo } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Check,
  Clock,
  Trophy,
  ChevronLeft,
  GripVertical,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  useHost,
  useHostRounds,
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
  const [pendingRoundType, setPendingRoundType] = React.useState<
    "time" | "score" | ""
  >("");

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
      {currentStep === 2 && (
        <Step2RoundType
          selectedType={pendingRoundType}
          onSelectedTypeChange={setPendingRoundType}
        />
      )}
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
  hasRound,
  onSelect,
  onRemove,
}: {
  id: string;
  index: number;
  hasRound: boolean;
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
            className="flex-1 text-left text-base font-semibold hover:text-primary transition-colors py-1 flex items-center gap-2"
          >
            {id}
            {hasRound && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            )}
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
  const items = useMemo(() => participants.map((p) => p.id), [participants]);
  const hostRounds = useHostRounds();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const setHost = useMutation(({ storage }, name: string) => {
    const existingRound = storage.get("hostRounds").get(name);
    if (existingRound) {
      storage.update({
        host: name,
        startTime: existingRound.startTime,
        completedTime: existingRound.completedTime,
        roundType: existingRound.roundType,
        roundInstructions: existingRound.roundInstructions,
        roundLength: existingRound.roundLength,
        participantTimes: new LiveMap(
          Object.entries(existingRound.participantTimes),
        ),
        participantScores: new LiveMap(
          Object.entries(existingRound.participantScores),
        ),
      });
    } else {
      storage.set("host", name);
    }
  }, []);

  const removeParticipant = useMutation(({ storage }, name: string) => {
    const p = storage.get("participants");
    const idx = p.indexOf(name);
    if (idx !== -1) p.delete(idx);
  }, []);

  const moveParticipant = useMutation(
    ({ storage }, fromIndex: number, toIndex: number) => {
      storage.get("participants").move(fromIndex, toIndex);
    },
    [],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    moveParticipant(oldIndex, newIndex);
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
                hasRound={hostRounds.has(id)}
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

function Step2RoundType({
  selectedType,
  onSelectedTypeChange,
}: {
  selectedType: "time" | "score" | "";
  onSelectedTypeChange: (type: "time" | "score") => void;
}) {
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

  function handleContinue() {
    if (!selectedType) return;
    const num = Number(minutesValue);
    if (Number.isFinite(num) && num > 0) {
      setRoundLengthMutation(num);
    }
    setRoundType(selectedType);
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

      <ToggleGroup
        type="single"
        value={selectedType}
        onValueChange={(v) => {
          if (v) onSelectedTypeChange(v as "time" | "score");
        }}
        className="grid grid-cols-2 gap-3"
      >
        <ToggleGroupItem
          value="time"
          className="h-auto flex-col gap-2 py-6 px-4 border-2 rounded-xl data-[state=on]:border-primary data-[state=on]:bg-primary/10"
        >
          <Clock className="w-8 h-8 text-primary" />
          <span className="text-base font-semibold">Aika</span>
          <span className="text-xs text-muted-foreground text-center whitespace-normal">
            Pelaajat kilpailevat nopeimmasta ratkaisuajasta
          </span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="score"
          className="h-auto flex-col gap-2 py-6 px-4 border-2 rounded-xl data-[state=on]:border-primary data-[state=on]:bg-primary/10"
        >
          <Trophy className="w-8 h-8 text-primary" />
          <span className="text-base font-semibold">Pisteet</span>
          <span className="text-xs text-muted-foreground text-center whitespace-normal">
            Pelaajille syötetään pisteet kierroksen jälkeen
          </span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex items-center gap-2">
        <Button onClick={handleContinue} disabled={!selectedType}>
          Jatka
        </Button>
        <Button variant="ghost" size="sm" onClick={unsetHost}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Takaisin
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Instructions (BlockNote, everyone can edit)
// ---------------------------------------------------------------------------

function Step3Instructions() {
  const host = useHost()!;
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      initialContent: "<p>Kirjoita tähän mitä pelaajien pitää tehdä!</p>",
      field: `round-instructions-${host}`,
    },
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
