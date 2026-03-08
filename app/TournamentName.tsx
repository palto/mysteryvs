"use client";

import { useName } from "@/app/mysteryhooks";

export function TournamentName() {
  const name = useName();
  return <>{name}</>;
}
