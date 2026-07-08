import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager album editor", () => {
  it("adds a dedicated album editor screen", async () => {
    const source = await fs.readFile("manager/src/pages/AlbumEditor.tsx", "utf8");

    expect(source).toContain("export default function AlbumEditor");
    expect(source).toContain('kind: "albums"');
    expect(source).toContain("MarkdownPreview");
  });
});
