import { useStorage } from "@liveblocks/react/suspense";

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

export function useInstructionsReady() {
  return useStorage((root) => root.instructionsReady);
}
