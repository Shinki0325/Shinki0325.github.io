import { stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";

const expectedBackgrounds = Array.from(
  { length: 6 },
  (_, index) => `/uploads/backgrounds/nonhome/background-${String(index + 1).padStart(2, "0")}.webp`,
);

describe("non-home background assets", () => {
  it("publishes six unique bounded WebPs in the approved order", async () => {
    expect(siteShell.backgroundImages).toEqual(expectedBackgrounds);
    expect(new Set(siteShell.backgroundImages).size).toBe(6);

    let totalBytes = 0;
    for (const publicPath of siteShell.backgroundImages) {
      const filePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
      const [fileStat, metadata] = await Promise.all([stat(filePath), sharp(filePath).metadata()]);
      totalBytes += fileStat.size;
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBeLessThanOrEqual(1920);
      expect(metadata.height).toBeLessThanOrEqual(1080);
      expect(fileStat.size).toBeLessThan(250_000);
    }

    expect(totalBytes).toBeLessThan(1_080_000);
  });

  it("keeps source provenance in the manual acquisition script only", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("scripts/acquire-nonhome-backgrounds.mjs", "utf8"),
    );
    const originalUrls = [
      "https://pic.imgdd.cc/i/033mKdPGvSW4H4Kdr8Z7qh.png",
      "https://pic.imgdd.cc/i/033mKdJZSowAnZfhAT19Jx.png",
      "https://pic.imgdd.cc/i/033mKdQMNqxcA7EXIMKPgG.png",
      "https://pic.imgdd.cc/i/033mRL5hL42K30lBIHwCpo.png",
      "https://pic.imgdd.cc/i/033mRL4ygydTIdfnHrklxE.png",
      "https://pic.imgdd.cc/i/033sANQbp4eAi1Iw97zRwt.png",
    ];

    originalUrls.forEach((url) => expect(source).toContain(url));
    expect(JSON.stringify(siteShell.backgroundImages)).not.toContain("pic.imgdd.cc");
    expect(source).toContain("withoutEnlargement: true");
    expect(source).toContain("quality: 80");
    expect(source).toContain("quality: 59");
    expect(source).toContain("effort: 6");
    expect(source).toContain("1_080_000");
  });
});
