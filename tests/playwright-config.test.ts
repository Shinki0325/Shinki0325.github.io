import { describe, expect, it } from "vitest";
import playwrightConfig from "../playwright.config";
import { readFileSync } from "node:fs";

describe("playwright config", () => {
  it("avoids machine-specific runtime assumptions", () => {
    const webServer = Array.isArray(playwrightConfig.webServer)
      ? playwrightConfig.webServer[0]
      : playwrightConfig.webServer;

    expect(String(webServer?.command ?? "")).not.toMatch(/codex-primary-runtime/i);
    expect(String(webServer?.command ?? "")).not.toMatch(/[A-Z]:\\Users\\/i);
    expect(playwrightConfig.use?.channel).toBeUndefined();
  });

  it("declares manager and shared packages in pnpm workspace", () => {
    const workspaceConfig = readFileSync("pnpm-workspace.yaml", "utf8");

    expect(workspaceConfig).toContain("packages:");
    expect(workspaceConfig).toContain("- manager");
    expect(workspaceConfig).toContain("- packages/*");
  });
});
