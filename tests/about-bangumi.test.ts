import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("about Bangumi panel", () => {
  it("defers the full collection while rendering the showcase", async () => {
    const aboutSource = await readFile("src/pages/about.astro", "utf8");

    expect(aboutSource).toContain("buildAboutCollectionPayload");
    expect(aboutSource).toContain("collection.showcase.map");
    expect(aboutSource).toContain("data-about-collection-panel");
    expect(aboutSource).not.toContain('grid.querySelectorAll("[data-bangumi-card]")');
    expect(aboutSource).not.toContain("displayedBangumiItems.map");
  });
});
