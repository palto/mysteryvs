"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { BotIcon } from "lucide-react";
import { useMemo } from "react";

export function AssistantChat() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant" }),
    [],
  );
  const { messages, sendMessage, status, stop } = useChat({ transport });

  return (
    <div className="flex flex-col h-[480px] border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-sm font-medium text-muted-foreground">
        <BotIcon className="size-4" />
        AI Assistant
      </div>

      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              title="Tournament Setup Assistant"
              description='Try: "Add Alice and Bob" or "Set name to Mystery Night"'
            />
          )}
          {messages.map((message, i) => {
            const textContent = message.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("");

            if (!textContent) return null;

            const isLastAssistant =
              message.role === "assistant" && i === messages.length - 1;

            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  <MessageResponse
                    isAnimating={isLastAssistant && status === "streaming"}
                  >
                    {textContent}
                  </MessageResponse>
                </MessageContent>
              </Message>
            );
          })}
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
