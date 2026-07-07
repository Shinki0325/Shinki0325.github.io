import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:44022",
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {})
  },
  webServer: {
    command: "bash scripts/serve-playwright.sh",
    port: 44022,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
