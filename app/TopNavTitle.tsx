"use client";
import Link from "next/link";
// Non-suspense entry point: returns null while storage loads (or when
// Liveblocks auth fails, e.g. logged out on /login), so the server-fetched
// name keeps rendering as the fallback.
import { useStorage } from "@liveblocks/react";

export function TopNavTitle({ initialName }: { initialName: string }) {
  const name = useStorage((root) => root.name);

  return (
    <Link
      href="/"
      className="font-semibold text-lg hover:text-muted-foreground"
    >
      {name || initialName}
    </Link>
  );
}
