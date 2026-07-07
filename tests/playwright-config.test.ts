import { describe, expect, it } from "vitest";
import playwrightConfig from "../playwright.config";
import { existsSync, readFileSync } from "node:fs";

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
    expect(workspaceConfig).toContain("- .");
    expect(workspaceConfig).toContain("- manager");
    expect(workspaceConfig).toContain("- packages/*");
  });

  it("keeps task 1 root and manager scaffolding aligned with the approved plan", () => {
    const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
    const managerPackage = JSON.parse(readFileSync("manager/package.json", "utf8"));
    const managerTsconfig = JSON.parse(readFileSync("manager/tsconfig.json", "utf8"));

    expect(rootPackage.scripts).toMatchObject({
      dev: expect.any(String),
      "dev:manager": expect.any(String),
      build: expect.any(String),
      "build:manager": expect.any(String),
      "check:links": expect.any(String),
      "validate:public": expect.any(String),
    });
    expect(managerPackage.scripts.server).toBe("tsx server/index.ts");
    expect(managerPackage.scripts).toMatchObject({
      dev: "vite",
      build: "vite build",
      server: "tsx server/index.ts",
    });
    expect(managerTsconfig.include).toContain("server");
    expect(existsSync("manager/index.html")).toBe(true);
    expect(existsSync("manager/src/main.ts")).toBe(true);
    expect(existsSync("manager/server/index.ts")).toBe(true);
  });
});
