import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import _ from "lodash";
import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import {
  useCompletedTime,
  useHost,
  useIsRunning,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState } from "react";

export function Participants() {
  const host = useHost();
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const roundEnded = !!useCompletedTime();
  const roundType = useRoundType();
  let participants = useParticipants();
  participants = participants.filter((p) => p.id !== host);

  if (!host && !startTime) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {participants.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}
      </div>
    );
  }

  if (roundType === "score") {
    const withScores = _.orderBy(
      participants.filter((p) => p.score !== undefined),
      ["score"],
      ["desc"],
    );
    const withoutScores = participants.filter((p) => p.score === undefined);

    return (
      <div className="flex flex-col gap-2 w-full">
        {withScores.map((participant, index) => (
          <ScoreParticipantCard
            key={participant.id}
            participant={participant}
            rank={index + 1}
            roundEnded={roundEnded}
            isRunning={isRunning}
          />
        ))}
        {withoutScores.map((participant) => (
          <ScoreParticipantCard
            key={participant.id}
            participant={participant}
            roundEnded={roundEnded}
            isRunning={isRunning}
          />
        ))}
      </div>
    );
  }

  const inProgress = participants.filter((p) => !p.completedTime);
  const finished = _.sortBy(
    participants.filter((p) => p.completedTime),
    ["completedTime"],
  );

  return (
    <div className="grid grid-cols-2 gap-6 w-full">
      <div>
        <h2 className="text-lg font-semibold mb-3">Matkalla</h2>
        <div className="flex flex-col gap-2">
          {inProgress.map((participant) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
              isRunning={isRunning}
              roundEnded={roundEnded}
            />
          ))}
          {inProgress.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              Kaikki maalissa!
            </p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Maalissa</h2>
        <div className="flex flex-col gap-2">
          {finished.map((participant, index) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
              isRunning={isRunning}
              roundEnded={roundEnded}
              rank={index + 1}
            />
          ))}
          {finished.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              Ei vielä ketään
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreParticipantCard({
  participant,
  rank,
  roundEnded: _roundEnded,
  isRunning: _isRunning,
}: {
  participant: Participant;
  rank?: number;
  roundEnded: boolean;
  isRunning: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const setScore = useSetParticipantScore(participant.id);

  function handleCardClick() {
    setInputValue(
      participant.score !== undefined ? String(participant.score) : "",
    );
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitScore() {
    const trimmed = inputValue.trim();
    if (trimmed === "") {
      setScore(null);
    } else {
      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed)) {
        setScore(parsed);
      }
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitScore();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  }

  return (
    <Card
      className={`w-full cursor-pointer hover:bg-accent transition-colors ${participant.score !== undefined ? "border-green-500" : ""}`}
      onClick={!editing ? handleCardClick : undefined}
    >
      <CardContent className="flex items-center justify-between py-3 px-4 pt-3">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
              {rank}.
            </span>
          )}
          {rank === undefined && (
            <span className="text-sm font-bold text-muted-foreground w-5 shrink-0" />
          )}
          <span className="text-base font-medium">{participant.name}</span>
        </div>
        {editing ? (
          <InputGroup className="w-28" onClick={(e) => e.stopPropagation()}>
            <InputGroupInput
              ref={inputRef}
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitScore}
              onKeyDown={handleKeyDown}
              className="text-right text-sm font-mono"
              placeholder="pisteet"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={commitScore}
                aria-label="Tallenna pisteet"
              >
                <Check />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <span className="text-sm text-muted-foreground font-mono">
            {participant.score !== undefined ? participant.score : "—"}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function RoundParticipantCard({
  participant,
  startTime,
  isRunning,
  roundEnded,
  rank,
}: {
  participant: Participant;
  startTime: number | null;
  isRunning: boolean;
  roundEnded: boolean;
  rank?: number;
}) {
  const finish = useParticipantFinish(participant.id);
  const unFinish = useParticipantUnFinish(participant.id);
  const isFinished = !!participant.completedTime;

  function handleClick() {
    if (roundEnded) {
      if (!confirm(`Muuta ${participant.name} tilaa? Kierros on jo päättynyt.`))
        return;
    } else if (isRunning && isFinished) {
      if (!confirm(`Siirrä ${participant.name} takaisin Matkalle?`)) return;
    }
    if (isFinished) {
      unFinish();
    } else {
      finish();
    }
  }

  return (
    <button onClick={handleClick} className="w-full text-left">
      <Card
        className={`w-full cursor-pointer hover:bg-accent transition-colors ${isFinished ? "border-green-500" : ""}`}
      >
        <CardContent className="flex items-center justify-between py-3 px-4 pt-3">
          <div className="flex items-center gap-2">
            {rank !== undefined && (
              <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                {rank}.
              </span>
            )}
            <span className="text-base font-medium">{participant.name}</span>
          </div>
          {isFinished && startTime && participant.completedTime && (
            <span className="text-sm text-muted-foreground font-mono">
              {format(participant.completedTime - startTime, "mm:ss")}
            </span>
          )}
        </CardContent>
      </Card>
    </button>
  );
}

function ParticipantCard({ participant }: { participant: Participant }) {
  const setHost = useMutation(
    ({ storage }) => {
      storage.set("host", participant.id);
    },
    [participant.id],
  );

  return (
    <button onClick={setHost} className="w-full">
      <Card className="w-full h-20 cursor-pointer hover:bg-accent transition-colors">
        <CardContent className="flex items-center justify-center h-full pt-6">
          <span className="text-xl font-semibold">{participant.name}</span>
        </CardContent>
      </Card>
    </button>
  );
}

export interface Participant {
  id: string;
  name: string;
  completedTime?: number;
  score?: number;
}

export function useParticipants(): Participant[] {
  return useStorage(
    (root) =>
      root.participants.map((p) => ({
        id: p,
        name: p,
        completedTime: root.participantTimes.get(p),
        score: root.participantScores.get(p),
      })),
    shallow,
  );
}

function useParticipantFinish(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.get("participantTimes").set(id, Date.now());
    },
    [id],
  );
}

function useParticipantUnFinish(id: string) {
  return useMutation(
    ({ storage }) => {
      storage.get("participantTimes").delete(id);
    },
    [id],
  );
}

function useSetParticipantScore(id: string) {
  return useMutation(
    ({ storage }, score: number | null) => {
      if (score === null) {
        storage.get("participantScores").delete(id);
      } else {
        storage.get("participantScores").set(id, score);
      }
    },
    [id],
  );
}
