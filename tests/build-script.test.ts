import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageJsonPath = path.resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  scripts?: Record<string, string>;
};

describe("build script", () => {
  it("cleans dist before running astro build", () => {
    expect(packageJson.scripts?.build).toMatch(/rm -rf\s+.*dist.*astro build/);
  });
});
