import { useState } from "react";
import { format } from "date-fns";
import { useInterval } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
  store,
  useCompletedTime,
  useIsRunning,
  useStartTime,
} from "@/app/mysterystore";

export const START_TIME_KEY = "startTime";

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

  return (
    <>
      {running && timerText}
      {completedTime && format(completedTime - startTime!, "mm:ss:SSS")}
      {running && (
        <Button onClick={() => store.send({ type: "stop" })}>
          AIKA PÄÄTTYI!
        </Button>
      )}
      {!running && (
        <Button onClick={() => store.send({ type: "start" })}>
          AIKA ALKAA NYT!
        </Button>
      )}
    </>
  );
}
