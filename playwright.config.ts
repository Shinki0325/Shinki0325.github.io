import { defineConfig } from "@playwright/test";

const nodeBin =
  "C:/Users/linru/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4321",
    channel: "msedge"
  },
  webServer: {
    command: `"${nodeBin}" ./node_modules/astro/astro.js dev --host 127.0.0.1 --port 4321`,
    port: 4321,
    reuseExistingServer: true,
    timeout: 120000
  }
});
