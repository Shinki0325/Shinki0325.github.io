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
      title: "把文稿、参考资料、笔记和图文线索收进同一座资料岛",
      description: "这里不是普通时间线博客，而是长期归档站。",
    },
    profile: {
      displayName: "Shinki",
      bio: "游戏爱好者，经济学在读。",
      avatarUrl: "https://example.com/avatar.jpg",
    },
    social: {
      github: "https://github.com/Shinki0325",
      bilibili: "https://space.bilibili.com/123456",
      email: "mailto:hello@example.com",
    },
    search: {
      placeholder: "搜索文稿、资料、笔记...",
    },
    announcements: ["资料持续整理中", "部分页面含双语对照阅读"],
    backgroundImages: ["/uploads/ui/bg-1.jpg", "/uploads/ui/bg-2.jpg"],
    music: {
      tracks: [
        {
          id: "1809646618",
          title: "云月谣",
          artist: "兰音Reine",
          coverUrl: "/uploads/music/covers/yunyueyao.jpg",
          audioUrl: "https://music.163.com/song/media/outer/url?id=1809646618.mp3",
          lrc: "[00:01.00]第一句",
        },
      ],
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
    expect(parsed.form.profileDisplayName).toBe("Shinki");
    expect(parsed.form.profileBio).toContain("经济学");
    expect(parsed.form.profileAvatarUrl).toContain("avatar.jpg");
    expect(parsed.form.socialGithub).toContain("github.com");
    expect(parsed.form.socialBilibili).toContain("bilibili");
    expect(parsed.form.socialEmail).toContain("mailto:");
    expect(parsed.form.searchPlaceholder).toContain("搜索");
    expect(parsed.form.announcementText).toBe("资料持续整理中\n部分页面含双语对照阅读");
    expect(parsed.form.backgroundImageText).toBe("/uploads/ui/bg-1.jpg\n/uploads/ui/bg-2.jpg");
    expect(JSON.parse(parsed.form.musicTracksJson)).toEqual([
      expect.objectContaining({
        id: "1809646618",
        title: "云月谣",
        artist: "兰音Reine",
      }),
    ]);
    expect(parsed.form.fallbackCover).toContain("fallback");
    expect(parsed.form.idleLyric).toContain("资料归档");
  });

  it("serializes edited fields back to json and preserves untouched homepage settings", () => {
    const parsed = parseHomePageConfig(HOME_JSON);

    const json = serializeHomePageConfig(parsed.source, {
      ...parsed.form,
      brandTitle: "Maki Archive",
      profileDisplayName: "maki",
      profileBio: "归档写作与资料整理。",
      profileAvatarUrl: "/uploads/ui/avatar.png",
      socialGithub: "https://github.com/maki",
      socialBilibili: "https://space.bilibili.com/654321",
      socialEmail: "mailto:maki@example.com",
      searchPlaceholder: "搜索首页内容",
      announcementText: "首页改版中\n欢迎反馈",
      backgroundImageText: "/hero/a.jpg\n\n/hero/b.jpg",
      musicTracksJson: JSON.stringify(
        [
          {
            id: "1",
            title: "静态曲目",
            artist: "静态歌手",
            coverUrl: "/img/cover.jpg",
            audioUrl: "https://music.163.com/song/media/outer/url?id=1.mp3",
            lrc: "",
          },
        ],
        null,
        2,
      ),
      fallbackCover: "/img/fallback.jpg",
      idleLyric: "等待播放中",
    });

    const next = JSON.parse(json);

    expect(next.brand).toEqual({
      title: "Maki Archive",
      suffix: "の",
      after: "archive",
    });
    expect(next.profile).toEqual({
      displayName: "maki",
      bio: "归档写作与资料整理。",
      avatarUrl: "/uploads/ui/avatar.png",
    });
    expect(next.social).toEqual({
      github: "https://github.com/maki",
      bilibili: "https://space.bilibili.com/654321",
      email: "mailto:maki@example.com",
    });
    expect(next.search).toEqual({
      placeholder: "搜索首页内容",
    });
    expect(next.announcements).toEqual(["首页改版中", "欢迎反馈"]);
    expect(next.backgroundImages).toEqual(["/hero/a.jpg", "/hero/b.jpg"]);
    expect(next.music.tracks).toEqual([
      {
        id: "1",
        title: "静态曲目",
        artist: "静态歌手",
        coverUrl: "/img/cover.jpg",
        audioUrl: "https://music.163.com/song/media/outer/url?id=1.mp3",
        lrc: "",
      },
    ]);
    expect("cloudMusicIds" in next.music).toBe(false);
    expect("apiBaseUrl" in next.music).toBe(false);
    expect(next.music.fallbackCover).toBe("/img/fallback.jpg");
    expect(next.music.idleLyric).toBe("等待播放中");
    expect(next.blocks).toEqual([
      {
        type: "article-list",
        title: "最新文稿",
        limit: 5,
      },
    ]);
  });
});
