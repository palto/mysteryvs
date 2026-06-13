import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

// Server-side Composio client, wired to the Vercel AI SDK provider so that
// `composio.tools.get(...)` returns tools in the AI SDK `ToolSet` shape that the
// assistant agent (app/api/assistant/route.ts) consumes directly.
export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
  provider: new VercelProvider(),
});

// Auth config (`ac_...`) created once in the Composio dashboard for the Google
// Sheets OAuth integration. Reused across all users; each user authorizes their
// own Google account against it.
export const GOOGLE_SHEETS_AUTH_CONFIG_ID =
  process.env.COMPOSIO_GOOGLE_SHEETS_AUTH_CONFIG_ID!;

// Composio toolkit slug for Google Sheets.
export const GOOGLE_SHEETS_TOOLKIT = "googlesheets";
