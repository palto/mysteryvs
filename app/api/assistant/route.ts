import { streamText, gateway, convertToModelMessages, stepCountIs } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const origin = new URL(req.url).origin;
  const mcpClient = await createMCPClient({
    transport: { type: "http", url: `${origin}/api/mcp` },
  });

  try {
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
    });

    return result.toUIMessageStreamResponse();
  } finally {
    await mcpClient.close();
  }
}
