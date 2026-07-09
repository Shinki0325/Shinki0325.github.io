import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import { buildHomeSearchIndex, buildHomeViewModel } from "../src/lib/home-shell";

describe("site shell config", () => {
  it("adds 照片墙 to the global navigation and keeps homepage shell config intact", () => {
    expect(siteShell.navItems.map((item) => item.label)).toEqual(
      expect.arrayContaining(["首页", "文稿", "资料库", "笔记", "照片墙", "专题", "关于"]),
    );
    expect(siteShell.music.tracks.length).toBeGreaterThan(0);
    expect(siteShell.music.tracks.map((track) => track.id)).toEqual(
      expect.arrayContaining(["2050292874", "1459692412", "4930312"]),
    );
    expect("apiBaseUrl" in siteShell.music).toBe(false);
    expect(siteShell.announcements.length).toBeGreaterThan(0);
    expect(siteShell.homeBackground.videoSrc).toBe("/uploads/backgrounds/home-loop-h264.mp4");
  });
});

describe("site background config", () => {
  it("keeps homepage video config separate from non-home background images", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/chrome/SiteBackground.astro", "utf8")
    );

    expect(source).toContain("homeBackground.videoSrc");
    expect(source).toContain("homeBackground.poster");
    expect(source).toContain("const backgroundImages: readonly string[] = siteShell.backgroundImages ?? []");
    expect(source).toContain("const nonHomeBackgroundImages: readonly string[] = isHome ? [] : backgroundImages");
  });
});

describe("homepage feature cards", () => {
  it("turns the featured script card into a cover-pool carousel", async () => {
    const fs = await import("node:fs/promises");
    const [homeSource, styleSource] = await Promise.all([
      fs.readFile("src/pages/index.astro", "utf8"),
      fs.readFile("src/styles/global.css", "utf8"),
    ]);

    expect(homeSource).toContain("getArticleOverviewCovers");
    expect(homeSource).toContain("scriptCarouselSlides");
    expect(homeSource).toContain("data-home-script-carousel");
    expect(homeSource).toContain("data-home-script-slides");
    expect(homeSource).toContain("data-home-script-cover");
    expect(homeSource).toContain("data-home-script-dot");
    expect(styleSource).toContain(".home-script-carousel");
    expect(styleSource).toContain(".home-script-carousel__media");
    expect(styleSource).toContain(".home-script-carousel__dots");
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

  it("builds a mixed search index for articles, notes, references, and albums", () => {
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
      albums: [
        {
          slug: "site-assets-wall",
          data: {
            title: "站点素材墙示例",
            summary: "公开照片墙相册",
            tags: ["视觉素材"],
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
        expect.objectContaining({
          href: "/photowall/#album-site-assets-wall",
          section: "照片墙",
        }),
      ]),
    );
  });
});
