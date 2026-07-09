import { describe, expect, it } from "vitest";
import {
  parseAppearanceConfig,
  serializeAppearanceConfig,
} from "../manager/src/lib/appearanceConfig";

const APPEARANCE_JSON = JSON.stringify(
  {
    panelOpacity: 0.5,
    panelStrongOpacity: 0.72,
    backgroundVideoOpacity: 0.64,
    backgroundImageOpacity: 0.52,
    pageGutterMin: 40,
    pageGutterVw: 7.5,
    pageGutterMax: 120,
    maxWidth: 1080,
    cardScale: 0.94,
    radiusScale: 0.96,
    fontPreset: "serif",
    fontFamily: '"Noto Serif SC", serif',
    previewCards: [
      {
        id: "featured",
        eyebrow: "当前主稿",
        title: "为什么90年代是galgame真正意义上的黄金年代",
        description: "围绕90年代 galgame 为何能形成黄金年代感的一篇长文主稿。",
        meta: "文稿",
        actionLabel: "打开文稿",
        variant: "strong",
        widthUnits: 5,
        minHeight: 260,
      },
    ],
    navigation: {
      height: 62,
      maxWidth: 1120,
      paddingX: 18,
      blur: 28,
      linkGap: 14,
    },
    musicPlayer: {
      cardPadding: 30,
      coverSize: 104,
      controlSize: 40,
      primaryControlSize: 54,
      floatingWidth: 360,
      floatingHeight: 68,
      floatingCoverSize: 70,
    },
    lyricBar: {
      height: 82,
      paddingX: 26,
      radius: 28,
      opacity: 0.72,
      fontSize: 17,
    },
    searchBar: {
      width: 680,
      height: 60,
      marginBottom: 22,
      iconSize: 22,
    },
    profileCard: {
      paddingX: 27,
      paddingY: 32,
      avatarSize: 130,
      titleSize: 56,
      minHeight: 286,
      socialButtonSize: 47,
    },
  },
  null,
  2
);

describe("manager appearance editor", () => {
  it("parses global appearance json into form controls", () => {
    const parsed = parseAppearanceConfig(APPEARANCE_JSON);

    expect(parsed.form.panelOpacity).toBe(0.5);
    expect(parsed.form.backgroundVideoOpacity).toBe(0.64);
    expect(parsed.form.pageGutterVw).toBe(7.5);
    expect(parsed.form.maxWidth).toBe(1080);
    expect(parsed.form.fontPreset).toBe("serif");
    expect(parsed.form.previewCards[0]).toEqual(
      expect.objectContaining({
        id: "featured",
        title: expect.stringContaining("90年代"),
        widthUnits: 5,
        minHeight: 260,
      })
    );
    expect(parsed.form.navigation).toEqual(expect.objectContaining({ height: 62, blur: 28 }));
    expect(parsed.form.musicPlayer).toEqual(expect.objectContaining({ coverSize: 104, floatingWidth: 360 }));
    expect(parsed.form.lyricBar).toEqual(expect.objectContaining({ height: 82, opacity: 0.72 }));
    expect(parsed.form.searchBar).toEqual(expect.objectContaining({ width: 680, iconSize: 22 }));
    expect(parsed.form.profileCard).toEqual(expect.objectContaining({ avatarSize: 130, titleSize: 56 }));
  });

  it("serializes edited global appearance controls without losing unknown fields", () => {
    const parsed = parseAppearanceConfig(
      JSON.stringify({
        ...JSON.parse(APPEARANCE_JSON),
        futureSetting: "keep me",
      })
    );

    const next = JSON.parse(
      serializeAppearanceConfig(parsed.source, {
        ...parsed.form,
        panelOpacity: 0.38,
        cardScale: 0.9,
        fontPreset: "rounded",
        fontFamily: '"M PLUS Rounded 1c", "Noto Sans SC", sans-serif',
        previewCards: [
          ...parsed.form.previewCards,
          {
            id: "custom",
            eyebrow: "新增卡片",
            title: "可调预览卡",
            description: "用于测试整页排布。",
            meta: "Preview",
            actionLabel: "查看",
            variant: "soft",
            widthUnits: 7,
            minHeight: 220,
          },
        ],
        navigation: {
          ...parsed.form.navigation,
          height: 66,
        },
        musicPlayer: {
          ...parsed.form.musicPlayer,
          floatingCoverSize: 74,
        },
        lyricBar: {
          ...parsed.form.lyricBar,
          fontSize: 18,
        },
        searchBar: {
          ...parsed.form.searchBar,
          width: 720,
        },
        profileCard: {
          ...parsed.form.profileCard,
          avatarSize: 138,
        },
      })
    );

    expect(next.panelOpacity).toBe(0.38);
    expect(next.cardScale).toBe(0.9);
    expect(next.fontPreset).toBe("rounded");
    expect(next.fontFamily).toContain("M PLUS Rounded");
    expect(next.previewCards).toHaveLength(2);
    expect(next.previewCards[1]).toEqual(expect.objectContaining({ widthUnits: 7 }));
    expect(next.navigation.height).toBe(66);
    expect(next.musicPlayer.floatingCoverSize).toBe(74);
    expect(next.lyricBar.fontSize).toBe(18);
    expect(next.searchBar.width).toBe(720);
    expect(next.profileCard.avatarSize).toBe(138);
    expect(next.futureSetting).toBe("keep me");
  });

  it("adds a dedicated appearance page with live preview instead of json editing", async () => {
    const fs = await import("node:fs/promises");
    const appSource = await fs.readFile("manager/src/App.tsx", "utf8");
    const editorSource = await fs.readFile("manager/src/pages/AppearanceEditor.tsx", "utf8");
    const filesSource = await fs.readFile("manager/server/files.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(appSource).toContain('"appearance"');
    expect(appSource).toContain("外观设置");
    expect(editorSource).toContain("实时整页预览");
    expect(editorSource).toContain("previewCards");
    expect(editorSource).toContain("添加卡片");
    expect(editorSource).toContain("selectedCardId");
    expect(editorSource).toContain("widthUnits");
    expect(editorSource).toContain("minHeight");
    expect(editorSource).toContain("导航栏");
    expect(editorSource).toContain("播放器");
    expect(editorSource).toContain("歌词栏");
    expect(editorSource).toContain("updateNavigation");
    expect(editorSource).toContain("updateMusicPlayer");
    expect(editorSource).toContain("updateLyricBar");
    expect(editorSource).toContain("appearance-preview__search");
    expect(editorSource).toContain("appearance-preview__player");
    expect(editorSource).toContain("appearance-preview__lyric");
    expect(editorSource).toContain("appearance-preview__profile-top");
    expect(editorSource).toContain("appearance-preview__profile-footer");
    expect(editorSource).toContain("appearance-preview__social-row");
    expect(editorSource).toContain("appearance-preview__player-top");
    expect(editorSource).toContain("appearance-preview__player-progress");
    expect(editorSource).toContain("搜索栏");
    expect(editorSource).toContain("个人卡");
    expect(editorSource).toContain("updateSearchBar");
    expect(editorSource).toContain("updateProfileCard");
    expect(editorSource).toContain("panelOpacity");
    expect(editorSource).toContain("cardScale");
    expect(editorSource).toContain("pageGutter");
    expect(editorSource).toContain("fontPreset");
    expect(editorSource).not.toContain("<textarea");
    expect(filesSource).toContain('"appearance"');
    expect(typesSource).toContain('"appearance"');
  });
});
