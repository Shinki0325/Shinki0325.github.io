import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import { buildHomeSearchIndex, buildHomeViewModel } from "../src/lib/home-shell";

describe("site shell config", () => {
  it("uses 文稿 in the global navigation, keeps cloud music ids, and exposes homepage notices", () => {
    expect(siteShell.navItems.map((item) => item.label)).toEqual(
      expect.arrayContaining(["首页", "文稿", "资料库", "笔记", "专题", "关于"])
    );
    expect(siteShell.music.cloudMusicIds.length).toBeGreaterThan(0);
    expect(siteShell.music.apiBaseUrl).toContain("http");
    expect(siteShell.announcements.length).toBeGreaterThan(0);
  });
});

describe("buildHomeViewModel", () => {
  it("returns spotlight entries and public-content counts", () => {
    const model = buildHomeViewModel({
      articles: [
        {
          slug: "galgame-90s-golden-age",
          data: {
            title: "黄金时代",
            summary: "主文稿",
            date: "2026-07-07",
            type: "script",
          },
        },
      ],
      notes: [
        {
          slug: "核心参考对照表",
          data: {
            title: "核心参考对照表",
            summary: "笔记",
            date: "2026-07-06",
          },
        },
      ],
      references: [
        {
          slug: "to-heart-entry",
          data: {
            title: "To Heart",
            summary: "资料节点",
            date: "2026-07-05",
          },
        },
      ],
    });

    expect(model.stats.articleCount).toBe(1);
    expect(model.stats.noteCount).toBe(1);
    expect(model.stats.referenceCount).toBe(1);
    expect(model.featuredArticle?.slug).toBe("galgame-90s-golden-age");
    expect(model.featuredReference?.slug).toBe("to-heart-entry");
  });

  it("builds a mixed search index for articles, notes, and references", () => {
    const items = buildHomeSearchIndex({
      articles: [
        {
          slug: "galgame-90s-golden-age",
          data: {
            title: "黄金时代",
            summary: "主文稿",
            tags: ["90年代"],
          },
        },
      ],
      notes: [
        {
          slug: "核心参考对照表",
          data: {
            title: "核心参考对照表",
            summary: "笔记摘要",
            tags: ["研究笔记"],
          },
        },
      ],
      references: [
        {
          slug: "to-heart-entry",
          data: {
            title: "To Heart",
            summary: "资料节点",
            tags: ["作品条目"],
          },
        },
      ],
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/articles/galgame-90s-golden-age/",
          section: "文稿",
        }),
        expect.objectContaining({
          href: "/notes/核心参考对照表/",
          section: "笔记",
        }),
        expect.objectContaining({
          href: "/references/to-heart-entry/",
          section: "资料库",
        }),
      ])
    );
  });
});
