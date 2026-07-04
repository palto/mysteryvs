import { LiveList, LiveMap } from "@liveblocks/client";
import type { PlainLsonObject } from "@liveblocks/node";
import type { HostRound } from "@/liveblocks.config";

const NAME = "Mystery game tournament";

export const defaultParticipants = [];

export function initialStorage() {
  return {
    name: NAME,
    description: "",
    participants: new LiveList(defaultParticipants),
    startTime: null,
    completedTime: null,
    participantTimes: new LiveMap<string, number>(),
    participantScores: new LiveMap<string, number>(),
    host: null,
    roundLength: null,
    roundType: null,
    roundInstructions: null,
    hostRounds: new LiveMap<string, HostRound>(),
  };
}

export const initialStoragePlainLson: PlainLsonObject = {
  liveblocksType: "LiveObject",
  data: {
    name: NAME,
    description: "",
    participants: {
      liveblocksType: "LiveList",
      data: [...defaultParticipants],
    },
    startTime: null,
    completedTime: null,
    participantTimes: { liveblocksType: "LiveMap", data: {} },
    participantScores: { liveblocksType: "LiveMap", data: {} },
    host: null,
    roundLength: null,
    roundType: null,
    roundInstructions: null,
    hostRounds: { liveblocksType: "LiveMap", data: {} },
  },
};
