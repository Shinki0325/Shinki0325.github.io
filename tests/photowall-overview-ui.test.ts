import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("photowall overview UI", () => {
  it("uses distinct album photos in a compact paper-board overview", async () => {
    const componentSource = await readFile(
      "src/components/photowall/PhotoWallClient.tsx",
      "utf8",
    );

    expect(componentSource).toContain("data-photo-special-masthead");
    expect(componentSource).toContain("data-album-paper");
    expect(componentSource).toContain("data-album-backing");
    expect(componentSource).toContain("data-album-new");
    expect(componentSource).toContain("new Set<string>()");
    expect(componentSource).not.toContain('className="photowall-hero archive-style-hero"');
    expect(componentSource).not.toContain("stackPhotosForAlbum");
    expect(componentSource).not.toContain("return [photos[1]");
  });
});
