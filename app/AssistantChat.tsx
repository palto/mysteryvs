"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
  type ContextPricing,
} from "@/components/ai-elements/context";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  ASSISTANT_MODELS,
  DEFAULT_MODEL_ID,
  getAssistantModel,
} from "@/app/assistantModels";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import type { LanguageModelUsage, UIMessage } from "ai";
import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  RefreshCcwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AssistantChatProps {
  className?: string;
}

const SUGGESTIONS = [
  "Add Alice and Bob",
  "Set the round length to 20 minutes",
  "Rename the tournament to Mystery Night",
  "List the current participants",
];

const STORAGE_KEY = "assistant-chat";
const MODEL_STORAGE_KEY = "assistant-model";

// Token usage and pricing attached to assistant messages via the server's
// messageMetadata. Pricing comes from the AI Gateway model metadata.
type AssistantMetadata = {
  totalUsage?: LanguageModelUsage;
  pricing?: ContextPricing;
};
type AssistantUIMessage = UIMessage<AssistantMetadata>;

function loadMessages(): AssistantUIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssistantUIMessage[]) : [];
  } catch {
    return [];
  }
}

function loadModel(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  try {
    const raw = window.sessionStorage.getItem(MODEL_STORAGE_KEY);
    // Validate against the current list — getAssistantModel falls back to the
    // default if the stored id is unknown.
    return raw ? getAssistantModel(raw).id : DEFAULT_MODEL_ID;
  } catch {
    return DEFAULT_MODEL_ID;
  }
}

// The most recent turn's usage metadata. The model's input tokens already
// cover the whole prior conversation, so input + output approximates how full
// the context window is right now.
function latestMetadata(
  messages: AssistantUIMessage[],
): AssistantMetadata | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const metadata = messages[i].metadata;
    if (metadata?.totalUsage) return metadata;
  }
  return undefined;
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n\n");
}

export function AssistantChat({ className }: AssistantChatProps) {
  const [initialMessages] = useState<AssistantUIMessage[]>(loadMessages);
  const [model, setModel] = useState<string>(loadModel);
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
  } = useChat<AssistantUIMessage>({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });

  const meta = latestMetadata(messages);
  const usage = meta?.totalUsage;
  const contextWindow = getAssistantModel(model).contextWindow;

  // Persist the conversation so it survives reloads/navigation within the tab.
  // The AI SDK appends/updates `messages` while streaming, so this also
  // captures messages as they arrive from the stream.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (messages.length === 0) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // ignore quota / serialization errors
    }
  }, [messages]);

  // Remember the chosen model for the tab, mirroring the chat-history persistence.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {
      // ignore quota errors
    }
  }, [model]);

  function handleClear() {
    setMessages([]);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <div
      className={cn("flex flex-col h-full overflow-hidden bg-card", className)}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <DialogPrimitive.Title className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BotIcon className="size-4" />
          AI Assistant
        </DialogPrimitive.Title>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={
              messages.length === 0 ||
              status === "streaming" ||
              status === "submitted"
            }
          >
            <Trash2Icon className="size-3.5" />
            Clear
          </Button>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <XIcon className="size-4" />
            </Button>
          </DialogPrimitive.Close>
        </div>
      </div>

      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <ConversationEmptyState
                title="Tournament Setup Assistant"
                description='Try: "Add Alice and Bob" or "Set name to Mystery Night"'
              />
              <Suggestions>
                {SUGGESTIONS.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={(text) =>
                      sendMessage({ text }, { body: { model } })
                    }
                  />
                ))}
              </Suggestions>
            </div>
          )}

          {messages.map((message, i) => {
            const isLastAssistant =
              message.role === "assistant" && i === messages.length - 1;
            const isStreaming = isLastAssistant && status === "streaming";

            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, j) => {
                    switch (part.type) {
                      case "reasoning":
                        return (
                          <Reasoning
                            key={j}
                            isStreaming={
                              isStreaming && part.state === "streaming"
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );

                      case "text":
                        return (
                          <MessageResponse key={j} isAnimating={isStreaming}>
                            {part.text}
                          </MessageResponse>
                        );

                      case "dynamic-tool":
                        // MCP tools arrive as dynamic-tool parts.
                        return (
                          <Tool key={j}>
                            <ToolHeader
                              type="dynamic-tool"
                              state={part.state}
                              toolName={part.toolName}
                            />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput
                                output={part.output}
                                errorText={part.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );

                      default:
                        // Statically-typed tools (tool-${name}), if any.
                        if (isToolUIPart(part)) {
                          return (
                            <Tool key={j}>
                              <ToolHeader type={part.type} state={part.state} />
                              <ToolContent>
                                <ToolInput input={part.input} />
                                <ToolOutput
                                  output={part.output}
                                  errorText={part.errorText}
                                />
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                    }
                  })}

                  {message.role === "assistant" && !isStreaming && (
                    <AssistantMessageActions
                      text={messageText(message)}
                      onRegenerate={() =>
                        regenerate({ messageId: message.id, body: { model } })
                      }
                    />
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  Thinking…
                </span>
              </MessageContent>
            </Message>
          )}

          {status === "error" && (
            <div className="mx-auto flex flex-col items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
              <span>{error?.message ?? "Something went wrong."}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1 font-medium hover:bg-destructive/20"
                onClick={() => regenerate({ body: { model } })}
              >
                <RefreshCcwIcon className="size-3.5" />
                Retry
              </button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3">
        <PromptInput
          onSubmit={({ text }) => {
            if (!text.trim()) return;
            sendMessage({ text }, { body: { model } });
          }}
        >
          <PromptInputTextarea placeholder="Ask me to set up the tournament…" />
          <PromptInputFooter>
            <div className="flex items-center gap-1">
              <PromptInputSelect value={model} onValueChange={setModel}>
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {ASSISTANT_MODELS.map((m) => (
                    <PromptInputSelectItem key={m.id} value={m.id}>
                      {m.label}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
              {usage ? (
                <Context
                  maxTokens={contextWindow}
                  usedTokens={
                    (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
                  }
                  usage={usage}
                  pricing={meta?.pricing}
                >
                  <ContextTrigger />
                  <ContextContent>
                    <ContextContentHeader />
                    <ContextContentBody>
                      <ContextInputUsage />
                      <ContextOutputUsage />
                      <ContextReasoningUsage />
                      <ContextCacheUsage />
                    </ContextContentBody>
                    <ContextContentFooter />
                  </ContextContent>
                </Context>
              ) : null}
            </div>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function AssistantMessageActions({
  text,
  onRegenerate,
}: {
  text: string;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  return (
    <MessageActions className="opacity-0 transition-opacity group-hover:opacity-100">
      <MessageAction
        tooltip={copied ? "Copied!" : "Copy"}
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </MessageAction>
      <MessageAction tooltip="Regenerate" onClick={onRegenerate}>
        <RefreshCcwIcon className="size-3.5" />
      </MessageAction>
    </MessageActions>
  );
}
