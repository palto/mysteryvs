"use client";
import { useMutation } from "@liveblocks/react/suspense";
import { useDescription } from "@/app/mysteryhooks";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useCallback, useState } from "react";

export function TournamentDescriptionEditor() {
  const initialDescription = useDescription();
  const [value, setValue] = useState(initialDescription);
  const isDirty = value !== initialDescription;

  const setDescription = useMutation(({ storage }, description: string) => {
    storage.set("description", description);
  }, []);

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    setDescription(value);
  }, [value, isDirty, setDescription]);

  const handleDiscard = useCallback(() => {
    setValue(initialDescription);
  }, [initialDescription]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleDiscard();
      }
    },
    [handleSave, handleDiscard],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="description">Kuvaus (tukee markdownia)</Label>
      <textarea
        id="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
      />
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
          disabled={!isDirty}
          title="Tallenna (Ctrl+Enter)"
        >
          <Save /> Tallenna
        </Button>
      </div>
    </div>
  );
}
