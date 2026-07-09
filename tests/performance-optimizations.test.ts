import { describe, expect, it } from "vitest";

describe("site performance optimizations", () => {
  it("generates lightweight archive thumbnails before static builds", async () => {
    const fs = await import("node:fs/promises");
    const [packageSource, generatorSource] = await Promise.all([
      fs.readFile("package.json", "utf8"),
      fs.readFile("scripts/generate-archive-thumbnails.mjs", "utf8"),
    ]);

    expect(packageSource).toContain("node scripts/generate-archive-thumbnails.mjs");
    expect(generatorSource).toContain("archive-thumbs");
    expect(generatorSource).toContain(".webp");
    expect(generatorSource).toContain("resize");
  });

  it("preconnects third-party media origins used on first paint", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/layouts/BaseLayout.astro", "utf8")
    );

    expect(source).toContain('rel="preconnect"');
    expect(source).toContain("https://s1.ax1x.com");
    expect(source).toContain("https://pic.imgdd.cc");
    expect(source).toContain("https://api.injahow.cn");
    expect(source).toContain("https://music.163.com");
  });
});
