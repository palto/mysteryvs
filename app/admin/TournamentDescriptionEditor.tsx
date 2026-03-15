"use client";
import { setDescription } from "@/app/admin/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

export function TournamentDescriptionEditor({
  initialDescription,
}: {
  initialDescription: string;
}) {
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  const editor = useCreateBlockNote();

  useEffect(() => {
    async function init() {
      const blocks = await editor.tryParseMarkdownToBlocks(initialDescription);
      editor.replaceBlocks(editor.document, blocks);
      initializedRef.current = true;
    }
    init();
  }, []);

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    startTransition(async () => {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      const formData = new FormData();
      formData.set("description", markdown);
      await setDescription(formData);
      setSaved(true);
      setIsDirty(false);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    });
  }, [editor, isDirty]);

  const handleDiscard = useCallback(async () => {
    const blocks = await editor.tryParseMarkdownToBlocks(initialDescription);
    editor.replaceBlocks(editor.document, blocks);
    setIsDirty(false);
  }, [editor, initialDescription]);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-2 mb-6">
      <Label>Kuvaus (tukee markdownia)</Label>
      <div className="rounded-md border">
        <BlockNoteView
          editor={editor}
          theme="dark"
          onChange={() => {
            if (initializedRef.current) setIsDirty(true);
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        {isDirty && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDiscard}
            title="Hylkää muutokset (Esc)"
          >
            <X /> Hylkää
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !isDirty}
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
