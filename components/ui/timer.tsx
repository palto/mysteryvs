import { useState } from "react";
import { format } from "date-fns";
import { useInterval } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { useMutation, useStorage } from "@liveblocks/react/suspense";

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

function useIsRunning() {
  return useStorage((root) => !!root.startTime && !root.completedTime);
}

function useStartTime() {
  return useStorage((root) => root.startTime);
}

function useCompletedTime() {
  return useStorage((root) => root.completedTime);
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
    });
  }, []);
}
