import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";

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
