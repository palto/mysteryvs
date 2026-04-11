import { useStorage } from "@liveblocks/react/suspense";
import type { HostRound } from "@/liveblocks.config";

export function useStartTime() {
  return useStorage((root) => root.startTime);
}

export function useCompletedTime() {
  return useStorage((root) => root.completedTime);
}

export function useIsRunning() {
  return useStorage((root) => !!root.startTime && !root.completedTime);
}

export function useParticipantTime(id: string) {
  return useStorage((root) => root.participantTimes.get(id));
}

export function useHost() {
  return useStorage((root) => root.host);
}

export function useName() {
  return useStorage((root) => root.name);
}

export function useDescription() {
  return useStorage((root) => root.description);
}

const DEFAULT_ROUND_LENGTH = 20 * 60 * 1000;

export function useRoundLength() {
  return useStorage((root) => root.roundLength ?? DEFAULT_ROUND_LENGTH);
}

export function useRoundType() {
  return useStorage((root) => root.roundType ?? "time");
}

export function useParticipantScore(id: string) {
  return useStorage((root) => root.participantScores.get(id));
}

export function useRoundInstructions() {
  return useStorage((root) => root.roundInstructions);
}

export function useHostRounds(): Map<string, HostRound> {
  return useStorage((root) => {
    if (!root.hostRounds) return new Map();
    return new Map(root.hostRounds.entries());
  });
}

export function useHostRound(host: string): HostRound | null {
  return useStorage((root) => {
    if (!root.hostRounds) return null;
    return root.hostRounds.get(host) ?? null;
  });
}

export function calculateRoundPoints({
  participants,
  host,
  roundType,
  participantTimes,
  participantScores,
}: {
  participants: string[];
  host: string;
  roundType: string;
  participantTimes: Record<string, number>;
  participantScores: Record<string, number>;
}): Record<string, number> {
  const result: Record<string, number> = {};

  if (roundType === "time") {
    const finishers = participants
      .filter((p) => p in participantTimes)
      .sort((a, b) => participantTimes[a] - participantTimes[b]);
    const F = finishers.length;
    participants.forEach((p) => {
      result[p] = 0;
    });
    finishers.forEach((p, i) => {
      result[p] = F - i;
    });
    result[host] = F;
  } else {
    const scored = participants
      .filter((p) => p in participantScores)
      .sort((a, b) => participantScores[b] - participantScores[a]);
    const F = scored.length;
    participants.forEach((p) => {
      result[p] = 0;
    });
    scored.forEach((p, i) => {
      result[p] = F - i;
    });
    result[host] = F;
  }

  return result;
}

export function useCurrentRoundPoints(): Record<string, number> {
  return useStorage((root) => {
    const host = root.host;
    if (!host || !root.startTime) return {};
    const participants = root.participants.filter((p) => p !== host);
    const roundType = root.roundType ?? "time";
    return calculateRoundPoints({
      participants: [...participants],
      host,
      roundType,
      participantTimes: Object.fromEntries(root.participantTimes.entries()),
      participantScores: Object.fromEntries(root.participantScores.entries()),
    });
  });
}
