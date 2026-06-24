// Models the AI assistant can run on, shown in the model selector and validated
// server-side. The ids are AI Gateway slugs (provider/model-id) — the app routes
// through the gateway, so no provider packages are needed. Descriptions show
// input / output price per 1M tokens.

export type AssistantModel = {
  /** AI Gateway model id, e.g. "deepseek/deepseek-v4-flash". */
  id: string;
  /** Label shown in the selector. */
  label: string;
  /** Short sublabel (here, the per-1M-token price). */
  description: string;
  /** Provider slug for the ai-elements model-selector logo (models.dev). */
  provider: string;
  /** Context window in tokens; drives the chat's usage meter. */
  contextWindow: number;
};

export const ASSISTANT_MODELS: AssistantModel[] = [
  {
    id: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "$0.14 / $0.28 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.5-flash",
    label: "Qwen 3.5 Flash",
    description: "$0.10 / $0.40 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    description: "$1.00 / $5.00 per M",
    provider: "anthropic",
    contextWindow: 200_000,
  },
];

/** The default model — DeepSeek V4 Flash. */
export const DEFAULT_MODEL_ID = "deepseek/deepseek-v4-flash";

/** Look up a model by id, falling back to the default. */
export function getAssistantModel(id: string | undefined): AssistantModel {
  return (
    ASSISTANT_MODELS.find((m) => m.id === id) ??
    ASSISTANT_MODELS.find((m) => m.id === DEFAULT_MODEL_ID) ??
    ASSISTANT_MODELS[0]
  );
}

/**
 * Validate a client-supplied model id against the allowed list, returning the
 * default when it's missing or not one we offer. Never trust the raw value —
 * it comes from the request body.
 */
export function resolveModelId(id: unknown): string {
  return typeof id === "string" && ASSISTANT_MODELS.some((m) => m.id === id)
    ? id
    : DEFAULT_MODEL_ID;
}
