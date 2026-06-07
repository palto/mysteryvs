import { ToolLoopAgent, gateway, convertToModelMessages } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";

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

  const tools = await mcpClient.tools();

  // ToolLoopAgent runs the tool-calling loop with the SDK's defaults
  // (e.g. stopWhen: stepCountIs(20)).
  const agent = new ToolLoopAgent({
    model: gateway("anthropic/claude-sonnet-4-6"),
    instructions:
      "You are a helpful assistant for setting up mystery game tournament rounds. " +
      "You can add/remove/reorder participants, set the tournament name and description, " +
      "and configure the round length. Always confirm what you did after each action. " +
      "Be concise and friendly.",
    tools,
    providerOptions: {
      // Adaptive thinking lets the model decide when and how much to reason.
      // Routed through the gateway under the real provider key ("anthropic").
      anthropic: { thinking: { type: "adaptive" } },
    },
    onFinish: async ({ finishReason, totalUsage, steps }) => {
      // Log how each turn ended (finish reason, token usage, tools used).
      console.log("[assistant] finished:", {
        finishReason,
        totalUsage,
        stepCount: steps.length,
        stepFinishReasons: steps.map((s) => s.finishReason),
        toolsCalled: steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)),
      });
      await mcpClient.close();
    },
  });

  const result = await agent.stream({
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    // Forward the real error message to the client so failures are visible in
    // the UI, and clean up the MCP client. The agent's onFinish only runs on
    // success, so the error-path cleanup lives here.
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      mcpClient.close();
      return error instanceof Error ? error.message : String(error);
    },
  });
}
