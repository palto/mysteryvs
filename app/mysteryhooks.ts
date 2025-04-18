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
