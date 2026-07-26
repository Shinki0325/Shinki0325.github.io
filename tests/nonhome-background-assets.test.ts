import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";

const expectedBackgrounds = Array.from(
  { length: 8 },
  (_, index) => `/uploads/backgrounds/nonhome/background-${String(index + 1).padStart(2, "0")}.webp`,
);

const existingBackgroundHashes = [
  "94cef1862cae6d5df3ea20ccb95b69ac3b31f9daced57de3121158e46274d18a",
  "da3032020ec205e8b19b83b51085a2c189e5116eeff22a3b6074e20053e70984",
  "0e1345bc3efb9b8cb078faad45ef1fd0d6da87f2eb6cf1df7ad033b37bac2795",
  "6a0b51eb2fa5691c7820a30ce13b6a6a690bb45ac80a3d3c525af49635a01617",
  "759fcbd5d9474cd6bb1ff18b77db2da2268b1fd40af3283d20594145c3d84a19",
  "f9e2ca1ff31e9bc4c6320d6b790fe0e355610b99be5bf2b58cc015d14b3cff75",
] as const;

describe("non-home background assets", () => {
  it("publishes eight unique bounded WebPs in the approved order", async () => {
    expect(siteShell.backgroundImages).toEqual(expectedBackgrounds);
    expect(new Set(siteShell.backgroundImages).size).toBe(8);

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

    expect(totalBytes).toBeLessThan(1_440_000);
  });

  it("preserves the approved bytes for backgrounds one through six", async () => {
    for (const [index, expectedHash] of existingBackgroundHashes.entries()) {
      const filePath = path.join(
        process.cwd(),
        "public",
        expectedBackgrounds[index].replace(/^\//, ""),
      );
      const digest = createHash("sha256").update(await readFile(filePath)).digest("hex");
      expect(digest).toBe(expectedHash);
    }
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
      "https://pic.imgdd.cc/i/033vzlAeg5a2I9w7bLmJIw.jpg",
      "https://pic.imgdd.cc/i/033vzl8H68RIKSzSipwoiM.jpg",
    ];

    originalUrls.forEach((url) => expect(source).toContain(url));
    expect(JSON.stringify(siteShell.backgroundImages)).not.toContain("pic.imgdd.cc");
    expect(source).toContain("withoutEnlargement: true");
    expect(source).toContain("quality: 80");
    expect(source).toContain("quality: 59");
    expect(source).toContain("effort: 6");
    expect(source).toContain("1_440_000");
  });
});
