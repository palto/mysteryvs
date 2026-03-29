import { useState } from "react";
import { format } from "date-fns";
import { useInterval } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { useMutation } from "@liveblocks/react/suspense";
import {
  useCompletedTime,
  useHost,
  useIsRunning,
  useName,
  useParticipantTimes,
  useRoundLength,
  useStartTime,
} from "@/app/mysteryhooks";
import { LiveMap } from "@liveblocks/client";
import { RotateCcw } from "lucide-react";

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

  const name = useName();
  const participantTimes = useParticipantTimes();

  const completeRound = useCompleteRound();
  const startRound = useStartRound();
  const resetRound = useResetRound();

  const resetTimer = useResetTimer();

  function handleCompleteRound() {
    const completedAt = Date.now();
    completeRound(completedAt);
    void fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, host, completedAt, participantTimes }),
    });
  }

  function handleResetTimer() {
    if (!confirm("Nollataanko kierros? Järjestäjä pysyy samana.")) return;
    resetTimer();
  }

  return (
    <>
      {running && (
        <div className="flex items-center gap-2">
          <span>
            Aikaa kulunut: {format(elapsedTime, "mm:ss:SSS")} /{" "}
            {format(roundLength, "mm:ss:SSS")}
          </span>
          {host && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleResetTimer}
              title="Nollaa ajastin"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {running && (
        <div>
          Aikaa jäljellä:{" "}
          {format(Math.max(roundLength - elapsedTime, 0), "mm:ss:SSS")}
        </div>
      )}
      {completedTime && (
        <div className="flex items-center gap-2">
          <span>
            Kierros päättyi: {format(completedTime - startTime!, "mm:ss:SSS")} /{" "}
            {format(roundLength, "mm:ss:SSS")}
          </span>
          {host && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleResetTimer}
              title="Nollaa ajastin"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {!startTime && host && (
        <Button onClick={startRound}>AIKA ALKAA NYT!</Button>
      )}
      {running && <Button onClick={handleCompleteRound}>AIKA PÄÄTTYI!</Button>}
      {startTime && !running && (
        <Button onClick={resetRound}>Valitse seuraava järjestäjä</Button>
      )}
    </>
  );
}

function useCompleteRound() {
  return useMutation(({ storage }, completedAt: number) => {
    storage.set("completedTime", completedAt);
  }, []);
}

function useStartRound() {
  return useMutation(({ storage }) => {
    storage.update({
      startTime: Date.now(),
      completedTime: null,
      participantTimes: new LiveMap(),
      participantScores: new LiveMap(),
    });
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
    });
  }, []);
}
