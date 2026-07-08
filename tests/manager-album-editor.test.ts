import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager album editor", () => {
  it("adds a dedicated album editor screen aligned to the site album schema", async () => {
    const source = await fs.readFile("manager/src/pages/AlbumEditor.tsx", "utf8");
    const schemaSource = await fs.readFile("packages/content-core/src/schemas.ts", "utf8");

    expect(source).toContain("export default function AlbumEditor");
    expect(source).toContain("照片列表（JSON）");
    expect(source).toContain('setVisibility(frontmatter.visibility === "private" ? "private" : "public")');
    expect(source).toContain("type AlbumPhoto");
    expect(source).toContain("src: string");
    expect(source).toContain("alt: string");
    expect(source).toContain("caption?: string");
    expect(source).toContain("width?: number");
    expect(source).toContain("height?: number");
    expect(source).toContain("featured?: boolean");
    expect(schemaSource).toContain('visibility: z.enum(["public", "private"])');
  });
});
