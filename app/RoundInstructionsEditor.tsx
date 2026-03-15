"use client";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

export function RoundInstructionsEditor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    { field: "round-instructions" },
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Kierroksen ohjeet
      </h3>
      <div className="rounded-md border">
        <BlockNoteView editor={editor} theme="dark" />
      </div>
    </div>
  );
}
