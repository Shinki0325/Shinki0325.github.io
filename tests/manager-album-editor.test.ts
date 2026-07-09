import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager album editor", () => {
  it("adds a dedicated album editor screen aligned to the site album schema", async () => {
    const source = await fs.readFile("manager/src/pages/AlbumEditor.tsx", "utf8");
    const schemaSource = await fs.readFile("packages/content-core/src/schemas.ts", "utf8");

    expect(source).toContain("export default function AlbumEditor");
    expect(source).toContain("照片列表");
    expect(source).toContain('setVisibility(frontmatter.visibility === "hidden" ? "hidden" : "public")');
    expect(source).toContain("type AlbumPhoto");
    expect(source).toContain("url: string");
    expect(source).toContain("alt: string");
    expect(source).toContain("caption?: string");
    expect(source).toContain("credit?: string");
    expect(source).toContain("relatedReferences?: string[]");
    expect(source).toContain("relatedArticles?: string[]");
    expect(source).toContain("originalUrl?: string");
    expect(source).toContain("ImageUploadCropper");
    expect(source).toContain("handleUploadCover");
    expect(source).toContain("handleUploadPhoto");
    expect(source).toContain("handleCropCover");
    expect(source).toContain("getContentList");
    expect(source).toContain("选择相册");
    expect(source).toContain("NEW_ALBUM_VALUE");
    expect(source).toContain("album-editor__selector");
    expect(source).toContain("handleSelectAlbum");
    expect(source).toContain("album-editor__photo-grid");
    expect(source).toContain("updatePhoto");
    expect(source).toContain("removePhoto");
    expect(source).toContain("album-editor__image-workbench");
    expect(source).not.toContain("照片列表（JSON）");
    expect(schemaSource).toContain('visibility: z.enum(["public", "hidden"])');
    expect(schemaSource).toContain("originalUrl: z.string().optional()");
  });
});
