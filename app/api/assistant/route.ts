import { ToolLoopAgent, createAgentUIStreamResponse } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";
import { getUserId } from "@/app/userId";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY!,
    provider: new VercelProvider(),
  });
  const { messages } = await req.json();

  const origin = new URL(req.url).origin;
  const oidcToken = await getVercelOidcToken();

  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url: `${origin}/api/mcp`,
      headers: oidcToken
        ? { "x-vercel-trusted-oidc-idp-token": oidcToken }
        : {},
    },
  });

  const mcpTools = await mcpClient.tools();

  // Load Google Sheets tools scoped to the user's secret id (not the
  // freely-chosen player name), so a connection belongs to the person who made
  // it and can't be reached by impersonating a player name. Composio handles
  // auth in-chat automatically — if the user hasn't connected yet, the tools
  // return a connect link that the assistant surfaces in the conversation.
  // The id may be absent (proxy hasn't issued it yet); treat that as "not
  // connected" rather than relying on the cookie always being present.
  const userId = await getUserId();
  const sheetsTools = userId
    ? await (await composio.create(userId)).tools()
    : {};

  const tools = { ...mcpTools, ...sheetsTools };

  const agent = new ToolLoopAgent({
    model: "anthropic/claude-haiku-4.5",
    instructions: `\
You are a helpful assistant for setting up mystery game tournament rounds.
You can add/remove/reorder participants, set the tournament name and description, and configure the round length.
You also have access to the user's Google Sheets and can read from and write to spreadsheets — for example, exporting tournament results or the leaderboard to a sheet.
Always confirm what you did after each action.
Be concise and friendly.`,
    tools,
    onFinish: async ({ finishReason, totalUsage, steps }) => {
      console.log("[assistant] finished:", {
        finishReason,
        totalUsage,
        stepCount: steps.length,
        stepFinishReasons: steps.map((s) => s.finishReason),
        toolsCalled: steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)),
      });
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    sendReasoning: true,
    onFinish: async () => {
      await mcpClient.close();
    },
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
