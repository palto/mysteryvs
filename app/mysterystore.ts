import { createStoreWithProducer } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { defaultParticipants } from "@/components/ui/participants";
import { produce } from "immer";

export const store = createStoreWithProducer(produce, {
  context: {
    startTime: undefined as number | undefined,
    completedTime: undefined as number | undefined,
    participants: defaultParticipants,
    participantTimes: {} as Record<string, number>,
  },
  on: {
    start: (context) => {
      context.startTime = Date.now();
      context.completedTime = undefined;
      context.participantTimes = {};
    },
    stop: (context) => {
      context.completedTime = Date.now();
    },
    finish: (context, event: { participantId: string }) => {
      context.participantTimes[event.participantId] = Date.now();
    },
    cancel: (context, event: { participantId: string }) => {
      delete context.participantTimes[event.participantId];
    },
  },
});

export const useStartTime = () =>
  useSelector(store, (state) => state.context.startTime);

export const useCompletedTime = () =>
  useSelector(store, (state) => state.context.completedTime);

export const useIsRunning = () =>
  useSelector(
    store,
    (state) => !!(state.context.startTime && !state.context.completedTime),
  );

export const useParticipants = () => {
  useSelector(store, (state) => state.context.participants);
};
