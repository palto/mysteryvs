"use client";
import { setName } from "@/app/admin/actions";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Check, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export function TournamentNameEditor({ initialName }: { initialName: string }) {
  const [value, setValue] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDirty = value !== initialName && !isPending;
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(() => {
    if (!value.trim() || !isDirty) return;
    const formData = new FormData();
    formData.set("name", value.trim());
    startTransition(async () => {
      await setName(formData);
      setSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    });
  }, [value, isDirty]);

  const handleDiscard = useCallback(() => {
    setValue(initialName);
  }, [initialName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
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
      <Label htmlFor="name">Turnauksen nimi</Label>
      <InputGroup>
        <InputGroupInput
          id="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <InputGroupAddon align="inline-end">
          {isDirty && (
            <InputGroupButton
              size="icon-sm"
              onClick={handleDiscard}
              title="Hylkää muutokset (Esc)"
            >
              <X />
            </InputGroupButton>
          )}
          <InputGroupButton
            size="icon-sm"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            title="Tallenna (Enter)"
            className={
              saved
                ? "bg-green-500 text-white hover:bg-green-500 hover:text-white transition-colors"
                : "transition-colors"
            }
          >
            {saved ? <Check /> : <Save />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
