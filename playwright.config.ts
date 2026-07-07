import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4322",
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {})
  },
  webServer: {
    command:
      "pnpm --config.minimum-release-age=0 astro build && pnpm --config.minimum-release-age=0 astro preview --host 127.0.0.1 --port 4322",
    port: 4322,
    reuseExistingServer: false,
    timeout: 120000
  }
});
