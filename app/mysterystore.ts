import { createStoreWithProducer } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { defaultParticipants, Participant } from "@/components/ui/participants";
import { produce } from "immer";

const defaultContext = {
  startTime: undefined as number | undefined,
  completedTime: undefined as number | undefined,
  participants: defaultParticipants,
  participantTimes: {} as Record<string, number>,
};

export type contextType = typeof defaultContext;

const snapshotStr = localStorage.getItem("snapshot");
const initialContext = snapshotStr
  ? (JSON.parse(snapshotStr) as contextType)
  : undefined;

export const store = createStoreWithProducer(produce, {
  context: initialContext ?? defaultContext,
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
    addParticipant: (context, event: { participant: Participant }) => {
      context.participants.push(event.participant);
    },
    removeParticipant: (context, event: { participantId: string }) => {
      const index = context.participants.findIndex(
        (p) => p.id === event.participantId,
      );
      if (index === undefined) {
        throw new Error("Participant not found with id " + event.participantId);
      }
      context.participants.splice(index, 1);
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

export const useParticipants = () =>
  useSelector(store, (state) => state.context.participants);

export const useParticipantTime = (id: string) =>
  useSelector(store, (state) => state.context.participantTimes[id]);
