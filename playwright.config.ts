import { defineConfig } from "@playwright/test";
import { URL } from "url";

// Parse the proxy from environment variables so Chromium can reach external
// services (e.g. liveblocks.io) through the same proxy that Node.js uses.
//
// Note: Chromium 1194 does not send proxy auth credentials for WebSocket
// CONNECT tunneling, only for HTTP requests. As a result, wss:// connections
// to liveblocks.io fail with "Proxy authentication failed" despite correct
// credentials being set. Pages that depend on Liveblocks WebSocket (Room
// component / ClientSideSuspense) will stay at "Loading…" in this environment.
const rawProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
let proxy: { server: string; username?: string; password?: string; bypass?: string } | undefined;
let proxyArgs: string[] = [];
if (rawProxy) {
  const parsed = new URL(rawProxy);
  proxy = {
    server: `${parsed.protocol}//${parsed.host}`,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    bypass: "localhost,127.0.0.1,::1",
  };
  // Also pass bypass via Chromium args — the Playwright-level bypass does not
  // reliably prevent localhost traffic from going through the proxy in older
  // Chromium builds.
  proxyArgs = ["--proxy-bypass-list=localhost;127.0.0.1;::1"];
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
    proxy,
    launchOptions: { args: proxyArgs },
  },
  projects: [
    {
      name: "chromium",
      use: {
        executablePath:
          "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
