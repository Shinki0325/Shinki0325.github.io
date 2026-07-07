import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("authoring docs", () => {
  it("documents references and scripts", () => {
    const doc = fs.readFileSync("docs/authoring.md", "utf8");
    expect(doc).toContain("src/content/references/");
    expect(doc).toContain("type: script");
    expect(doc).toContain("本地后台");
  });

  it("documents curated reference reading blocks", () => {
    const doc = fs.readFileSync("docs/authoring.md", "utf8");

    expect(doc).toContain("readingBlocks");
    expect(doc).toContain("focus: true");
    expect(doc).toContain("对照翻译");
    expect(doc).toContain("sourceLanguage");
    expect(doc).toContain("translationLanguage");
  });
});
