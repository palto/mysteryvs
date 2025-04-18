import { useState } from "react";
import { format } from "date-fns";
import { useInterval } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { useMutation } from "@liveblocks/react/suspense";
import {
  useCompletedTime,
  useIsRunning,
  useStartTime,
} from "@/app/mysteryhooks";
import { LiveMap } from "@liveblocks/client";

export function Timer() {
  const [timerText, setTimerText] = useState("");

  const running = useIsRunning();

  const startTime = useStartTime();
  const completedTime = useCompletedTime();

  useInterval(() => {
    if (!running || !startTime) {
      return;
    }

    const currentTime = Date.now();
    const difference = currentTime - startTime;

    setTimerText(format(difference, "mm:ss:SSS"));
  }, 10);

  const completeRound = useCompleteRound();
  const startRound = useStartRound();

  return (
    <>
      {running && timerText}
      {completedTime && format(completedTime - startTime!, "mm:ss:SSS")}
      {running && <Button onClick={completeRound}>AIKA PÄÄTTYI!</Button>}
      {!running && <Button onClick={startRound}>AIKA ALKAA NYT!</Button>}
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
