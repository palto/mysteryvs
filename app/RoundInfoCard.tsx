"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trophy } from "lucide-react";
import {
  useHost,
  useRoundInstructions,
  useRoundLength,
  useRoundType,
} from "@/app/mysteryhooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RoundInfoCard() {
  const host = useHost()!;
  const roundType = useRoundType();
  const roundInstructions = useRoundInstructions();
  const roundLength = useRoundLength();
  const roundMinutes = Math.round(roundLength / 60000);

  return (
    <Card className="bg-muted/30">
      <CardContent className="py-4 px-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Järjestäjä</span>
            <span className="text-lg font-bold">{host}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Kierrosaika</span>
            <span className="text-lg font-bold">{roundMinutes} min</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {roundType === "score" ? (
            <>
              <Trophy className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Pistekierros</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Aikakierros</span>
            </>
          )}
        </div>
        {roundInstructions ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {roundInstructions}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Ei ohjeita kirjoitettu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
