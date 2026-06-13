import { ToolLoopAgent, createAgentUIStreamResponse } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";
import { PipedreamClient } from "@pipedream/sdk/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const cookieStore = await cookies();
  const externalUserId = cookieStore.get("username")?.value ?? "anonymous";

  const PIPEDREAM_APPS = ["google_sheets"];

  type MCPClient = Awaited<ReturnType<typeof createMCPClient>>;
  let pdMcpClients: MCPClient[] = [];
  let pdTools: Awaited<ReturnType<typeof mcpClient.tools>> = {};

  try {
    const pd = new PipedreamClient({
      projectEnvironment: process.env.PIPEDREAM_ENVIRONMENT as
        | "development"
        | "production",
      clientId: process.env.PIPEDREAM_CLIENT_ID!,
      clientSecret: process.env.PIPEDREAM_CLIENT_SECRET!,
      projectId: process.env.PIPEDREAM_PROJECT_ID!,
    });

    const accessToken = await pd.rawAccessToken;

    pdMcpClients = await Promise.all(
      PIPEDREAM_APPS.map((appSlug) =>
        createMCPClient({
          transport: {
            type: "http",
            url: "https://remote.mcp.pipedream.net/v3",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "x-pd-project-id": process.env.PIPEDREAM_PROJECT_ID!,
              "x-pd-environment": process.env.PIPEDREAM_ENVIRONMENT!,
              "x-pd-external-user-id": externalUserId,
              "x-pd-app-slug": appSlug,
            },
          },
        }),
      ),
    );

    const toolSets = await Promise.all(pdMcpClients.map((c) => c.tools()));
    pdTools = Object.assign({}, ...toolSets);
  } catch (error) {
    console.error("[assistant] Pipedream MCP client error:", error);
  }

  const tools = { ...(await mcpClient.tools()), ...pdTools };

  // ToolLoopAgent runs the tool-calling loop with the SDK's defaults
  // (e.g. stopWhen: stepCountIs(20)).
  const agent = new ToolLoopAgent({
    model: "anthropic/claude-haiku-4.5",
    instructions: `\
You are a helpful assistant for setting up mystery game tournament rounds.
You can add/remove/reorder participants, set the tournament name and description, and configure the round length.
You also have access to external services via Pipedream (e.g. Google Calendar, Gmail, Slack) if the user has connected their accounts.
If a tool returns a connect URL, share it with the user so they can link their account.
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
      await Promise.all(pdMcpClients.map((c) => c.close()));
    },
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
