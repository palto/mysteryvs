import { Card, CardContent } from "@/components/ui/card";
import _ from "lodash";
import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import {
  useCompletedTime,
  useCurrentRoundPoints,
  useCumulativePoints,
  useHost,
  useIsRunning,
  useRoundType,
  useStartTime,
} from "@/app/mysteryhooks";
import { Check, CheckCircle2, Flag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState } from "react";

export function Participants() {
  const host = useHost();
  const startTime = useStartTime();
  const isRunning = useIsRunning();
  const roundEnded = !!useCompletedTime();
  const roundType = useRoundType();
  const participants = useParticipants().filter((p) => p.id !== host);
  const currentPoints = useCurrentRoundPoints();
  const cumulativePoints = useCumulativePoints();
  const hasCumulativePoints = Object.keys(cumulativePoints).length > 0;

  if (!host && !startTime) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-3 w-full">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Valitse kierroksen järjestäjä
          </h2>
          <div className="flex flex-col gap-2">
            {participants.map((participant, index) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                index={index + 1}
              />
            ))}
          </div>
        </div>
        {hasCumulativePoints && <Standings points={cumulativePoints} />}
      </div>
    );
  }

  if (roundType === "score") {
    return (
      <ScoreRoundPanel
        participants={participants}
        points={currentPoints}
        roundEnded={roundEnded}
      />
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
        <h2 className="flex items-center gap-1.5 text-sm font-semibold mb-3 text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5" />
          Matkalla
        </h2>
        <div className="flex flex-col gap-2">
          {inProgress.map((participant) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
              isRunning={isRunning}
              roundEnded={roundEnded}
              points={
                roundEnded ? (currentPoints[participant.id] ?? 0) : undefined
              }
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
        <h2 className="flex items-center gap-1.5 text-sm font-semibold mb-3 text-muted-foreground">
          <Flag className="w-3.5 h-3.5" />
          Maalissa
        </h2>
        <div className="flex flex-col gap-2">
          {finished.map((participant, index) => (
            <RoundParticipantCard
              key={participant.id}
              participant={participant}
              startTime={startTime}
              isRunning={isRunning}
              roundEnded={roundEnded}
              rank={index + 1}
              points={
                roundEnded ? (currentPoints[participant.id] ?? 0) : undefined
              }
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

function ScoreRoundPanel({
  participants,
  points,
  roundEnded,
}: {
  participants: Participant[];
  points: Record<string, number>;
  roundEnded: boolean;
}) {
  const ranked = _.orderBy(
    participants.filter((p) => p.score !== undefined),
    ["score"],
    ["desc"],
  );
  const unscored = participants.filter((p) => p.score === undefined);

  return (
    <div className="flex flex-col gap-6 w-full">
      <ScoreEntryForm participants={participants} />
      {roundEnded && ranked.length > 0 && (
        <ResultsLeaderboard
          results={[
            ...ranked.map((p) => ({
              id: p.id,
              name: p.name,
              pts: points[p.id] ?? 0,
            })),
            ...unscored.map((p) => ({ id: p.id, name: p.name, pts: 0 })),
          ]}
        />
      )}
      {!roundEnded && ranked.length > 0 && (
        <ScoreLeaderboard ranked={ranked} total={participants.length} />
      )}
    </div>
  );
}

function ScoreEntryForm({ participants }: { participants: Participant[] }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function focusNext(currentIndex: number) {
    for (let i = currentIndex + 1; i < inputRefs.current.length; i++) {
      const el = inputRefs.current[i];
      if (el) {
        el.focus();
        el.select();
        return;
      }
    }
  }

  return (
    <div className="w-full rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Pelaaja
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Pisteet
        </span>
      </div>
      {participants.map((p, i) => (
        <ScoreRow
          key={p.id}
          participant={p}
          inputRef={(el) => {
            inputRefs.current[i] = el;
          }}
          onAdvance={() => focusNext(i)}
        />
      ))}
    </div>
  );
}

function ScoreRow({
  participant,
  inputRef,
  onAdvance,
}: {
  participant: Participant;
  inputRef: (el: HTMLInputElement | null) => void;
  onAdvance: () => void;
}) {
  // draft holds the in-progress edit; only used while focused
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const committedViaKeyboard = useRef(false);
  const setScore = useSetParticipantScore(participant.id);

  // When unfocused, display the external score directly (stays in sync with Liveblocks).
  // When focused, display the local draft so typing isn't disrupted by external updates.
  const displayValue = focused
    ? draft
    : participant.score !== undefined
      ? String(participant.score)
      : "";

  function handleFocus() {
    setDraft(participant.score !== undefined ? String(participant.score) : "");
    setFocused(true);
  }

  function commitScore() {
    const trimmed = draft.trim();
    if (trimmed === "") {
      setScore(null);
    } else {
      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed)) {
        setScore(parsed);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      committedViaKeyboard.current = true;
      commitScore();
      onAdvance();
    } else if (e.key === "Escape") {
      setDraft(
        participant.score !== undefined ? String(participant.score) : "",
      );
    }
  }

  function handleBlur() {
    setFocused(false);
    if (!committedViaKeyboard.current) commitScore();
    committedViaKeyboard.current = false;
  }

  const hasScore = participant.score !== undefined;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 focus-within:bg-accent/30 transition-colors">
      <span className="text-base font-medium">{participant.name}</span>
      <div className="flex items-center gap-1.5">
        {hasScore && !focused && (
          <Check className="w-3 h-3 text-green-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          enterKeyHint="done"
          value={displayValue}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className="w-20 text-right text-sm font-mono bg-transparent border-0 border-b-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

function ScoreLeaderboard({
  ranked,
  total,
}: {
  ranked: Participant[];
  total: number;
}) {
  const allEntered = ranked.length === total;

  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {allEntered ? "Lopputulos" : "Tilanne"}
      </h2>
      <div className="flex flex-col gap-1">
        {ranked.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 px-1 py-2">
            <span className="text-sm w-6 shrink-0 text-center">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
            </span>
            <span className="text-base font-medium flex-1">{p.name}</span>
            <span className="text-base font-bold font-mono tabular-nums">
              {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsLeaderboard({
  results,
}: {
  results: Array<{ id: string; name: string; pts: number }>;
}) {
  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Lopputulos
      </h2>
      <div className="flex flex-col gap-1">
        {results.map(({ id, name, pts }, i) => (
          <div key={id} className="flex items-center gap-3 px-1 py-2">
            <span className="text-sm w-6 shrink-0 text-center">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
            </span>
            <span className="text-base font-medium flex-1">{name}</span>
            <span className="text-sm font-semibold text-primary font-mono tabular-nums">
              +{pts} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundParticipantCard({
  participant,
  startTime,
  isRunning,
  roundEnded,
  rank,
  points,
}: {
  participant: Participant;
  startTime: number | null;
  isRunning: boolean;
  roundEnded: boolean;
  rank?: number;
  points?: number;
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
        className={`w-full cursor-pointer hover:bg-accent transition-colors ${isFinished ? "border-green-500/50 bg-green-500/5" : ""}`}
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
          <div className="flex items-center gap-2">
            {points !== undefined && (
              <span className="text-sm font-semibold text-primary font-mono tabular-nums">
                +{points} pts
              </span>
            )}
            {isFinished && startTime && participant.completedTime ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground font-mono">
                  {format(participant.completedTime - startTime, "mm:ss")}
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function ParticipantCard({
  participant,
  index,
}: {
  participant: Participant;
  index: number;
}) {
  const setHost = useMutation(
    ({ storage }) => {
      storage.set("host", participant.id);
    },
    [participant.id],
  );

  return (
    <button
      onClick={setHost}
      className="w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] transition-transform duration-100"
    >
      <Card className="w-full cursor-pointer bg-secondary hover:bg-white/10 transition-colors duration-150 border-border/40">
        <CardContent className="flex items-center gap-4 py-4 px-5">
          <span className="text-sm font-mono text-muted-foreground w-5 shrink-0 text-right">
            {index}.
          </span>
          <span className="text-base font-semibold">{participant.name}</span>
        </CardContent>
      </Card>
    </button>
  );
}

function Standings({ points }: { points: Record<string, number> }) {
  const sorted = Object.entries(points)
    .sort(([, a], [, b]) => b - a)
    .filter(([, pts]) => pts > 0);

  if (sorted.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Pisteet yhteensä
      </h2>
      <div className="flex flex-col gap-1">
        {sorted.map(([name, pts], i) => (
          <div key={name} className="flex items-center gap-3 px-1 py-2">
            <span className="text-sm w-6 shrink-0 text-center text-muted-foreground">
              {i + 1}.
            </span>
            <span className="text-base font-medium flex-1">{name}</span>
            <span className="text-base font-bold font-mono tabular-nums">
              {pts}
            </span>
          </div>
        ))}
      </div>
    </div>
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
