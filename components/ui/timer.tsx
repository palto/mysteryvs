import { useState } from "react";
import { format } from "date-fns";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Participant } from "@/components/ui/participants";
import { produce } from "immer";

export const START_TIME_KEY = "startTime";

export function Timer() {
  const [timerText, setTimerText] = useState("");

  const [startTime, setStartTime] = useLocalStorage<number | undefined>(
    START_TIME_KEY,
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

  const { resetParticipants } = useParticipants();

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

  function onStart() {
    resetCompleteTime();
    setStartTime(Date.now());
    resetParticipants();
  }

  return (
    <>
      {running && timerText}
      {completeTime && format(completeTime - startTime!, "mm:ss:SSS")}
      {running && <Button onClick={onComplete}>AIKA PÄÄTTYI!</Button>}
      {!running && <Button onClick={onStart}>AIKA ALKAA NYT!</Button>}
    </>
  );
}

function useParticipants() {
  const [participants, setParticipants] = useLocalStorage<
    Participant[] | undefined
  >("participants", undefined, {
    initializeWithValue: false,
  });

  function resetParticipants() {
    setParticipants(
      produce((draft) => {
        if (!draft) return;
        draft.forEach((p) => (p.completedTime = undefined));
      }),
    );
  }

  return {
    participants,
    resetParticipants,
  };
}
