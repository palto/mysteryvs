import { streamText, gateway, convertToModelMessages, stepCountIs } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";

export const dynamic = "force-dynamic";

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
    // Leave room for both the thinking budget and the final answer across all steps.
    maxOutputTokens: 8000,
    providerOptions: {
      // Enable Anthropic extended thinking so the user can see the agent reason.
      // Passed through the gateway under the real provider key ("anthropic").
      // Low budget keeps latency/cost down; must stay below maxOutputTokens.
      anthropic: { thinking: { type: "enabled", budgetTokens: 2048 } },
    },
    onFinish: async () => {
      await mcpClient.close();
    },
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      mcpClient.close();
    },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
