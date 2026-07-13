import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import { buildHomeSearchIndex, buildHomeViewModel } from "../src/lib/home-shell";

describe("site shell config", () => {
  it("adds 照片墙 to the global navigation and keeps homepage shell config intact", () => {
    expect(siteShell.navItems.map((item) => item.label)).toEqual([
      "首页",
      "文稿",
      "资料库",
      "笔记",
      "照片墙",
      "关于",
    ]);
    expect(siteShell.navItems.map((item) => item.href)).not.toContain("/topics/");
    expect(siteShell.music.tracks.length).toBeGreaterThan(0);
    expect(siteShell.music.tracks.map((track) => track.id)).toEqual(
      expect.arrayContaining(["2050292874", "1459692412", "4930312"]),
    );
    expect("apiBaseUrl" in siteShell.music).toBe(false);
    expect(siteShell.announcements.length).toBeGreaterThan(0);
    expect(siteShell.homeBackground.videoSrc).toBe("/uploads/backgrounds/home-loop-1440p.mp4");
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
  it("renders the Chronicle entry as one authority-backed archive save slot", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/pages/index.astro", "utf8"));

    expect(source).toContain('import { galgameHistoryPreview } from "../data/galgame-history-preview"');
    expect(source).toContain("const chronicleSummary");
    expect(source).toContain('data-home-history-entry');
    expect(source).toContain('data-home-chronicle-slot="01"');
    expect(source).toContain('href="/galgame-history/"');
    expect(source).toContain("GALGAME CHRONICLE");
    expect(source).toContain("美少女游戏编年档案");
    expect(source).toContain("LOAD ARCHIVE");
    expect(source).toContain("chronicleSummary.eras.map");
    expect(source).toContain("chronicleSummary.publicDossierCount");
    expect(source).not.toContain("ONLINE MUSEUM");
    expect(source).not.toContain("1980-1999 Galgame");
    expect(source.indexOf('data-home-history-entry')).toBeLessThan(source.indexOf('data-home-birthday-calendar'));
  });

  it("uses the current Chronicle public counts and five eras", async () => {
    const { galgameHistoryPreview } = await import("../src/data/galgame-history-preview");
    const route = galgameHistoryPreview.museumRoute;

    expect(route.timeDomain).toMatchObject({ startYear: 1979, endYear: 1999 });
    expect(route.authority).toMatchObject({ publicDossierCount: 100, storyCount: 59, branchCount: 41 });
    expect(route.galleries.map((gallery) => [gallery.theme, gallery.yearStart, gallery.yearEnd])).toEqual([
      ["ORIGINS", 1979, 1984],
      ["FORMATION", 1985, 1988],
      ["EXPANSION", 1989, 1991],
      ["TRANSITION", 1992, 1995],
      ["NARRATIVE", 1996, 1999],
    ]);
  });

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
