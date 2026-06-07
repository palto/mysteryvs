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
    stopWhen: stepCountIs(10),
    // Per-step output cap. With adaptive thinking the model self-budgets its
    // reasoning, so this just bounds the visible answer per step.
    maxOutputTokens: 8000,
    providerOptions: {
      // Adaptive thinking: the model decides when and how much to reason.
      // Replaces the deprecated fixed `budgetTokens` budget on Sonnet 4.6.
      // Passed through the gateway under the real provider key ("anthropic").
      // Tune reasoning depth/cost via output_config.effort if needed.
      anthropic: { thinking: { type: "adaptive" } },
    },
    onFinish: async ({ finishReason, totalUsage, steps }) => {
      // Diagnostics for why a turn ended — the key signal for "cut off":
      //   finishReason "length"     → hit maxOutputTokens
      //   last step "tool-calls" at stepCount 10 → hit the step cap
      //   anything in onError below → mid-stream failure
      console.log("[assistant] finished:", {
        finishReason,
        totalUsage,
        stepCount: steps.length,
        stepFinishReasons: steps.map((s) => s.finishReason),
        toolsCalled: steps.flatMap((s) =>
          s.toolCalls.map((t) => t.toolName),
        ),
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
    // Surface the real error to the client instead of the SDK's masked default,
    // so a mid-stream failure is visible in the UI rather than looking like a
    // normal short answer.
    onError: (error) => {
      console.error("[assistant] response stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
