import { describe, expect, it } from "vitest";
import { albumSchema } from "../packages/content-core/src/index";

describe("album schema", () => {
  it("parses public albums with relationship metadata and photo defaults", () => {
    const parsed = albumSchema.parse({
      title: "站点素材墙示例",
      date: "2026-07-08",
      summary: "用于照片墙路由联调的公开示例相册。",
      visibility: "public",
      pinned: true,
      relatedArticles: ["galgame-90s-golden-age"],
      relatedReferences: ["visual-novel-origins-famitsu"],
      photos: [
        {
          url: "https://images.example.com/album/cover-01.jpg",
          alt: "首页封面概念图",
          caption: "主视觉候选",
          credit: "Example Studio",
          relatedArticles: ["galgame-90s-golden-age"],
          relatedReferences: ["visual-novel-origins-famitsu"],
        },
      ],
    });

    expect(parsed.visibility).toBe("public");
    expect(parsed.pinned).toBe(true);
    expect(parsed.draft).toBe(false);
    expect(parsed.tags).toEqual([]);
    expect(parsed.photos[0]?.credit).toBe("Example Studio");
    expect(parsed.photos[0]?.relatedArticles).toEqual(["galgame-90s-golden-age"]);
  });

  it("requires at least one photo per album", () => {
    expect(() =>
      albumSchema.parse({
        title: "空相册",
        date: "2026-07-08",
        summary: "不应该通过校验。",
        photos: [],
      }),
    ).toThrow(/at least 1|too_small/i);
  });
});
