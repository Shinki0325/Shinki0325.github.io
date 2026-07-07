import { describe, expect, it } from "vitest";
import {
  parseHomePageConfig,
  serializeHomePageConfig,
} from "../manager/src/lib/homePageConfig";

const HOME_JSON = JSON.stringify(
  {
    brand: {
      title: "maki",
      suffix: "の",
      after: "archive",
    },
    hero: {
      eyebrow: "文稿与资料归档",
      title: "把文章、参考资料、笔记和图文线索收进同一座资料岛",
      description: "这里不是普通时间线博客，而是长期归档站。",
    },
    announcements: ["资料持续整理中", "部分页面含双语对照阅读"],
    backgroundImages: ["/uploads/ui/bg-1.jpg", "/uploads/ui/bg-2.jpg"],
    music: {
      apiBaseUrl: "https://api.injahow.cn/meting/",
      server: "netease",
      type: "song",
      cloudMusicIds: ["1809646618", "3361076230"],
      idleLyric: "欢迎来到资料归档首页",
      fallbackCover: "/uploads/ui/music-cover-fallback.jpg",
    },
    blocks: [
      {
        type: "article-list",
        title: "最新文稿",
        limit: 5,
      },
    ],
  },
  null,
  2
);

describe("home page config helpers", () => {
  it("parses editable homepage fields into a form-friendly shape", () => {
    const parsed = parseHomePageConfig(HOME_JSON);

    expect(parsed.form.brandTitle).toBe("maki");
    expect(parsed.form.brandSuffix).toBe("の");
    expect(parsed.form.brandAfter).toBe("archive");
    expect(parsed.form.heroTitle).toContain("资料岛");
    expect(parsed.form.announcementText).toBe("资料持续整理中\n部分页面含双语对照阅读");
    expect(parsed.form.backgroundImageText).toBe("/uploads/ui/bg-1.jpg\n/uploads/ui/bg-2.jpg");
    expect(parsed.form.cloudMusicIdsText).toBe("1809646618\n3361076230");
    expect(parsed.form.apiBaseUrl).toContain("meting");
    expect(parsed.form.fallbackCover).toContain("fallback");
    expect(parsed.form.idleLyric).toContain("资料归档");
  });

  it("serializes edited fields back to json and preserves untouched homepage settings", () => {
    const parsed = parseHomePageConfig(HOME_JSON);

    const json = serializeHomePageConfig(parsed.source, {
      ...parsed.form,
      brandTitle: "Maki Archive",
      announcementText: "首页改版中\n欢迎反馈",
      backgroundImageText: "/hero/a.jpg\n\n/hero/b.jpg",
      cloudMusicIdsText: "1\n2\n\n3",
      apiBaseUrl: "https://music.example/api",
      fallbackCover: "/img/fallback.jpg",
      idleLyric: "等待播放中",
    });

    const next = JSON.parse(json);

    expect(next.brand).toEqual({
      title: "Maki Archive",
      suffix: "の",
      after: "archive",
    });
    expect(next.announcements).toEqual(["首页改版中", "欢迎反馈"]);
    expect(next.backgroundImages).toEqual(["/hero/a.jpg", "/hero/b.jpg"]);
    expect(next.music.cloudMusicIds).toEqual(["1", "2", "3"]);
    expect(next.music.apiBaseUrl).toBe("https://music.example/api");
    expect(next.music.fallbackCover).toBe("/img/fallback.jpg");
    expect(next.music.idleLyric).toBe("等待播放中");
    expect(next.music.server).toBe("netease");
    expect(next.music.type).toBe("song");
    expect(next.blocks).toEqual([
      {
        type: "article-list",
        title: "最新文稿",
        limit: 5,
      },
    ]);
  });
});
