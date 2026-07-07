import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTextExtractFromAttachments } from "../src/lib/reference-extract";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const uploadsRoot = path.join(projectRoot, "public", "uploads");
const testFile = path.join(uploadsRoot, "__reference-extract-full-text.txt");
const multiPageFileA = path.join(uploadsRoot, "__reference-extract-page-1.txt");
const multiPageFileB = path.join(uploadsRoot, "__reference-extract-page-2.txt");

afterEach(() => {
  rmSync(testFile, { force: true });
  rmSync(multiPageFileA, { force: true });
  rmSync(multiPageFileB, { force: true });
});

describe("getTextExtractFromAttachments", () => {
  it("returns the full archived text by default", () => {
    mkdirSync(uploadsRoot, { recursive: true });
    const fullText = `${"段落资料".repeat(500)}\n结尾说明`;
    writeFileSync(testFile, fullText, "utf8");

    expect(
      getTextExtractFromAttachments(["/uploads/__reference-extract-full-text.txt"])
    ).toBe(fullText);
  });

  it("concatenates multiple text attachments in attachment order", () => {
    mkdirSync(uploadsRoot, { recursive: true });
    writeFileSync(multiPageFileA, "第一页第一段\n\n第一页第二段", "utf8");
    writeFileSync(multiPageFileB, "第二页第一段\n\n第二页第二段", "utf8");

    expect(
      getTextExtractFromAttachments([
        "/uploads/__reference-extract-page-1.txt",
        "/uploads/__reference-extract-page-2.txt"
      ])
    ).toBe("第一页第一段\n\n第一页第二段\n\n第二页第一段\n\n第二页第二段");
  });
});
