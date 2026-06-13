"use server";

import { headers } from "next/headers";
import { getUsername } from "@/app/login/getUsername";
import {
  composio,
  GOOGLE_SHEETS_AUTH_CONFIG_ID,
} from "@/app/composio/composio";

// We key Composio connected accounts on the app username (the same value used
// for Liveblocks auth), so each logged-in user authorizes their own Google
// account.
async function requireUserId(): Promise<string> {
  const username = await getUsername();
  if (!username) throw new Error("You must be logged in.");
  return username;
}

async function findActiveConnection(userId: string) {
  const { items } = await composio.connectedAccounts.list({
    userIds: [userId],
    authConfigIds: [GOOGLE_SHEETS_AUTH_CONFIG_ID],
    statuses: ["ACTIVE"],
  });
  return items[0] ?? null;
}

export async function getGoogleSheetsConnectionStatus(): Promise<{
  connected: boolean;
}> {
  const userId = await getUsername();
  if (!userId) return { connected: false };
  const connection = await findActiveConnection(userId);
  return { connected: connection !== null };
}

export async function connectGoogleSheets(): Promise<{ redirectUrl: string }> {
  const userId = await requireUserId();

  // Land the user back in the app after they finish the Google OAuth consent.
  // Composio appends `?status=success|failed` and finalizes the connection
  // server-side via its own callback.
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const callbackUrl = `${proto}://${host}/`;

  const connectionRequest = await composio.connectedAccounts.link(
    userId,
    GOOGLE_SHEETS_AUTH_CONFIG_ID,
    { callbackUrl },
  );

  if (!connectionRequest.redirectUrl) {
    throw new Error("Composio did not return an authorization URL.");
  }
  return { redirectUrl: connectionRequest.redirectUrl };
}

export async function disconnectGoogleSheets(): Promise<{
  connected: boolean;
}> {
  const userId = await requireUserId();
  const connection = await findActiveConnection(userId);
  if (connection) {
    await composio.connectedAccounts.delete(connection.id);
  }
  return { connected: false };
}
