import type { NextConfig } from "next";
import z from "zod";

const LOCAL_DEV_SERVER_URL = "http://localhost:1153";

// Detects a running `npx liveblocks dev` server so local development needs
// no environment variables at all. Checks for the dev server's own
// signature text (not just an open port) to avoid false positives from an
// unrelated service, and only ever runs when no cloud secret or manual
// base URL is already configured, so a real Liveblocks cloud connection is
// never silently overridden.
async function detectLocalLiveblocksDevServer(): Promise<boolean> {
  try {
    const res = await fetch(LOCAL_DEV_SERVER_URL, {
      signal: AbortSignal.timeout(500),
    });
    const body = await res.text();
    return body.includes("Liveblocks dev server");
  } catch {
    return false;
  }
}

export default async function nextConfig(): Promise<NextConfig> {
  const hasCloudSecret = Boolean(process.env.LIVEBLOCKS_SECRET);
  const hasManualBaseUrl = Boolean(process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL);
  const useLocalDevServer =
    !hasCloudSecret &&
    !hasManualBaseUrl &&
    (await detectLocalLiveblocksDevServer());

  if (useLocalDevServer) {
    // Real process.env mutation so every piece of server code in this
    // process (instrumentation.ts, app/liveblocks/liveblocks.ts, route
    // handlers, server components) sees it via plain Node.js process.env,
    // independent of the `env` field below (which only covers what gets
    // inlined into the browser bundle).
    process.env.NEXT_PUBLIC_LIVEBLOCKS_BASE_URL = LOCAL_DEV_SERVER_URL;
  }

  const envValidationResult = z
    .object({
      LIVEBLOCKS_SECRET:
        hasCloudSecret || useLocalDevServer
          ? z.string().optional()
          : z.string(),
      SESSION_SECRET: z.string().min(32),
    })
    .safeParse(process.env);

  if (!envValidationResult.success) {
    console.error(
      "Invalid or missing environment variables",
      envValidationResult.error.issues.map((i) => i.path.join(".")),
    );
    process.exit(1);
  }

  return {
    env: useLocalDevServer
      ? { NEXT_PUBLIC_LIVEBLOCKS_BASE_URL: LOCAL_DEV_SERVER_URL }
      : {},
  };
}
