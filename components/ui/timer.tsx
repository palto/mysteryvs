import { useState } from "react";
import { format } from "date-fns";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";

export function Timer() {
  const [timerText, setTimerText] = useState("");

  const [startTime, setStartTime] = useLocalStorage<number | undefined>(
    "startTime",
    undefined,
    {
      initializeWithValue: false,
    },
  );

  const [completeTime, setCompleteTime, resetCompleteTime] = useLocalStorage<
    number | undefined
  >("completeTime", undefined, {
    initializeWithValue: false,
  });

  const running = startTime && !completeTime;

  useInterval(() => {
    if (!running) {
      return;
    }

    const currentTime = Date.now();
    const difference = currentTime - startTime;

    setTimerText(format(difference, "mm:ss:SSS"));
  }, 10);

  function onComplete() {
    setCompleteTime(Date.now());
  }

  return (
    <>
      {running && timerText}
      {completeTime && format(completeTime - startTime!, "mm:ss:SSS")}
      {running && <Button onClick={onComplete}>AIKA PÄÄTTYI!</Button>}
      {!running && (
        <Button
          onClick={() => {
            resetCompleteTime();
            setStartTime(Date.now());
          }}
        >
          AIKA ALKAA NYT!
        </Button>
      )}
    </>
  );
}
