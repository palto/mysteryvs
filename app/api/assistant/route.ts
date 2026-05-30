import {
  streamText,
  gateway,
  convertToModelMessages,
  stepCountIs,
  tool,
} from "ai";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";
import { z } from "zod";

export const dynamic = "force-dynamic";

const tools = {
  list_participants: tool({
    description: "List all current tournament participants",
    inputSchema: z.object({}),
    execute: async (): Promise<string[]> => {
      const storage = await liveblocks.getStorageDocument(room, "json");
      return (storage.participants as string[]) ?? [];
    },
  }),

  add_participant: tool({
    description: "Add a new participant to the tournament",
    inputSchema: z.object({
      username: z.string().describe("Username to add"),
    }),
    execute: async ({ username }: { username: string }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        if (participants.findIndex((p: string) => p === username) !== -1) {
          throw new Error(`${username} already exists`);
        }
        participants.push(username);
      });
      return `Added participant: ${username}`;
    },
  }),

  remove_participant: tool({
    description: "Remove a participant from the tournament",
    inputSchema: z.object({
      username: z.string().describe("Username to remove"),
    }),
    execute: async ({ username }: { username: string }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        const index = participants.findIndex((p: string) => p === username);
        if (index === -1) throw new Error(`${username} not found`);
        participants.delete(index);
      });
      return `Removed participant: ${username}`;
    },
  }),

  reorder_participants: tool({
    description:
      "Reorder the participant list. All current participants must be included.",
    inputSchema: z.object({
      order: z
        .array(z.string())
        .describe("Full participant list in the desired order"),
    }),
    execute: async ({ order }: { order: string[] }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        const participants = root.get("participants");
        const current = [...participants] as string[];
        const missing = current.filter((p) => !order.includes(p));
        if (missing.length > 0)
          throw new Error(
            `Missing participants in new order: ${missing.join(", ")}`,
          );
        const extra = order.filter((p) => !current.includes(p));
        if (extra.length > 0)
          throw new Error(
            `Unknown participants in new order: ${extra.join(", ")}`,
          );
        for (let i = current.length - 1; i >= 0; i--) {
          participants.delete(i);
        }
        for (const username of order) {
          participants.push(username);
        }
      });
      return `Participants reordered: ${order.join(", ")}`;
    },
  }),

  get_tournament_state: tool({
    description:
      "Get current tournament configuration: name, description, and round length",
    inputSchema: z.object({}),
    execute: async (): Promise<{
      name: string | null;
      description: string | null;
      roundLengthMinutes: number;
    }> => {
      const storage = await liveblocks.getStorageDocument(room, "json");
      return {
        name: (storage.name as string) ?? null,
        description: (storage.description as string) ?? null,
        roundLengthMinutes: storage.roundLength
          ? (storage.roundLength as number) / 60000
          : 20,
      };
    },
  }),

  set_tournament_name: tool({
    description: "Set the tournament name",
    inputSchema: z.object({
      name: z.string().describe("New tournament name"),
    }),
    execute: async ({ name }: { name: string }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("name", name);
      });
      return `Tournament name set to: ${name}`;
    },
  }),

  set_tournament_description: tool({
    description: "Set the tournament description (markdown supported)",
    inputSchema: z.object({
      description: z.string().describe("New tournament description"),
    }),
    execute: async ({
      description,
    }: {
      description: string;
    }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("description", description);
      });
      return "Tournament description updated";
    },
  }),

  set_round_length: tool({
    description: "Set the round duration in minutes",
    inputSchema: z.object({
      minutes: z
        .number()
        .positive()
        .describe("Round length in minutes (e.g. 20)"),
    }),
    execute: async ({ minutes }: { minutes: number }): Promise<string> => {
      await liveblocks.mutateStorage(room, async ({ root }) => {
        root.set("roundLength", minutes * 60000);
      });
      return `Round length set to ${minutes} minutes`;
    },
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4-6"),
    system:
      "You are a helpful assistant for setting up mystery game tournament rounds. " +
      "You can add/remove/reorder participants, set the tournament name and description, " +
      "and configure the round length. Always confirm what you did after each action. " +
      "Be concise and friendly.",
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
