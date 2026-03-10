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
  const startRound = useStartRound();
  const resetRound = useResetRound();

  return (
    <>
      {running && (
        <div>
          Aikaa kulunut: {format(elapsedTime, "mm:ss:SSS")} /{" "}
          {format(roundLength, "mm:ss:SSS")}
        </div>
      )}
      {running && (
        <div>
          Aikaa jäljellä:{" "}
          {format(Math.max(roundLength - elapsedTime, 0), "mm:ss:SSS")}
        </div>
      )}
      {completedTime && (
        <div>
          Kierros päättyi: {format(completedTime - startTime!, "mm:ss:SSS")} /{" "}
          {format(roundLength, "mm:ss:SSS")}
        </div>
      )}
      {!startTime && host && (
        <Button onClick={startRound}>AIKA ALKAA NYT!</Button>
      )}
      {running && <Button onClick={completeRound}>AIKA PÄÄTTYI!</Button>}
      {startTime && !running && (
        <Button onClick={resetRound}>Aloita uusi kierros!</Button>
      )}
    </>
  );
}

function useCompleteRound() {
  return useMutation(({ storage }) => {
    storage.set("completedTime", Date.now());
  }, []);
}

function useStartRound() {
  return useMutation(({ storage }) => {
    storage.update({
      startTime: Date.now(),
      completedTime: null,
      participantTimes: new LiveMap(),
    });
  }, []);
}

function useResetRound() {
  return useMutation(({ storage }) => {
    storage.update({
      startTime: null,
      completedTime: null,
      participantTimes: new LiveMap(),
      host: null,
    });
  }, []);
}
