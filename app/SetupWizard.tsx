"use client";

import { useMutation } from "@liveblocks/react/suspense";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, Trophy, ChevronLeft } from "lucide-react";
import { useHost, useRoundInstructions } from "@/app/mysteryhooks";
import { useStorage } from "@liveblocks/react/suspense";
import { useParticipants } from "@/app/Participants";
import { LiveMap } from "@liveblocks/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function Step1SelectHost() {
  const participants = useParticipants();

  const setHost = useMutation(({ storage }, name: string) => {
    storage.set("host", name);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Valitse kierroksen järjestäjä</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Klikkaa nimeäsi ottaaksesi vuoron järjestäjänä. Järjestäjä valitsee
          kierrostyypin ja aloittaa kierroksen.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {participants.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setHost(p.id)}
            className="w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] transition-transform duration-100"
          >
            <Card className="w-full cursor-pointer bg-secondary hover:bg-white/10 transition-colors duration-150 border-border/40">
              <CardContent className="flex items-center gap-4 py-4 px-5">
                <span className="text-sm font-mono text-muted-foreground w-5 shrink-0 text-right">
                  {i + 1}.
                </span>
                <span className="text-base font-semibold">{p.name}</span>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Round type
// ---------------------------------------------------------------------------

function Step2RoundType() {
  const setRoundType = useMutation(({ storage }, type: "time" | "score") => {
    storage.set("roundType", type);
  }, []);

  const unsetHost = useMutation(({ storage }) => {
    storage.set("host", null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kierrostyyppi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Valitse haluatko kilpailla ajalla vai pisteillä.
        </p>
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
  const rawRoundType = useStorage((root) => root.roundType);
  const roundInstructions = useRoundInstructions();

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
