"use client";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import {
  useCompletedTime,
  useDescription,
  useIsRunning,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { WakeLock } from "@/app/WakeLock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SetupWizard } from "@/app/SetupWizard";
import { RoundInfoCard } from "@/app/RoundInfoCard";
import { Info, CheckCircle2, BotIcon } from "lucide-react";
import { AssistantChat } from "@/app/AssistantChat";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function MysteryRoundPage() {
  const [showAssistant, setShowAssistant] = useState(false);
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const completedTime = useCompletedTime();
  const description = useDescription();
  const roundType = useRoundType();
  const isScoreMode = roundType === "score";

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-8 sm:py-12 font-(family-name:--font-geist-sans)">
      <main className="flex flex-col gap-6 w-full max-w-2xl">
        {!startTime && (
          <>
            {description && (
              <div className="prose prose-sm dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description}
                </ReactMarkdown>
              </div>
            )}
            <SetupWizard />

            <Button
              variant="outline"
              size="sm"
              className="self-start gap-2"
              onClick={() => setShowAssistant((v) => !v)}
            >
              <BotIcon className="size-4" />
              {showAssistant ? "Hide AI Assistant" : "AI Assistant"}
            </Button>

            {showAssistant && <AssistantChat />}
          </>
        )}

        {startTime && (
          <>
            <RoundInfoCard />

            {/* Status message */}
            {isRunning && (
              <div className="flex items-center gap-2 bg-blue-500/10 text-blue-300 px-3 py-2 rounded-lg text-sm">
                <Info className="h-4 w-4 shrink-0" />
                {isScoreMode
                  ? "Syötä pisteet alla olevaan lomakkeeseen. Enter tai Tab siirtyy seuraavaan."
                  : "Klikkaa pelaajan korttiasi kun hän on maalissa. Voit siirtää takaisin Matkalle klikkaamalla uudelleen."}
              </div>
            )}
            {completedTime && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-300 px-3 py-2 rounded-lg text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {isScoreMode
                  ? "Kierros päättyi. Voit vielä päivittää pisteitä."
                  : 'Kierros päättyi. Paina "Valitse seuraava järjestäjä" aloittaaksesi uuden kierroksen.'}
              </div>
            )}

            <Timer />

            <Participants />
          </>
        )}

        <WakeLock />
      </main>
    </div>
  );
}
