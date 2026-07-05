"use client";
import { useMutation } from "@liveblocks/react/suspense";
import { useName } from "@/app/mysteryhooks";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Save, X } from "lucide-react";
import { useCallback, useState } from "react";

export function TournamentNameEditor() {
  const initialName = useName();
  const [value, setValue] = useState(initialName);
  const isDirty = value !== initialName;

  const setName = useMutation(({ storage }, name: string) => {
    storage.set("name", name);
  }, []);

  const handleSave = useCallback(() => {
    if (!value.trim() || !isDirty) return;
    setName(value.trim());
  }, [value, isDirty, setName]);

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

  return (
    <div className="space-y-2">
      <Label htmlFor="name">Turnauksen nimi</Label>
      <InputGroup>
        <InputGroupInput
          id="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
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
            disabled={!isDirty}
            title="Tallenna (Enter)"
          >
            <Save />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
