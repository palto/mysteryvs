"use client";
import { setDescription } from "@/app/admin/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export function TournamentDescriptionEditor({
  initialDescription,
}: {
  initialDescription: string;
}) {
  const [value, setValue] = useState(initialDescription);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDirty = value !== initialDescription && !isPending;
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    const formData = new FormData();
    formData.set("description", value);
    startTransition(async () => {
      await setDescription(formData);
      setSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    });
  }, [value, isDirty]);

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

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="description">Kuvaus (tukee markdownia)</Label>
      <textarea
        id="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
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
          disabled={isPending || !isDirty}
          title="Tallenna (Ctrl+Enter)"
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
