"use client";
import { useMutation } from "@liveblocks/react/suspense";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/app/Participants";
import { Button } from "@/components/ui/button";
import {
  useCompletedTime,
  useDescription,
  useHost,
  useIsRunning,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { WakeLock } from "@/app/WakeLock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RoundInstructionsEditor } from "@/app/RoundInstructionsEditor";

export function MysteryRoundPage() {
  const host = useHost();
  const unsetHost = useUnsetHost();
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const completedTime = useCompletedTime();
  const description = useDescription();
  const roundType = useRoundType();
  const setRoundType = useSetRoundType();
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

        {host && <RoundInstructionsEditor />}

        {host && (
          <h2>
            Kierroksen järjestäjä: {host}
            {!startTime && (
              <Button onClick={unsetHost} variant="link">
                Vaihda!
              </Button>
            )}
          </h2>
        )}

        {!host && <h2>Valitse seuraavan kierroksen järjestäjä</h2>}

        {!host && !startTime && (
          <p className="text-base font-medium">
            Klikkaa nimeäsi valitaksesi itsesi kierroksen järjestäjäksi.
          </p>
        )}
        {host && !startTime && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Kierrostyyppi:
              </span>
              <Button
                variant={!isScoreMode ? "default" : "outline"}
                size="sm"
                onClick={() => setRoundType("time")}
              >
                Aika
              </Button>
              <Button
                variant={isScoreMode ? "default" : "outline"}
                size="sm"
                onClick={() => setRoundType("score")}
              >
                Pisteet
              </Button>
            </div>
            <p className="text-base font-medium">
              {isScoreMode
                ? "Pistekierros: syötä pisteet klikkaamalla pelaajan nimeä."
                : "Järjestäjä käynnistää kierroksen. Klikkaa pelaajan korttiasi kun hän on maalissa — voit siirtää takaisin Matkalle klikkaamalla uudelleen."}
            </p>
          </>
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

        <Timer />

        <Participants />

        <WakeLock />
      </main>
    </div>
  );
}

function useUnsetHost() {
  return useMutation(({ storage }) => {
    storage.set("host", null);
  }, []);
}

function useSetRoundType() {
  return useMutation(({ storage }, type: "time" | "score") => {
    storage.set("roundType", type);
  }, []);
}
