"use client";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export function RoundInstructionsEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({}, { field: "round-instructions" });

  return (
    <div className="w-full rounded-md border">
      <BlockNoteView editor={editor} />
    </div>
  );
}
