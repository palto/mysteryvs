"use client";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import {
  useCompletedTime,
  useDescription,
  useHost,
  useHostRounds,
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
import { format } from "date-fns";
import type { HostRound } from "@/liveblocks.config";

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
          </>
        )}

        {startTime && (
          <>
            {/* Host banner */}
            {host && (
              <div className="flex items-center justify-between bg-muted/30 border rounded-xl px-5 py-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Järjestäjä
                  </span>
                  <span className="text-lg font-bold">{host}</span>
                </div>
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
        <HostResults />
      </main>
    </div>
  );
}

function HostResults() {
  const hostRounds = useHostRounds();
  if (hostRounds.size === 0) return null;

  const sorted = [...hostRounds.entries()].sort(
    ([, a], [, b]) => a.startTime - b.startTime,
  );

  return (
    <div className="flex flex-col gap-4 w-full pt-4 border-t">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kierrostulokset
      </h2>
      {sorted.map(([host, round]) => (
        <HostRoundCard key={host} host={host} round={round} />
      ))}
    </div>
  );
}

function HostRoundCard({ host, round }: { host: string; round: HostRound }) {
  const elapsed = round.completedTime - round.startTime;
  const participants = Object.keys({
    ...round.participantTimes,
    ...round.participantScores,
  });

  const ranked =
    round.roundType === "score"
      ? [...participants].sort(
          (a, b) =>
            (round.participantScores[b] ?? -Infinity) -
            (round.participantScores[a] ?? -Infinity),
        )
      : [...participants].sort(
          (a, b) =>
            (round.participantTimes[a] ?? Infinity) -
            (round.participantTimes[b] ?? Infinity),
        );

  return (
    <div className="rounded-xl border bg-muted/20 overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <span className="font-semibold">{host}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {format(round.roundLength, "mm:ss")} kierros &mdash;{" "}
          {format(elapsed, "mm:ss")}
        </span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1">
        {ranked.map((name, i) => {
          const time = round.participantTimes[name];
          const score = round.participantScores[name];
          const display =
            round.roundType === "score"
              ? score != null
                ? `${score} p`
                : "—"
              : time != null
                ? format(time - round.startTime, "mm:ss")
                : "DNF";
          return (
            <div key={name} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-right text-muted-foreground shrink-0">
                {i + 1}.
              </span>
              <span className="flex-1">{name}</span>
              <span className="font-mono text-muted-foreground">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
