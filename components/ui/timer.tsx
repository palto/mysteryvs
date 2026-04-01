import { useState } from "react";
import { format } from "date-fns";
import { useInterval } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { useMutation } from "@liveblocks/react/suspense";
import {
  useCompletedTime,
  useHost,
  useIsRunning,
  useRoundLength,
  useStartTime,
} from "@/app/mysteryhooks";
import { LiveMap } from "@liveblocks/client";
import { CheckCircle2, RotateCcw } from "lucide-react";

export function Timer() {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const running = useIsRunning();

  const startTime = useStartTime();
  const completedTime = useCompletedTime();
  const host = useHost();
  const roundLength = useRoundLength();

  useInterval(() => {
    if (!running || !startTime) {
      return;
    }

    const currentTime = Date.now();
    const difference = currentTime - startTime;

    setElapsedTime(difference);
  }, 10);

  const completeRound = useCompleteRound();
  const resetRound = useResetRound();
  const resetTimer = useResetTimer();

  function handleResetTimer() {
    if (!confirm("Nollataanko kierros? Järjestäjä pysyy samana.")) return;
    resetTimer();
  }

  const progress = Math.min(elapsedTime / roundLength, 1);
  const remaining = Math.max(roundLength - elapsedTime, 0);
  const isUrgent = remaining < 120_000 && running;

  const finalElapsed =
    completedTime && startTime ? completedTime - startTime : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {running && (
        <div className="w-full flex flex-col gap-3">
          {/* Big timer display */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-5xl font-mono font-bold tracking-tight tabular-nums">
                {format(elapsedTime, "mm:ss")}
                <span className="text-2xl text-muted-foreground">
                  .
                  {String(Math.floor((elapsedTime % 1000) / 10)).padStart(
                    2,
                    "0",
                  )}
                </span>
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Aikaa kulunut
              </span>
            </div>
            {host && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-1 shrink-0"
                onClick={handleResetTimer}
                title="Nollaa ajastin"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-colors duration-500 ${isUrgent ? "bg-red-500" : "bg-primary"}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Remaining time */}
          <div
            className={`text-sm font-mono ${isUrgent ? "text-red-400 font-semibold" : "text-muted-foreground"}`}
          >
            {format(remaining, "mm:ss")} jäljellä
          </div>
        </div>
      )}

      {completedTime && startTime && (
        <div className="w-full flex flex-col gap-3">
          {/* Final elapsed display */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <span className="text-5xl font-mono font-bold tracking-tight tabular-nums">
                  {format(finalElapsed, "mm:ss")}
                  <span className="text-2xl text-muted-foreground">
                    .
                    {String(Math.floor((finalElapsed % 1000) / 10)).padStart(
                      2,
                      "0",
                    )}
                  </span>
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-7">
                Kierros päättyi &mdash; {format(roundLength, "mm:ss")} kierros
              </span>
            </div>
            {host && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-1 shrink-0"
                onClick={handleResetTimer}
                title="Nollaa ajastin"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Full progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}

      {running && (
        <Button
          size="lg"
          variant="destructive"
          className="w-full font-bold tracking-wide"
          onClick={completeRound}
        >
          AIKA PÄÄTTYI!
        </Button>
      )}
      {startTime && !running && (
        <Button
          size="lg"
          className="w-full font-bold tracking-wide"
          onClick={resetRound}
        >
          Valitse seuraava järjestäjä
        </Button>
      )}
    </div>
  );
}

function useCompleteRound() {
  return useMutation(({ storage }) => {
    storage.set("completedTime", Date.now());
  }, []);
}

function useResetRound() {
  return useMutation(({ storage }) => {
    storage.update({
      startTime: null,
      completedTime: null,
      participantTimes: new LiveMap(),
      participantScores: new LiveMap(),
      host: null,
      roundType: null,
      roundInstructions: null,
    });
  }, []);
}

function useResetTimer() {
  return useMutation(({ storage }) => {
    storage.update({
      startTime: null,
      completedTime: null,
      participantTimes: new LiveMap(),
      participantScores: new LiveMap(),
      roundInstructions: null,
    });
  }, []);
}
