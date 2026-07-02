"use client";
import { useState } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { useDescription } from "@/app/mysteryhooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Plus } from "lucide-react";

export function EditableTournamentDescription() {
  const description = useDescription();
  const [draft, setDraft] = useState<string | null>(null);

  const setDescription = useMutation(({ storage }, value: string) => {
    storage.set("description", value);
  }, []);

  function save() {
    if (draft === null) return;
    setDescription(draft.trim());
    setDraft(null);
  }

  if (draft !== null) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setDraft(null);
            }
          }}
          rows={6}
          className="font-mono text-sm"
          aria-label="Turnauksen kuvaus (tukee markdownia)"
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} title="Tallenna (Ctrl+Enter)">
            Tallenna
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDraft(null)}
            title="Peruuta (Esc)"
          >
            Peruuta
          </Button>
        </div>
      </div>
    );
  }

  if (!description) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => setDraft("")}
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
        onClick={() => setDraft(description)}
      >
        <Pencil /> Muokkaa kuvausta
      </Button>
    </div>
  );
}
