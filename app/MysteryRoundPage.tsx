"use client";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import {
  useCompletedTime,
  useDescription,
  useHost,
  useIsRunning,
  useRoundInstructions,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { WakeLock } from "@/app/WakeLock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SetupWizard } from "@/app/SetupWizard";
import { Info, CheckCircle2 } from "lucide-react";

export function MysteryRoundPage() {
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const completedTime = useCompletedTime();
  const description = useDescription();
  const roundInstructions = useRoundInstructions();
  const roundType = useRoundType();
  const host = useHost();
  const isScoreMode = roundType === "score";

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-8 sm:py-12 font-(family-name:--font-geist-sans)">
      <main className="flex flex-col gap-6 w-full max-w-2xl">
        {description && (
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}

        {!startTime && <SetupWizard />}

        {startTime && (
          <>
            {/* Host banner */}
            {host && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Järjestäjä:</span>
                <span className="font-semibold text-foreground">{host}</span>
              </div>
            )}

            {/* Instructions callout */}
            {roundInstructions && (
              <div className="flex gap-3 bg-muted/30 border rounded-xl p-4">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {roundInstructions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Status message */}
            {isRunning && (
              <div className="flex items-center gap-2 bg-blue-500/10 text-blue-300 px-3 py-2 rounded-lg text-sm">
                <Info className="h-4 w-4 shrink-0" />
                {isScoreMode
                  ? "Syötä pisteet klikkaamalla pelaajan nimeä."
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
