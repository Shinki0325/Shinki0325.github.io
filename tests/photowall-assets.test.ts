import { readFile, stat } from "node:fs/promises";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const albumPath = "src/content/albums/隐藏cg.md";
const outputPaths = [
  "public/uploads/albums/hidden-cg/hidden-cg-03.webp",
  "public/uploads/albums/hidden-cg/hidden-cg-04.webp",
];

describe("photowall hidden CG assets", () => {
  it("publishes four unique photos with the approved metadata", async () => {
    const source = await readFile(albumPath, "utf8");
    const urls = [...source.matchAll(/url: "(\/uploads\/albums\/hidden-cg\/[^\"]+)"/g)].map(
      ([, url]) => url,
    );

    expect(urls).toHaveLength(4);
    expect(new Set(urls).size).toBe(4);
    expect(source).toContain('cover: "/uploads/albums/hidden-cg/hidden-cg-03.webp"');
    expect(source).toContain("date: 2026-07-15");
    expect(source).toContain('alt: "白色水手服坐姿造型"');
    expect(source).toContain(
      'caption: "白色水手服与角色头像叠合的全身坐姿构图，保留柔和浅色背景。"',
    );
    expect(source).toContain('alt: "黑白服装与角色色纸俯拍"');
    expect(source).toContain(
      'caption: "黑白服装、角色色纸与鞋履共同进入画面的俯拍构图。"',
    );
    expect(source).not.toMatch(/857ae5f9c76ec680adf15dbe591fd0f1|ba1a3ab703c011497c863792c083e816/);
  });

  it.each(outputPaths)("normalizes %s as a bounded WebP", async (path) => {
    const [metadata, file] = await Promise.all([sharp(path).metadata(), stat(path)]);
    const longEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0);

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);
    expect(longEdge).toBeLessThanOrEqual(2400);
    expect(file.size).toBeLessThan(1_200_000);
  });
});
