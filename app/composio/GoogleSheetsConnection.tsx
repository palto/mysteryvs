"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckIcon, SheetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  connectGoogleSheets,
  disconnectGoogleSheets,
  getGoogleSheetsConnectionStatus,
} from "@/app/composio/actions";

// Per-user "Connect Google Sheets" control shown in the assistant panel header.
// Connection state is keyed on the logged-in username server-side.
export function GoogleSheetsConnection() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    getGoogleSheetsConnectionStatus()
      .then(({ connected }) => setConnected(connected))
      .catch(() => setConnected(false));
  };

  useEffect(() => {
    refresh();
    // Re-check when the user returns from the Composio OAuth redirect.
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const onConnect = () => {
    startTransition(async () => {
      const { redirectUrl } = await connectGoogleSheets();
      window.location.href = redirectUrl;
    });
  };

  const onDisconnect = () => {
    startTransition(async () => {
      await disconnectGoogleSheets();
      setConnected(false);
    });
  };

  if (connected === null) {
    return <Spinner className="size-4 text-muted-foreground" />;
  }

  if (connected) {
    return (
      <button
        type="button"
        onClick={onDisconnect}
        disabled={isPending}
        title="Click to disconnect Google Sheets"
        className="group inline-flex items-center gap-1 rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      >
        <CheckIcon className="size-3 group-hover:hidden" />
        <span className="group-hover:hidden">Sheets connected</span>
        <span className="hidden group-hover:inline">Disconnect Sheets</span>
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={onConnect}
      disabled={isPending}
    >
      {isPending ? (
        <Spinner className="size-3.5" />
      ) : (
        <SheetIcon className="size-3.5" />
      )}
      Connect Google Sheets
    </Button>
  );
}
