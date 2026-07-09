import { describe, expect, it } from "vitest";
import {
  buildAppearanceStyle,
  normalizeSiteAppearance,
  siteAppearanceDefaults,
} from "../src/config/site-appearance";

describe("site appearance config", () => {
  it("normalizes global visual controls into safe defaults", () => {
    const appearance = normalizeSiteAppearance({
      panelOpacity: 2,
      backgroundVideoOpacity: -1,
      cardScale: 0.2,
      pageGutterMin: 12,
      maxWidth: 3000,
      navigation: {
        height: 100,
      },
      musicPlayer: {
        floatingWidth: 900,
      },
      lyricBar: {
        opacity: 0.1,
      },
      fontFamily: "",
    });

    expect(appearance.panelOpacity).toBe(0.9);
    expect(appearance.backgroundVideoOpacity).toBe(0.18);
    expect(appearance.cardScale).toBe(0.86);
    expect(appearance.pageGutterMin).toBe(24);
    expect(appearance.maxWidth).toBe(1320);
    expect(appearance.fontFamily).toBe(siteAppearanceDefaults.fontFamily);
    expect(appearance.navigation.height).toBe(76);
    expect(appearance.musicPlayer.floatingWidth).toBe(460);
    expect(appearance.lyricBar.opacity).toBe(0.38);
  });

  it("builds root css variables used by the site shell", () => {
    const css = buildAppearanceStyle({
      ...siteAppearanceDefaults,
      panelOpacity: 0.42,
      backgroundImageOpacity: 0.7,
      pageGutterVw: 8,
      navigation: {
        ...siteAppearanceDefaults.navigation,
        height: 64,
      },
      musicPlayer: {
        ...siteAppearanceDefaults.musicPlayer,
        floatingCoverSize: 72,
      },
      lyricBar: {
        ...siteAppearanceDefaults.lyricBar,
        fontSize: 18,
      },
      fontFamily: '"LXGW WenKai Screen", "Noto Serif SC", serif',
    });

    expect(css).toContain("--panel-alpha: 0.42;");
    expect(css).toContain("--bg-image-opacity: 0.7;");
    expect(css).toContain("--page-gutter: clamp(44px, 8vw, 112px);");
    expect(css).toContain('--site-font-family: "LXGW WenKai Screen", "Noto Serif SC", serif;');
    expect(css).toContain("--nav-height: 64px;");
    expect(css).toContain("--floating-player-cover-size: 72px;");
    expect(css).toContain("--home-lyric-bar-font-size: 18px;");
  });

  it("keeps the saved homepage appearance controls in the compact edited range", async () => {
    const fs = await import("node:fs/promises");
    const config = JSON.parse(await fs.readFile("src/config/pages/appearance.json", "utf8"));

    expect(config.cardScale).toBeLessThanOrEqual(0.92);
    expect(config.navigation.maxWidth).toBeLessThanOrEqual(980);
    expect(config.searchBar.width).toBeLessThanOrEqual(620);
    expect(config.searchBar.height).toBeLessThanOrEqual(56);
    expect(config.profileCard.avatarSize).toBeLessThanOrEqual(130);
    expect(config.musicPlayer.coverSize).toBeLessThanOrEqual(86);
    expect(config.lyricBar.height).toBeLessThanOrEqual(62);
  });

  it("uses card scale for real site containers and cards, not only preview text", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/styles/global.css", "utf8")
    );

    expect(source).toContain("calc(var(--max-width) * var(--card-scale))");
    expect(source).toContain("calc(25px * var(--card-scale))");
    expect(source).toContain("calc(22px * var(--card-scale))");
    expect(source).toContain("calc(16px * var(--card-scale))");
  });

  it("applies backend content card layout controls to the real static homepage cards", async () => {
    const fs = await import("node:fs/promises");
    const indexSource = await fs.readFile("src/pages/index.astro", "utf8");
    const styleSource = await fs.readFile("src/styles/global.css", "utf8");
    const appearance = normalizeSiteAppearance({
      previewCards: [
        {
          id: "featured",
          eyebrow: "当前主稿",
          title: "主稿",
          description: "主稿卡片",
          meta: "文稿",
          actionLabel: "打开文稿",
          variant: "strong",
          widthUnits: 6,
          minHeight: 240,
        },
      ],
    });

    expect(appearance.previewCards[0]).toEqual(
      expect.objectContaining({
        id: "featured",
        widthUnits: 6,
        minHeight: 240,
      })
    );
    expect(indexSource).toContain("siteAppearance.previewCards");
    expect(indexSource).toContain('style={getHomeFeatureCardStyle("featured")}');
    expect(indexSource).toContain('style={getHomeFeatureCardStyle("reference")}');
    expect(indexSource).toContain('style={getHomeFeatureCardStyle("notes")}');
    expect(indexSource).toContain('style={getHomeFeatureCardStyle("status")}');
    expect(styleSource).toContain("--home-feature-card-span");
    expect(styleSource).toContain("--home-feature-card-min-height");
  });

  it("makes homepage feature cards full-card links for easier entry", async () => {
    const fs = await import("node:fs/promises");
    const indexSource = await fs.readFile("src/pages/index.astro", "utf8");

    expect(indexSource).toContain('href={firstScriptSlide?.href ?? "/articles/"}');
    expect(indexSource).toContain('href={featuredReference ? `/references/${featuredReference.slug}/` : "/references/"}');
    expect(indexSource).toContain('href={latestNote ? `/notes/${latestNote.slug}/` : "/notes/"}');
    expect(indexSource).toContain('class={getHomeFeatureCardClass("featured", "home-feature-card--primary home-script-carousel")}');
    expect(indexSource).toContain('class={getHomeFeatureCardClass("reference", "home-feature-card--wide")}');
    expect(indexSource).toContain('class={getHomeFeatureCardClass("notes")}');
  });

  it("adds stronger hover affordance for clickable buttons and cards", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/styles/global.css", "utf8")
    );

    expect(source).toContain(".interactive-lift");
    expect(source).toContain(".interactive-lift::after");
    expect(source).toContain(".interactive-lift:hover");
    expect(source).toContain(".interactive-lift:active");
    expect(source).toContain(".home-feature-card.interactive-lift");
    expect(source).toContain(".home-feature-card__cta");
  });

  it("renders non-home background images as a single-image carousel", async () => {
    const fs = await import("node:fs/promises");
    const componentSource = await fs.readFile("src/components/chrome/SiteBackground.astro", "utf8");
    const styleSource = await fs.readFile("src/styles/global.css", "utf8");

    expect(componentSource).toContain("backgroundImages: readonly string[]");
    expect(componentSource).toContain("data-background-slider");
    expect(componentSource).toContain("data-background-slide");
    expect(componentSource).toContain('index === 0 ? "site-backdrop__image is-active"');
    expect(componentSource).toContain("set:html");
    expect(componentSource).toContain("setInterval");
    expect(componentSource).toContain("60000");
    expect(styleSource).toContain("grid-template-columns: 1fr");
    expect(styleSource).toContain("grid-area: 1 / 1");
    expect(styleSource).toContain("opacity: 0");
    expect(styleSource).toContain(".site-backdrop__image.is-active");
  });

  it("injects global appearance variables from the base layout", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/layouts/BaseLayout.astro", "utf8")
    );

    expect(source).toContain("buildAppearanceStyle");
    expect(source).toContain("siteAppearance");
    expect(source).toContain("set:html={`:root {${appearanceStyle}}`}");
    expect(source).toContain("<body style={appearanceStyle}>");
  });

  it("uses the custom Yin Xingzhu cursor set for core pointer states", async () => {
    const fs = await import("node:fs/promises");
    const styleSource = await fs.readFile("src/styles/global.css", "utf8");
    const cursorDir = "public/uploads/cursors/yin-xingzhu";

    await expect(fs.stat(`${cursorDir}/normal.cur`)).resolves.toBeTruthy();
    await expect(fs.stat(`${cursorDir}/pointer.cur`)).resolves.toBeTruthy();
    await expect(fs.stat(`${cursorDir}/text.cur`)).resolves.toBeTruthy();
    await expect(fs.stat(`${cursorDir}/not-allowed.cur`)).resolves.toBeTruthy();

    for (const filename of ["normal.cur", "pointer.cur", "text.cur", "not-allowed.cur"]) {
      const buffer = await fs.readFile(`${cursorDir}/${filename}`);
      const header = buffer.subarray(0, 12).toString("latin1");
      expect(header).not.toBe("RIFF(2\u0006\u0000ACON");
      expect(header.startsWith("\u0000\u0000\u0002\u0000")).toBe(true);
      expect(buffer[6]).toBe(64);
      expect(buffer[7]).toBe(64);
    }

    expect(styleSource).toContain('cursor: url("/uploads/cursors/yin-xingzhu/normal.cur") 0 0, auto;');
    expect(styleSource).toContain('cursor: url("/uploads/cursors/yin-xingzhu/pointer.cur") 0 0, pointer;');
    expect(styleSource).toContain('cursor: url("/uploads/cursors/yin-xingzhu/text.cur") 0 0, text;');
    expect(styleSource).toContain('cursor: url("/uploads/cursors/yin-xingzhu/not-allowed.cur") 0 0, not-allowed;');
  });
});
