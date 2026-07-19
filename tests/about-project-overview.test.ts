import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import bangumiCollections from "../src/data/bangumi-collections.json";
import { buildAboutCollectionPayload } from "../src/lib/about-collection";
import { GET, prerender } from "../src/pages/data/about-collection.json";

describe("About project overview production assets", () => {
  it("defines a prerendered deferred collection endpoint", async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(prerender).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    await expect(response.json()).resolves.toEqual(
      buildAboutCollectionPayload(bangumiCollections),
    );
  });

  it("ships the approved bounded transparent guide WebP", async () => {
    const filePath = path.join(
      process.cwd(),
      "public/uploads/about/about-guide-character.webp",
    );
    const [file, bytes, metadata] = await Promise.all([
      stat(filePath),
      readFile(filePath),
      sharp(filePath).metadata(),
    ]);
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(696);
    expect(metadata.height).toBe(1773);
    expect(metadata.hasAlpha).toBe(true);
    expect(file.size).toBeLessThan(180_000);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "afaa50f82b55fcf44befca82a39a7e98510025e03e0cb62b4229eb630fbd4f79",
    );
  });
});
