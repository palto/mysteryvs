import { streamText, gateway, convertToModelMessages, stepCountIs } from "ai";
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

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4-6"),
    system:
      "You are a helpful assistant for setting up mystery game tournament rounds. " +
      "You can add/remove/reorder participants, set the tournament name and description, " +
      "and configure the round length. Always confirm what you did after each action. " +
      "Be concise and friendly.",
    messages: await convertToModelMessages(messages),
    tools,
    // A turn may chain tool calls; cap the number of model steps per turn.
    stopWhen: stepCountIs(10),
    // Upper bound on the visible answer per step (reasoning is budgeted separately).
    maxOutputTokens: 8000,
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
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      mcpClient.close();
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    // Forward the real error message to the client so failures are visible in the UI.
    onError: (error) => {
      console.error("[assistant] response stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
