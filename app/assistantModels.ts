// Curated set of Claude models the AI assistant can run on, shared between the
// chat UI (the model selector) and the API route (which validates the incoming
// id and runs the agent). The ids are AI Gateway slugs (provider/model-id) — the
// app routes through the gateway, so no provider packages are needed.

export type AssistantModel = {
  /** AI Gateway model id, e.g. "anthropic/claude-haiku-4.5". */
  id: string;
  /** Label shown in the selector dropdown. */
  label: string;
  /** Context window in tokens; drives the chat's usage meter. */
  contextWindow: number;
};

export const ASSISTANT_MODELS: AssistantModel[] = [
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    contextWindow: 200_000,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    contextWindow: 200_000,
  },
  {
    id: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    contextWindow: 200_000,
  },
];

/** The default model — the first (fastest/cheapest) in the curated list. */
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
