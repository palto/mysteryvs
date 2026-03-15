"use client";
import { setDescription } from "@/app/admin/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

export function TournamentDescriptionEditor({
  initialDescription,
}: {
  initialDescription: string;
}) {
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    { field: "description-editor" },
  );

  // On first mount, if the collaborative doc is empty, seed it from the saved markdown.
  // Subsequent opens will find the Y.js doc already populated.
  useEffect(() => {
    async function initFromMarkdown() {
      const content = editor.document[0].content;
      const isEmpty =
        editor.document.length === 1 &&
        (!content || (Array.isArray(content) && content.length === 0));
      if (isEmpty && initialDescription) {
        const blocks = await editor.tryParseMarkdownToBlocks(initialDescription);
        editor.replaceBlocks(editor.document, blocks);
      }
    }
    initFromMarkdown();
  }, []);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      const formData = new FormData();
      formData.set("description", markdown);
      await setDescription(formData);
      setSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    });
  }, [editor]);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-2 mb-6">
      <Label>Kuvaus (tukee markdownia)</Label>
      <div className="rounded-md border">
        <BlockNoteView editor={editor} theme="dark" />
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          title="Tallenna"
          className={
            saved
              ? "bg-green-500 text-white hover:bg-green-500 hover:text-white transition-colors"
              : "transition-colors"
          }
        >
          {saved ? <Check /> : <Save />} Tallenna
        </Button>
      </div>
    </div>
  );
}
