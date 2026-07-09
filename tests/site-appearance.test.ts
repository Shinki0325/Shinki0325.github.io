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

  it("injects global appearance variables from the base layout", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/layouts/BaseLayout.astro", "utf8")
    );

    expect(source).toContain("buildAppearanceStyle");
    expect(source).toContain("siteAppearance");
    expect(source).toContain("set:html={`:root {${appearanceStyle}}`}");
  });
});
