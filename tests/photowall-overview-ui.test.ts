import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("photowall overview UI", () => {
  it("uses the archive-style hero background while keeping album controls intact", async () => {
    const [componentSource, styleSource] = await Promise.all([
      readFile("src/components/photowall/PhotoWallClient.tsx", "utf8"),
      readFile("src/components/photowall/photowall.css", "utf8"),
    ]);

    expect(componentSource).toContain('className="photowall-hero archive-style-hero"');
    expect(componentSource).toContain('className="photowall-album-card__button"');
    expect(componentSource).not.toContain("data-album-backdrop");
    expect(styleSource).toContain(".photowall-hero.archive-style-hero");
    expect(styleSource).toContain(".photowall-hero.archive-style-hero::before");
    expect(styleSource).toContain("place-items: center");
    expect(styleSource).toContain("text-align: center");
    expect(styleSource).toContain(".photowall-albums");
    expect(styleSource).not.toContain(".photowall-backdrop");
  });
});
