"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import type { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useDescription } from "@/app/mysteryhooks";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Pencil, Plus, X } from "lucide-react";

export function EditableTournamentDescription() {
  const description = useDescription();
  const [isEditing, setIsEditing] = useState(false);

  const setDescription = useMutation(({ storage }, value: string) => {
    storage.set("description", value);
  }, []);

  async function handleSave(editor: BlockNoteEditor) {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setDescription(markdown.trim());
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <DescriptionEditor
        initialMarkdown={description}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!description) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => setIsEditing(true)}
      >
        <Plus /> Lisää kuvaus
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="prose prose-sm dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => setIsEditing(true)}
      >
        <Pencil /> Muokkaa kuvausta
      </Button>
    </div>
  );
}

function DescriptionEditor({
  initialMarkdown,
  onSave,
  onCancel,
}: {
  initialMarkdown: string;
  onSave: (editor: BlockNoteEditor) => void;
  onCancel: () => void;
}) {
  const editor = useCreateBlockNote();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !initialMarkdown) return;
    loadedRef.current = true;
    (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [editor, initialMarkdown]);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border">
        <BlockNoteView editor={editor} theme="dark" />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onSave(editor)}>
          <Check className="w-4 h-4 mr-1" />
          Tallenna
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          Peruuta
        </Button>
      </div>
    </div>
  );
}
