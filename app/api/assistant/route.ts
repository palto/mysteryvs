import { ToolLoopAgent, createAgentUIStreamResponse, gateway } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { getVercelOidcToken } from "@vercel/oidc";
import { getUserId } from "@/app/userId";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// The AI Gateway model id. Used both to run the agent and to look up the
// model's pricing from the gateway (so cost is authoritative and self-updating).
const MODEL = "anthropic/claude-haiku-4.5";

// Per-token USD pricing, sent to the client so the chat can show cost.
export type ModelPricing = {
  input: number;
  output: number;
  cachedInputTokens?: number;
  cacheCreationInputTokens?: number;
};

// The gateway model list rarely changes; cache it across warm invocations.
let pricingCache: { at: number; pricing?: ModelPricing } | undefined;
const PRICING_TTL_MS = 60 * 60 * 1000;

async function getModelPricing(): Promise<ModelPricing | undefined> {
  if (pricingCache && Date.now() - pricingCache.at < PRICING_TTL_MS) {
    return pricingCache.pricing;
  }
  try {
    const { models } = await gateway.getAvailableModels();
    const p = models.find((m) => m.id === MODEL)?.pricing;
    const pricing = p
      ? {
          input: Number(p.input),
          output: Number(p.output),
          cachedInputTokens:
            p.cachedInputTokens != null
              ? Number(p.cachedInputTokens)
              : undefined,
          cacheCreationInputTokens:
            p.cacheCreationInputTokens != null
              ? Number(p.cacheCreationInputTokens)
              : undefined,
        }
      : undefined;
    pricingCache = { at: Date.now(), pricing };
    return pricing;
  } catch (error) {
    console.error("[assistant] failed to fetch gateway pricing:", error);
    // Keep serving the chat without cost rather than failing the request.
    return pricingCache?.pricing;
  }
}

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

  const pricing = await getModelPricing();

  const agent = new ToolLoopAgent({
    model: MODEL,
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
    // Surface token usage and pricing to the client so the chat can show a
    // context-window meter and cost. The `finish` part carries the cumulative
    // usage for the turn.
    messageMetadata: ({ part }) =>
      part.type === "finish"
        ? { totalUsage: part.totalUsage, pricing }
        : undefined,
    onFinish: async () => {
      await mcpClient.close();
    },
    onError: (error) => {
      console.error("[assistant] stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
