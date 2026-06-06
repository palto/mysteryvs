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
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { CheckIcon, CopyIcon, RefreshCcwIcon } from "lucide-react";
import { useMemo, useState } from "react";
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

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n\n");
}

export function AssistantChat({ className }: AssistantChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant" }),
    [],
  );
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport,
  });

  return (
    <div
      className={cn("flex flex-col h-full overflow-hidden bg-card", className)}
    >
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
                    onClick={(text) => sendMessage({ text })}
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
                      onRegenerate={() => regenerate({ messageId: message.id })}
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
                onClick={() => regenerate()}
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
            sendMessage({ text });
          }}
        >
          <PromptInputTextarea placeholder="Ask me to set up the tournament…" />
          <PromptInputFooter>
            <div />
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
