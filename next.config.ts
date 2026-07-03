import type { NextConfig } from "next";
import { connect } from "node:net";
import z from "zod";

const LOCAL_DEV_SERVER_URL = "http://localhost:1153";

function isPortOpen(port: number, timeoutMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ port, host: "localhost", timeout: timeoutMs });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export default async function nextConfig(): Promise<NextConfig> {
  const useLocalDevServer = await isPortOpen(1153);

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
      LIVEBLOCKS_SECRET: useLocalDevServer ? z.string().optional() : z.string(),
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
