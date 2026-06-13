import { ToolLoopAgent, createAgentUIStreamResponse } from "ai";
import type { ToolSet } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";
import { getUsername } from "@/app/login/getUsername";
import {
  composio,
  GOOGLE_SHEETS_AUTH_CONFIG_ID,
  GOOGLE_SHEETS_TOOLKIT,
} from "@/app/composio/composio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fetch the user's Google Sheets tools from Composio, but only if they have an
// ACTIVE connected account. Returns an empty set otherwise so the assistant
// never offers tools that would fail.
async function getGoogleSheetsTools(userId: string): Promise<ToolSet> {
  try {
    const { items } = await composio.connectedAccounts.list({
      userIds: [userId],
      authConfigIds: [GOOGLE_SHEETS_AUTH_CONFIG_ID],
      statuses: ["ACTIVE"],
    });
    if (items.length === 0) return {};
    return await composio.tools.get(userId, {
      toolkits: [GOOGLE_SHEETS_TOOLKIT],
    });
  } catch (error) {
    console.error("[assistant] failed to load Google Sheets tools:", error);
    return {};
  }
}

export async function POST(req: Request) {
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

  // Layer in the logged-in user's connected Google Sheets tools, if any.
  const username = await getUsername();
  const sheetsTools = username ? await getGoogleSheetsTools(username) : {};
  const sheetsConnected = Object.keys(sheetsTools).length > 0;

  const tools = { ...mcpTools, ...sheetsTools };

  // ToolLoopAgent runs the tool-calling loop with the SDK's defaults
  // (e.g. stopWhen: stepCountIs(20)).
  const agent = new ToolLoopAgent({
    model: "anthropic/claude-haiku-4.5",
    instructions: `\
You are a helpful assistant for setting up mystery game tournament rounds.
You can add/remove/reorder participants, set the tournament name and description, and configure the round length.
${
  sheetsConnected
    ? "You also have full access to the user's Google Sheets and can read from and write to spreadsheets — for example, exporting tournament results or the leaderboard to a sheet."
    : 'Google Sheets is not connected for this user. If they ask to use Google Sheets, tell them to click "Connect Google Sheets" at the top of this assistant panel first.'
}
Always confirm what you did after each action.
Be concise and friendly.`,
    tools,
    onFinish: async ({ finishReason, totalUsage, steps }) => {
      // Log how each turn ended (finish reason, token usage, tools used).
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
