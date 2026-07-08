import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager album editor", () => {
  it("adds a dedicated album editor screen aligned to the site album schema", async () => {
    const source = await fs.readFile("manager/src/pages/AlbumEditor.tsx", "utf8");
    const schemaSource = await fs.readFile("packages/content-core/src/schemas.ts", "utf8");

    expect(source).toContain("export default function AlbumEditor");
    expect(source).toContain("照片列表（JSON）");
    expect(source).toContain('setVisibility(frontmatter.visibility === "hidden" ? "hidden" : "public")');
    expect(source).toContain("type AlbumPhoto");
    expect(source).toContain("url: string");
    expect(source).toContain("alt: string");
    expect(source).toContain("caption?: string");
    expect(source).toContain("credit?: string");
    expect(source).toContain("relatedReferences?: string[]");
    expect(source).toContain("relatedArticles?: string[]");
    expect(schemaSource).toContain('visibility: z.enum(["public", "hidden"])');
  });
});
