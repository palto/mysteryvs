"use client";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import {
  useCompletedTime,
  useDescription,
  useIsRunning,
  useRoundInstructions,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { WakeLock } from "@/app/WakeLock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SetupWizard } from "@/app/SetupWizard";

export function MysteryRoundPage() {
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const completedTime = useCompletedTime();
  const description = useDescription();
  const roundInstructions = useRoundInstructions();
  const roundType = useRoundType();
  const isScoreMode = roundType === "score";

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-4 pb-20 gap-16 sm:p-20 font-(family-name:--font-geist-sans)">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-lg">
        {description && (
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}

        {!startTime && <SetupWizard />}

        {startTime && roundInstructions && (
          <div className="prose prose-sm dark:prose-invert w-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {roundInstructions}
            </ReactMarkdown>
          </div>
        )}

        {isRunning && (
          <p className="text-base font-medium">
            {isScoreMode
              ? "Syötä pisteet klikkaamalla pelaajan nimeä."
              : "Klikkaa pelaajan korttiasi kun hän on maalissa. Voit siirtää takaisin Matkalle klikkaamalla uudelleen."}
          </p>
        )}
        {completedTime && (
          <p className="text-base font-medium">
            {isScoreMode
              ? "Kierros päättyi. Voit vielä päivittää pisteitä."
              : 'Kierros päättyi. Paina "Valitse seuraava järjestäjä" aloittaaksesi uuden kierroksen.'}
          </p>
        )}

        {startTime && <Timer />}

        {startTime && <Participants />}

        <WakeLock />
      </main>
    </div>
  );
}
