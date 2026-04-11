import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";

function calcRoundPoints(
  participants: string[],
  host: string,
  roundType: string,
  participantTimes: Record<string, number>,
  participantScores: Record<string, number>,
): Record<string, number> {
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

function createMcpServer() {
  const server = new McpServer({
    name: "mystery-tournament",
    version: "1.0.0",
  });

  server.tool(
    "list_participants",
    "List all current tournament participants",
    {},
    async () => {
      const storage = await liveblocks.getStorageDocument(room, "json");
      const participants = storage.participants as string[];
      return {
        content: [
          { type: "text", text: JSON.stringify(participants, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "add_participant",
    "Add a new participant to the tournament",
    { username: z.string().describe("Username to add") },
    async ({ username }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        if (participants.findIndex((p) => p === username) !== -1) {
          throw new Error(`${username} already exists`);
        }
        participants.push(username);
      });
      return {
        content: [{ type: "text", text: `Added participant: ${username}` }],
      };
    },
  );

  server.tool(
    "remove_participant",
    "Remove a participant from the tournament",
    { username: z.string().describe("Username to remove") },
    async ({ username }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        const index = participants.findIndex((p) => p === username);
        if (index === -1) throw new Error(`${username} not found`);
        participants.delete(index);
      });
      return {
        content: [{ type: "text", text: `Removed participant: ${username}` }],
      };
    },
  );

  server.tool(
    "get_tournament_state",
    "Get current tournament configuration: name, description, and round length",
    {},
    async () => {
      const storage = await liveblocks.getStorageDocument(room, "json");
      const state = {
        name: storage.name ?? null,
        description: storage.description ?? null,
        roundLengthMinutes: storage.roundLength
          ? (storage.roundLength as number) / 60000
          : 20,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
      };
    },
  );

  server.tool(
    "get_results",
    "Get per-participant results for the current or last round, sorted by finish time. Shows elapsed seconds, DNF status, and points earned this round.",
    {},
    async () => {
      const storage = await liveblocks.getStorageDocument(room, "json");
      const participants = (storage.participants as string[]) ?? [];
      const startTime = storage.startTime as number | null;
      const host = (storage.host as string | null) ?? null;
      const roundType = (storage.roundType as string | null) ?? "time";
      const participantTimes = (storage.participantTimes ?? {}) as Record<
        string,
        number
      >;
      const participantScores = (storage.participantScores ?? {}) as Record<
        string,
        number
      >;

      const nonHostParticipants = participants.filter((p) => p !== host);
      const points = host
        ? calcRoundPoints(
            nonHostParticipants,
            host,
            roundType,
            participantTimes,
            participantScores,
          )
        : {};

      const results = participants.map((username) => {
        const finishTime = participantTimes[username] ?? null;
        const elapsedSeconds =
          finishTime !== null && startTime !== null
            ? Math.round((finishTime - startTime) / 1000)
            : null;
        const score = participantScores[username] ?? null;
        return {
          username,
          elapsedSeconds,
          dnf: elapsedSeconds === null,
          score,
          points: points[username] ?? null,
        };
      });

      results.sort((a, b) => {
        if (a.dnf && b.dnf) return 0;
        if (a.dnf) return 1;
        if (b.dnf) return -1;
        return (a.elapsedSeconds ?? 0) - (b.elapsedSeconds ?? 0);
      });

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );

  server.tool(
    "set_tournament_name",
    "Set the tournament name",
    { name: z.string().describe("New tournament name") },
    async ({ name }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("name", name);
      });
      return {
        content: [{ type: "text", text: `Tournament name set to: ${name}` }],
      };
    },
  );

  server.tool(
    "set_tournament_description",
    "Set the tournament description (markdown supported)",
    { description: z.string().describe("New tournament description") },
    async ({ description }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("description", description);
      });
      return {
        content: [{ type: "text", text: "Tournament description updated" }],
      };
    },
  );

  server.tool(
    "set_round_length",
    "Set the round duration in minutes",
    {
      minutes: z
        .number()
        .positive()
        .describe("Round length in minutes (e.g. 20)"),
    },
    async ({ minutes }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("roundLength", minutes * 60000);
      });
      return {
        content: [
          { type: "text", text: `Round length set to ${minutes} minutes` },
        ],
      };
    },
  );

  server.tool(
    "reorder_participants",
    "Reorder the participant list. All current participants must be included.",
    {
      order: z
        .array(z.string())
        .describe("Full participant list in the desired order"),
    },
    async ({ order }) => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        const current = [...participants];

        const missing = current.filter((p) => !order.includes(p));
        if (missing.length > 0) {
          throw new Error(
            `Missing participants in new order: ${missing.join(", ")}`,
          );
        }
        const extra = order.filter((p) => !current.includes(p));
        if (extra.length > 0) {
          throw new Error(
            `Unknown participants in new order: ${extra.join(", ")}`,
          );
        }

        // Delete all from end to start, then push in new order
        for (let i = current.length - 1; i >= 0; i--) {
          participants.delete(i);
        }
        for (const username of order) {
          participants.push(username);
        }
      });
      return {
        content: [
          {
            type: "text",
            text: `Participants reordered: ${order.join(", ")}`,
          },
        ],
      };
    },
  );

  return server;
}

async function handleRequest(req: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const DELETE = handleRequest;
