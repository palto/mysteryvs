"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { AssistantChat } from "@/app/AssistantChat";
import { BotIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AssistantFAB() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Open AI Assistant"
        >
          <BotIcon className="size-6" />
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          forceMount
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 right-0 z-[60] flex w-[420px] max-w-full flex-col",
            "bg-background border-l border-border shadow-xl",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
            "duration-300",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <DialogPrimitive.Title className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BotIcon className="size-4" />
              AI Assistant
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <XIcon className="size-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <AssistantChat className="flex-1 min-h-0" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
