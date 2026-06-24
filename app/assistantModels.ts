// Models the AI assistant can run on, shown in the searchable model selector
// and validated server-side. The ids are AI Gateway slugs (provider/model-id) —
// the app routes through the gateway, so no provider packages are needed.
//
// The DeepSeek and Qwen entries below are generated from the gateway's full
// model list (all DeepSeek + all Qwen language models); the descriptions show
// input / output price per 1M tokens so cheaper options are easy to spot.

export type AssistantModel = {
  /** AI Gateway model id, e.g. "anthropic/claude-haiku-4.5". */
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
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    description: "Fast and affordable",
    provider: "anthropic",
    contextWindow: 200_000,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    description: "Balanced speed and capability",
    provider: "anthropic",
    contextWindow: 200_000,
  },
  {
    id: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    description: "Most capable",
    provider: "anthropic",
    contextWindow: 200_000,
  },
  {
    id: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "$0.14 / $0.28 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v3.2",
    label: "DeepSeek V3.2",
    description: "$0.28 / $0.42 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v3.1-terminus",
    label: "DeepSeek V3.1 Terminus",
    description: "$0.27 / $1.00 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    description: "$0.43 / $0.87 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v3",
    label: "DeepSeek V3 0324",
    description: "$0.27 / $1.12 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v3.1",
    label: "DeepSeek V3.1",
    description: "$0.56 / $1.68 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-v3.2-thinking",
    label: "DeepSeek V3.2 Thinking",
    description: "$0.62 / $1.85 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "deepseek/deepseek-r1",
    label: "DeepSeek-R1",
    description: "$1.35 / $5.40 per M",
    provider: "deepseek",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen-3-14b",
    label: "Qwen3-14B",
    description: "$0.12 / $0.24 per M",
    provider: "qwen",
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
    id: "alibaba/qwen-3-30b",
    label: "Qwen3-30B-A3B",
    description: "$0.12 / $0.50 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-coder-30b-a3b",
    label: "Qwen 3 Coder 30B A3B Instruct",
    description: "$0.15 / $0.60 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen-3-32b",
    label: "Qwen 3 32B",
    description: "$0.16 / $0.64 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen-3-235b",
    label: "Qwen3 235B A22B",
    description: "$0.22 / $0.88 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-next-80b-a3b-instruct",
    label: "Qwen3 Next 80B A3B Instruct",
    description: "$0.15 / $1.20 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-next-80b-a3b-thinking",
    label: "Qwen3 Next 80B A3B Thinking",
    description: "$0.15 / $1.20 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-coder-next",
    label: "Qwen3 Coder Next",
    description: "$0.50 / $1.20 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-vl-235b-a22b-instruct",
    label: "Qwen3 VL 235B A22B Instruct",
    description: "$0.40 / $1.60 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-vl-instruct",
    label: "Qwen3 VL 235B A22B Instruct",
    description: "$0.40 / $1.60 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.7-plus",
    label: "Qwen 3.7 Plus",
    description: "$0.40 / $1.60 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.5-plus",
    label: "Qwen 3.5 Plus",
    description: "$0.40 / $2.40 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.6-plus",
    label: "Qwen 3.6 Plus",
    description: "$0.50 / $3.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.6-27b",
    label: "Qwen 3.6 27B",
    description: "$0.60 / $3.60 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-235b-a22b-thinking",
    label: "Qwen3 VL 235B A22B Thinking",
    description: "$0.40 / $4.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-vl-thinking",
    label: "Qwen3 VL 235B A22B Thinking",
    description: "$0.40 / $4.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3.7-max",
    label: "Qwen 3.7 Max",
    description: "$1.25 / $3.75 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-coder-plus",
    label: "Qwen3 Coder Plus",
    description: "$1.00 / $5.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-max",
    label: "Qwen3 Max",
    description: "$1.20 / $6.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-max-preview",
    label: "Qwen3 Max Preview",
    description: "$1.20 / $6.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-max-thinking",
    label: "Qwen 3 Max Thinking",
    description: "$1.20 / $6.00 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen3-coder",
    label: "Qwen3 Coder 480B A35B Instruct",
    description: "$1.50 / $7.50 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
  {
    id: "alibaba/qwen-3.6-max-preview",
    label: "Qwen 3.6 Max Preview",
    description: "$1.30 / $7.80 per M",
    provider: "qwen",
    contextWindow: 128_000,
  },
];

/** The default model — Claude Haiku, the cheapest fast Claude option. */
export const DEFAULT_MODEL_ID = ASSISTANT_MODELS[0].id;

/** Look up a model by id, falling back to the default. */
export function getAssistantModel(id: string | undefined): AssistantModel {
  return ASSISTANT_MODELS.find((m) => m.id === id) ?? ASSISTANT_MODELS[0];
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
