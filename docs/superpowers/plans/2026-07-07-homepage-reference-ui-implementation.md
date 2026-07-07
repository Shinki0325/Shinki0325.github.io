# Homepage Reference UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Astro homepage and global chrome so the site visually matches the referenced `XinghuisamaBlogs` front page while preserving the existing static-content architecture, GitHub Pages compatibility, the cloud music API data flow, and a local-manager workflow for homepage images, announcements, and cloud music IDs.

**Architecture:** Keep Astro as the page and content layer, then add a thin React-islands layer for stateful UI: top navigation, mobile radial menu, homepage search, cloud-music playback, lyric bar, splash intro, and floating player. Homepage data stays server-rendered through pure TypeScript view-model helpers, while a shared client music runtime fetches tracks directly from a configurable cloud-music endpoint so GitHub Pages static output remains valid. Visual shell settings move into `src/config/pages/home.json`, and the existing local manager gets a structured editor for background images, announcement text, and cloud music IDs.

**Tech Stack:** Astro 5, `@astrojs/react`, React, Nanostores, TypeScript, Vitest, Playwright, CSS

---

## File Map

### New files

- `src/config/site-shell.ts`
  Purpose: export a typed shell config derived from `src/config/pages/home.json`.
- `manager/src/lib/homePageConfig.ts`
  Purpose: parse, normalize, and serialize the structured homepage shell config used by the local manager.
- `manager/src/components/AssetUrlPicker.tsx`
  Purpose: let the manager insert copied asset URLs into homepage image fields without hand-typing paths.
- `src/lib/home-shell.ts`
  Purpose: build homepage view models and a client search index from published articles, notes, and references.
- `src/lib/music-cloud.ts`
  Purpose: build cloud music request URLs, normalize remote song payloads, and parse LRC lyrics.
- `src/components/chrome/TopNav.tsx`
  Purpose: desktop top bar with scroll-hide behavior plus mobile trigger button.
- `src/components/chrome/MobileRadialMenu.tsx`
  Purpose: full-screen circular mobile navigation overlay.
- `src/components/chrome/SiteBackground.astro`
  Purpose: shared image/glow background layer for every page.
- `src/components/music/store.ts`
  Purpose: Nanostore-backed playback state and commands shared across islands.
- `src/components/music/MusicRuntime.tsx`
  Purpose: hidden client runtime that fetches tracks, owns the `<audio>` element, and updates the shared music store.
- `src/components/music/HomeMusicCard.tsx`
  Purpose: homepage cloud music card.
- `src/components/music/HomeLyricBar.tsx`
  Purpose: homepage lyric strip.
- `src/components/music/FloatingPlayer.tsx`
  Purpose: non-homepage floating mini player.
- `src/components/home/HomeSplash.tsx`
  Purpose: homepage-only welcome intro overlay.
- `src/components/home/HomeSearch.tsx`
  Purpose: homepage search bar and result drawer.
- `src/components/home/HomeProfileCard.astro`
  Purpose: homepage identity/stat card.
- `src/components/home/HomeFeatureGrid.astro`
  Purpose: homepage second-row collage layout.
- `src/components/home/HomeStatusStrip.astro`
  Purpose: homepage bottom status ribbon.
- `tests/home-shell.test.ts`
  Purpose: TDD for homepage view-model and search-index helpers.
- `tests/music-cloud.test.ts`
  Purpose: TDD for cloud music URL building, normalization, and lyric parsing.
- `tests/homepage-nav.spec.ts`
  Purpose: Playwright coverage for desktop nav and mobile radial menu.
- `tests/homepage-shell.spec.ts`
  Purpose: Playwright coverage for homepage sections, search, and music shell.
- `tests/floating-player.spec.ts`
  Purpose: Playwright coverage for floating player visibility and inner-page chrome.
- `tests/manager-home-config.test.ts`
  Purpose: TDD for the structured homepage manager config helpers.

### Modified files

- `package.json`
  Purpose: add React-island and Nanostore dependencies.
- `astro.config.mjs`
  Purpose: enable the React integration.
- `src/data/site.ts`
  Purpose: preserve existing `siteTitle` / `siteDescription` exports while sourcing them from the new shell config.
- `src/config/pages/home.json`
  Purpose: become the editable source of homepage shell data, including notices, image lists, and cloud music IDs.
- `src/layouts/BaseLayout.astro`
  Purpose: replace the old static warm-toned header with the new shared chrome, music runtime, and page container.
- `src/pages/index.astro`
  Purpose: replace the current warm paper homepage with the new reference-inspired layout.
- `src/styles/global.css`
  Purpose: redefine tokens, background layers, glass cards, page shells, buttons, list cards, and responsive behavior.
- `src/components/ArticleCard.astro`
  Purpose: add stable glass-card hooks and updated media-card structure for archive pages.
- `src/components/ReferenceCard.astro`
  Purpose: add stable glass-card hooks and updated media-card structure for archive pages.
- `src/components/NoteCard.astro`
  Purpose: add stable glass-card hooks and updated media-card structure for archive pages.
- `src/components/TopicCard.astro`
  Purpose: add stable glass-card hooks and updated media-card structure for archive pages.
- `manager/src/pages/PageBuilder.tsx`
  Purpose: replace the raw home JSON editing experience with a structured homepage-shell editor while keeping raw JSON fallback for other page configs.

## Task 1: Build shared shell config and homepage view-model helpers

**Files:**
- Create: `src/config/site-shell.ts`
- Create: `src/lib/home-shell.ts`
- Modify: `src/config/pages/home.json`
- Modify: `src/data/site.ts`
- Test: `tests/home-shell.test.ts`

- [ ] **Step 1: Write the failing unit tests for shell config and homepage view models**

```ts
import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import { buildHomeSearchIndex, buildHomeViewModel } from "../src/lib/home-shell";

describe("site shell config", () => {
  it("uses 文稿 in the global navigation, keeps cloud music ids, and exposes homepage notices", () => {
    expect(siteShell.navItems.map((item) => item.label)).toEqual(
      expect.arrayContaining(["首页", "文稿", "资料库", "笔记", "专题", "关于"]),
    );
    expect(siteShell.music.cloudMusicIds.length).toBeGreaterThan(0);
    expect(siteShell.music.apiBaseUrl).toContain("http");
    expect(siteShell.announcements.length).toBeGreaterThan(0);
  });
});

describe("buildHomeViewModel", () => {
  it("returns spotlight entries and public-content counts", () => {
    const model = buildHomeViewModel({
      articles: [{ slug: "galgame-90s-golden-age", data: { title: "黄金时代", summary: "主文稿", date: "2026-07-07", type: "script" } }],
      notes: [{ slug: "核心参考对照表", data: { title: "核心参考对照表", summary: "笔记", date: "2026-07-06" } }],
      references: [{ slug: "to-heart-entry", data: { title: "To Heart", summary: "资料节点", date: "2026-07-05" } }],
    });

    expect(model.stats.articleCount).toBe(1);
    expect(model.stats.noteCount).toBe(1);
    expect(model.stats.referenceCount).toBe(1);
    expect(model.featuredArticle?.slug).toBe("galgame-90s-golden-age");
    expect(model.featuredReference?.slug).toBe("to-heart-entry");
  });

  it("builds a mixed search index for articles, notes, and references", () => {
    const items = buildHomeSearchIndex({
      articles: [{ slug: "galgame-90s-golden-age", data: { title: "黄金时代", summary: "主文稿", tags: ["90年代"] } }],
      notes: [{ slug: "核心参考对照表", data: { title: "核心参考对照表", summary: "笔记摘要", tags: ["研究笔记"] } }],
      references: [{ slug: "to-heart-entry", data: { title: "To Heart", summary: "资料节点", tags: ["作品条目"] } }],
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: "/articles/galgame-90s-golden-age/", section: "文稿" }),
        expect.objectContaining({ href: "/notes/核心参考对照表/", section: "笔记" }),
        expect.objectContaining({ href: "/references/to-heart-entry/", section: "资料库" }),
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/home-shell.test.ts`

Expected: FAIL with import errors because `site-shell.ts` and `home-shell.ts` do not exist yet.

- [ ] **Step 3: Write the minimal shell config and helper implementation**

`src/config/site-shell.ts`

```ts
import homePageConfig from "./pages/home.json";

const defaultNavItems = [
  { href: "/", label: "首页" },
  { href: "/articles/", label: "文稿" },
  { href: "/references/", label: "资料库" },
  { href: "/notes/", label: "笔记" },
  { href: "/topics/", label: "专题" },
  { href: "/about/", label: "关于" }
] as const;

export const siteShell = {
  brand: homePageConfig.brand,
  hero: homePageConfig.hero,
  announcements: homePageConfig.announcements,
  navItems: defaultNavItems,
  backgroundImages: homePageConfig.backgroundImages,
  music: homePageConfig.music
} as const;
```

`src/config/pages/home.json`

```json
{
  "brand": {
    "title": "maki",
    "suffix": "の",
    "after": "archive"
  },
  "hero": {
    "eyebrow": "文稿与资料归档",
    "title": "把文稿、参考资料、笔记和图文线索收进同一座资料岛",
    "description": "这里不是普通时间线博客，而是为文稿、资料页、笔记和专题互链准备的长期归档站。"
  },
  "announcements": [
    "资料持续整理中",
    "部分页面含双语对照阅读"
  ],
  "backgroundImages": [
    "/uploads/ui/bg-1.jpg",
    "/uploads/ui/bg-2.jpg",
    "/uploads/ui/bg-3.jpg"
  ],
  "music": {
    "apiBaseUrl": "https://api.injahow.cn/meting/",
    "server": "netease",
    "type": "song",
    "cloudMusicIds": ["1809646618", "3361076230", "1859390262"],
    "idleLyric": "欢迎来到资料归档页",
    "fallbackCover": "/uploads/ui/music-cover-fallback.jpg"
  },
  "blocks": [
    {
      "type": "article-list",
      "title": "最新文稿",
      "limit": 5
    },
    {
      "type": "reference-list",
      "title": "资料库",
      "limit": 8
    }
  ]
}
```

`src/lib/home-shell.ts`

```ts
type EntryLike = {
  slug: string;
  data: {
    title: string;
    summary: string;
    date?: string;
    tags?: string[];
    type?: string;
  };
};

type HomeCollections = {
  articles: EntryLike[];
  notes: EntryLike[];
  references: EntryLike[];
};

export function buildHomeViewModel({ articles, notes, references }: HomeCollections) {
  return {
    featuredArticle: articles[0] ?? null,
    featuredNote: notes[0] ?? null,
    featuredReference: references[0] ?? null,
    stats: {
      articleCount: articles.length,
      noteCount: notes.length,
      referenceCount: references.length
    }
  };
}

export function buildHomeSearchIndex({ articles, notes, references }: HomeCollections) {
  return [
    ...articles.map((entry) => ({
      title: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags ?? [],
      href: `/articles/${entry.slug}/`,
      section: "文稿"
    })),
    ...notes.map((entry) => ({
      title: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags ?? [],
      href: `/notes/${entry.slug}/`,
      section: "笔记"
    })),
    ...references.map((entry) => ({
      title: entry.data.title,
      summary: entry.data.summary,
      tags: entry.data.tags ?? [],
      href: `/references/${entry.slug}/`,
      section: "资料库"
    }))
  ];
}
```

`src/data/site.ts`

```ts
import { siteShell } from "../config/site-shell";

export const siteTitle = `${siteShell.brand.title} ${siteShell.brand.suffix} ${siteShell.brand.after}`;
export const siteDescription = siteShell.hero.description;
```

- [ ] **Step 4: Run the helper test to verify it passes**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/home-shell.test.ts`

Expected: PASS with 3 passing tests in `tests/home-shell.test.ts`.

- [ ] **Step 5: Commit the helper foundation**

```bash
git add tests/home-shell.test.ts src/config/site-shell.ts src/config/pages/home.json src/lib/home-shell.ts src/data/site.ts
git commit -m "feat: add homepage shell config and view models"
```

## Task 2: Enable React islands and build the shared global chrome

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Create: `src/components/chrome/TopNav.tsx`
- Create: `src/components/chrome/MobileRadialMenu.tsx`
- Create: `src/components/chrome/SiteBackground.astro`
- Test: `tests/homepage-nav.spec.ts`

- [ ] **Step 1: Write the failing Playwright test for the new desktop nav and mobile menu trigger**

```ts
import { expect, test } from "@playwright/test";

test("desktop homepage shows the new glass navigation with 文稿 entry", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-top-nav]")).toBeVisible();
  await expect(page.getByRole("link", { name: "文稿" })).toBeVisible();
  await expect(page.getByRole("link", { name: "资料库" })).toBeVisible();
});

test("mobile homepage exposes the radial menu trigger and opens the overlay", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("[data-mobile-nav-trigger]")).toBeVisible();
  await page.locator("[data-mobile-nav-trigger]").click();
  await expect(page.locator("[data-mobile-radial-menu]")).toBeVisible();
  await expect(page.getByRole("link", { name: "文稿" })).toBeVisible();
});
```

- [ ] **Step 2: Run the Playwright nav test and verify it fails**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/homepage-nav.spec.ts`

Expected: FAIL because `[data-top-nav]`, `[data-mobile-nav-trigger]`, and `[data-mobile-radial-menu]` do not exist yet.

- [ ] **Step 3: Add React support and implement the new global chrome**

Install dependencies:

```bash
pnpm --config.minimum-release-age=0 add @astrojs/react react react-dom nanostores @nanostores/react
```

`astro.config.mjs`

```ts
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://shinki0325.github.io",
  output: "static",
  integrations: [react()]
});
```

`src/components/chrome/MobileRadialMenu.tsx`

```tsx
import { useMemo } from "react";

type NavItem = { href: string; label: string };

export function MobileRadialMenu({
  items,
  open,
  currentPath,
  onClose
}: {
  items: NavItem[];
  open: boolean;
  currentPath: string;
  onClose: () => void;
}) {
  const points = useMemo(
    () =>
      items.map((item, index) => {
        const angle = (index / items.length) * Math.PI * 2 - Math.PI / 2;
        return {
          ...item,
          x: Math.cos(angle) * 108,
          y: Math.sin(angle) * 108
        };
      }),
    [items]
  );

  if (!open) return null;

  return (
    <div className="mobile-radial-overlay" data-mobile-radial-menu>
      <button className="mobile-radial-backdrop" onClick={onClose} aria-label="关闭菜单" />
      <div className="mobile-radial-shell">
        <button className="mobile-radial-close" onClick={onClose} aria-label="关闭导航">
          ✕
        </button>
        {points.map((item) => {
          const active = currentPath === item.href || currentPath === item.href.replace(/\/$/, "");
          return (
            <a
              key={item.href}
              href={item.href}
              className={`mobile-radial-link${active ? " is-active" : ""}`}
              style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
```

`src/components/chrome/TopNav.tsx`

```tsx
import { useEffect, useState } from "react";
import { siteShell } from "../../config/site-shell";
import { MobileRadialMenu } from "./MobileRadialMenu";

export default function TopNav({ currentPath }: { currentPath: string }) {
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nextY = window.scrollY;
      setHidden(nextY > lastY && nextY > 80);
      setLastY(nextY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  return (
    <>
      <header className={`top-nav-shell${hidden ? " is-hidden" : ""}`} data-top-nav>
        <div className="top-nav-inner">
          <a className="top-nav-brand" href="/">
            <span>{siteShell.brand.title}</span>
            <span className="brand-separator">{siteShell.brand.suffix}</span>
            <span>{siteShell.brand.after}</span>
          </a>
          <nav className="top-nav-links" aria-label="主导航">
            {siteShell.navItems.map((item) => {
              const active = currentPath === item.href || currentPath === item.href.replace(/\/$/, "");
              return (
                <a key={item.href} href={item.href} className={active ? "is-active" : ""}>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <button
            className="top-nav-mobile-trigger"
            data-mobile-nav-trigger
            type="button"
            onClick={() => setOpen(true)}
            aria-label="打开导航"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <MobileRadialMenu
        items={siteShell.navItems}
        open={open}
        currentPath={currentPath}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

`src/components/chrome/SiteBackground.astro`

```astro
---
import { siteShell } from "../../config/site-shell";
---

<div class="site-backdrop" aria-hidden="true">
  <div class="site-backdrop__veil"></div>
  <div class="site-backdrop__gradient"></div>
  <div class="site-backdrop__glow glow-one"></div>
  <div class="site-backdrop__glow glow-two"></div>
  <div class="site-backdrop__glow glow-three"></div>
  <div class="site-backdrop__slider">
    {siteShell.backgroundImages.map((src, index) => (
      <div class="site-backdrop__image" style={`--bg-url: url('${src}'); --bg-index: ${index};`}></div>
    ))}
  </div>
</div>
```

`src/layouts/BaseLayout.astro`

```astro
---
import "../styles/global.css";
import { siteDescription, siteTitle } from "../data/site";
import SiteBackground from "../components/chrome/SiteBackground.astro";
import TopNav from "../components/chrome/TopNav";

interface Props {
  title?: string;
  description?: string;
  currentPath?: string;
}

const {
  title = siteTitle,
  description = siteDescription,
  currentPath = Astro.url.pathname
} = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <SiteBackground />
    <TopNav client:load currentPath={currentPath} />
    <main class="shell">
      <div class="page-stack">
        <slot />
      </div>
    </main>
  </body>
</html>
```

`src/styles/global.css` additions:

```css
:root {
  --bg-ink: #0f172a;
  --bg-panel: rgba(255, 255, 255, 0.2);
  --bg-panel-strong: rgba(255, 255, 255, 0.34);
  --line-soft: rgba(255, 255, 255, 0.24);
  --text-main: #eff6ff;
  --text-muted: rgba(226, 232, 240, 0.82);
  --accent-main: #818cf8;
  --accent-soft: rgba(129, 140, 248, 0.24);
  --shadow-xl: 0 24px 70px rgba(15, 23, 42, 0.35);
}

body {
  color: var(--text-main);
  background: #020617;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.top-nav-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  transition: transform 240ms ease;
}

.top-nav-shell.is-hidden {
  transform: translateY(-110%);
}

.top-nav-inner,
.glass-card {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.12));
  border: 1px solid var(--line-soft);
  box-shadow: var(--shadow-xl);
}

.top-nav-mobile-trigger { display: none; }

@media (max-width: 900px) {
  .top-nav-links { display: none; }
  .top-nav-mobile-trigger { display: inline-flex; }
}
```

- [ ] **Step 4: Run the nav Playwright test to verify it passes**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/homepage-nav.spec.ts`

Expected: PASS with the desktop nav and mobile radial menu tests both green.

- [ ] **Step 5: Commit the new global chrome**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/layouts/BaseLayout.astro src/styles/global.css src/components/chrome tests/homepage-nav.spec.ts
git commit -m "feat: add reference-style global chrome"
```

## Task 3: Preserve the cloud music API structure with a shared browser runtime

**Files:**
- Create: `src/lib/music-cloud.ts`
- Create: `src/components/music/store.ts`
- Create: `src/components/music/MusicRuntime.tsx`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/music-cloud.test.ts`

- [ ] **Step 1: Write the failing unit tests for cloud music URL building, payload normalization, and LRC parsing**

```ts
import { describe, expect, it } from "vitest";
import { buildCloudMusicRequestUrl, normalizeCloudTrack, parseLrc } from "../src/lib/music-cloud";

describe("music cloud adapter", () => {
  it("builds a static-site-safe cloud music url from config", () => {
    expect(
      buildCloudMusicRequestUrl({
        apiBaseUrl: "https://api.injahow.cn/meting/",
        server: "netease",
        type: "song",
        id: "1809646618"
      })
    ).toBe("https://api.injahow.cn/meting/?server=netease&type=song&id=1809646618");
  });

  it("normalizes the first song result into the player shape", () => {
    const track = normalizeCloudTrack(
      [{ id: "1", name: "Song", artist: "Singer", cover: "cover.jpg", url: "song.mp3", lrc: "[00:01.00]Hello" }],
      "/fallback.jpg"
    );

    expect(track).toMatchObject({
      id: "1",
      title: "Song",
      artist: "Singer",
      cover: "cover.jpg",
      src: "song.mp3"
    });
    expect(track.lyrics[0]?.text).toBe("Hello");
  });

  it("parses multi-line lrc content into time-ordered entries", () => {
    expect(parseLrc("[00:01.00]第一句\n[00:02.50]第二句")).toEqual([
      { time: 1, text: "第一句" },
      { time: 2.5, text: "第二句" }
    ]);
  });
});
```

- [ ] **Step 2: Run the music helper tests to verify they fail**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/music-cloud.test.ts`

Expected: FAIL because `src/lib/music-cloud.ts` does not exist yet.

- [ ] **Step 3: Implement the cloud adapter, shared store, and runtime**

`src/lib/music-cloud.ts`

```ts
export type CloudMusicConfig = {
  apiBaseUrl: string;
  server: string;
  type: string;
  id: string;
};

export type LyricLine = { time: number; text: string };

export type CloudTrack = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lyrics: LyricLine[];
};

export function buildCloudMusicRequestUrl(config: CloudMusicConfig) {
  const base = config.apiBaseUrl.endsWith("/") ? config.apiBaseUrl : `${config.apiBaseUrl}/`;
  return `${base}?server=${config.server}&type=${config.type}&id=${config.id}`;
}

export function parseLrc(text: string): LyricLine[] {
  return text
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
      if (!match) return [];
      const [, min, sec, fraction, body] = match;
      const time = Number(min) * 60 + Number(sec) + Number(fraction ?? 0) / (fraction?.length === 3 ? 1000 : 100);
      const lyric = body.trim();
      return lyric ? [{ time, text: lyric }] : [];
    })
    .sort((a, b) => a.time - b.time);
}

export function normalizeCloudTrack(payload: unknown, fallbackCover: string): CloudTrack | null {
  const row = Array.isArray(payload) ? payload[0] : null;
  if (!row || typeof row !== "object") return null;

  const record = row as Record<string, unknown>;
  const src = String(record.url ?? "");
  if (!src) return null;

  return {
    id: String(record.id ?? crypto.randomUUID()),
    title: String(record.name ?? "未知曲目"),
    artist: String(record.artist ?? record.author ?? "未知歌手"),
    cover: String(record.cover ?? record.pic ?? fallbackCover),
    src,
    lyrics: parseLrc(String(record.lrc ?? ""))
  };
}
```

`src/components/music/store.ts`

```ts
import { atom } from "nanostores";
import type { CloudTrack } from "../../lib/music-cloud";

export const musicState = atom({
  ready: false,
  loading: true,
  tracks: [] as CloudTrack[],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  currentLyric: "欢迎来到资料归档页"
});

export function setTracks(tracks: CloudTrack[]) {
  musicState.set({
    ...musicState.get(),
    loading: false,
    ready: tracks.length > 0,
    tracks,
    currentIndex: 0,
    currentLyric: tracks[0]?.lyrics[0]?.text ?? musicState.get().currentLyric
  });
}

export function setPlayback(partial: Partial<typeof musicState.get()>) {
  musicState.set({ ...musicState.get(), ...partial });
}
```

`src/components/music/MusicRuntime.tsx`

```tsx
import { useEffect, useMemo, useRef } from "react";
import { siteShell } from "../../config/site-shell";
import { buildCloudMusicRequestUrl, normalizeCloudTrack } from "../../lib/music-cloud";
import { musicState, setPlayback, setTracks } from "./store";

export default function MusicRuntime() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = useMemo(() => {
    const state = musicState.get();
    return state.tracks[state.currentIndex] ?? null;
  }, [musicState.get().currentIndex, musicState.get().tracks]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      siteShell.music.cloudMusicIds.map(async (id) => {
        const url = buildCloudMusicRequestUrl({
          apiBaseUrl: siteShell.music.apiBaseUrl,
          server: siteShell.music.server,
          type: siteShell.music.type,
          id
        });
        const response = await fetch(url);
        const payload = await response.json();
        return normalizeCloudTrack(payload, siteShell.music.fallbackCover);
      })
    ).then((rows) => {
      if (cancelled) return;
      setTracks(rows.filter(Boolean) as ReturnType<typeof normalizeCloudTrack>[]);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !track) return;
    audioRef.current.src = track.src;
  }, [track]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        setPlayback({
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        });
      }}
      onEnded={() => {
        const state = musicState.get();
        const nextIndex = (state.currentIndex + 1) % Math.max(state.tracks.length, 1);
        setPlayback({ currentIndex: nextIndex, isPlaying: true });
      }}
    />
  );
}
```

Mount the runtime in `src/layouts/BaseLayout.astro`:

```astro
---
import MusicRuntime from "../components/music/MusicRuntime";
---

<body>
  <SiteBackground />
  <TopNav client:load currentPath={currentPath} />
  <MusicRuntime client:load />
  <main class="shell">
    <div class="page-stack">
      <slot />
    </div>
  </main>
</body>
```

- [ ] **Step 4: Run the cloud music helper tests to verify they pass**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/music-cloud.test.ts`

Expected: PASS with 3 passing tests in `tests/music-cloud.test.ts`.

- [ ] **Step 5: Commit the shared music runtime**

```bash
git add tests/music-cloud.test.ts src/lib/music-cloud.ts src/components/music/store.ts src/components/music/MusicRuntime.tsx src/layouts/BaseLayout.astro
git commit -m "feat: add shared cloud music runtime"
```

## Task 4: Rebuild the homepage shell, search, and music presentation

**Files:**
- Create: `src/components/home/HomeSplash.tsx`
- Create: `src/components/home/HomeSearch.tsx`
- Create: `src/components/home/HomeProfileCard.astro`
- Create: `src/components/home/HomeFeatureGrid.astro`
- Create: `src/components/home/HomeStatusStrip.astro`
- Create: `src/components/music/HomeMusicCard.tsx`
- Create: `src/components/music/HomeLyricBar.tsx`
- Modify: `src/pages/index.astro`
- Test: `tests/homepage-shell.spec.ts`

- [ ] **Step 1: Write the failing Playwright test for homepage sections, search, and music shell**

```ts
import { expect, test } from "@playwright/test";

test("homepage shows the rebuilt intro, search, music card, and status strip", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-home-splash]")).toBeVisible();
  await expect(page.locator("[data-home-search]")).toBeVisible();
  await expect(page.locator("[data-home-profile-card]")).toBeVisible();
  await expect(page.locator("[data-home-music-card]")).toBeVisible();
  await expect(page.locator("[data-home-lyric-bar]")).toBeVisible();
  await expect(page.locator("[data-home-status-strip]")).toBeVisible();
});

test("homepage search reveals mixed results from multiple content sections", async ({ page }) => {
  await page.goto("/");

  await page.locator("[data-home-search-input]").fill("To Heart");
  await expect(page.locator("[data-search-result-item]").first()).toBeVisible();
  await expect(page.getByText("资料库")).toBeVisible();
});
```

- [ ] **Step 2: Run the homepage shell Playwright test and verify it fails**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/homepage-shell.spec.ts`

Expected: FAIL because the new homepage sections and selectors do not exist yet.

- [ ] **Step 3: Implement the rebuilt homepage**

`src/components/home/HomeSearch.tsx`

```tsx
import { useMemo, useState } from "react";

type SearchItem = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  section: string;
};

export default function HomeSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return items.filter((item) =>
      [item.title, item.summary, item.section, ...item.tags].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    );
  }, [items, query]);

  return (
    <div className="home-search glass-card" data-home-search>
      <input
        data-home-search-input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索标题、摘要或标签..."
      />
      {results.length > 0 && (
        <div className="home-search-results">
          {results.slice(0, 8).map((item) => (
            <a key={item.href} href={item.href} data-search-result-item>
              <strong>{item.title}</strong>
              <span>{item.section}</span>
              <p>{item.summary}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

`src/components/music/HomeMusicCard.tsx`

```tsx
import { useStore } from "@nanostores/react";
import { musicState, setPlayback } from "./store";

export default function HomeMusicCard() {
  const state = useStore(musicState);
  const track = state.tracks[state.currentIndex];
  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <section className="home-music-card glass-card" data-home-music-card>
      <div className="home-music-meta">
        <img src={track?.cover} alt="" />
        <div>
          <span className="home-music-label">Cloud Music</span>
          <h3>{track?.title ?? "连接云音乐中..."}</h3>
          <p>{track?.artist ?? "正在读取曲目信息"}</p>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(event) => {
          const audio = document.querySelector("audio");
          if (!audio || !state.duration) return;
          audio.currentTime = (Number(event.currentTarget.value) / 100) * state.duration;
        }}
      />
      <div className="home-music-actions">
        <button type="button" onClick={() => setPlayback({ currentIndex: Math.max(state.currentIndex - 1, 0) })}>上一首</button>
        <button type="button" onClick={() => {
          const audio = document.querySelector("audio");
          if (!audio) return;
          if (state.isPlaying) {
            audio.pause();
            setPlayback({ isPlaying: false });
          } else {
            void audio.play();
            setPlayback({ isPlaying: true });
          }
        }}>
          {state.isPlaying ? "暂停" : "播放"}
        </button>
        <button type="button" onClick={() => setPlayback({ currentIndex: (state.currentIndex + 1) % Math.max(state.tracks.length, 1) })}>下一首</button>
      </div>
    </section>
  );
}
```

`src/components/music/HomeLyricBar.tsx`

```tsx
import { useStore } from "@nanostores/react";
import { musicState } from "./store";

export default function HomeLyricBar() {
  const state = useStore(musicState);

  return (
    <section className="home-lyric-bar glass-card" data-home-lyric-bar>
      <span className="lyric-dot" />
      <p>{state.currentLyric}</p>
      <span className="lyric-hint">{state.isPlaying ? "播放中" : "待机中"}</span>
    </section>
  );
}
```

`src/pages/index.astro`

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import HomeSplash from "../components/home/HomeSplash";
import HomeSearch from "../components/home/HomeSearch";
import HomeProfileCard from "../components/home/HomeProfileCard.astro";
import HomeFeatureGrid from "../components/home/HomeFeatureGrid.astro";
import HomeStatusStrip from "../components/home/HomeStatusStrip.astro";
import HomeMusicCard from "../components/music/HomeMusicCard";
import HomeLyricBar from "../components/music/HomeLyricBar";
import { getPublishedArticles, getPublishedNotes, getPublishedReferences } from "../lib/public-content";
import { buildHomeSearchIndex, buildHomeViewModel } from "../lib/home-shell";

const [articles, notes, references] = await Promise.all([
  getPublishedArticles(),
  getPublishedNotes(),
  getPublishedReferences()
]);

const model = buildHomeViewModel({ articles, notes, references });
const searchItems = buildHomeSearchIndex({ articles, notes, references });
---

<BaseLayout currentPath="/">
  <HomeSplash client:load />
  <section class="home-shell">
    <HomeSearch client:load items={searchItems} />
    <div class="home-row home-row--primary">
      <HomeProfileCard model={model} />
      <HomeMusicCard client:load />
    </div>
    <HomeLyricBar client:load />
    <HomeFeatureGrid model={model} />
    <HomeStatusStrip model={model} />
  </section>
</BaseLayout>
```

Add matching CSS in `src/styles/global.css`:

```css
.home-shell {
  display: grid;
  gap: 24px;
  padding-top: 108px;
}

.home-row--primary {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 24px;
}

.home-search-results,
.home-music-card,
.home-lyric-bar,
.home-status-strip {
  border-radius: 28px;
}

@media (max-width: 980px) {
  .home-row--primary {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run the homepage shell test to verify it passes**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/homepage-shell.spec.ts`

Expected: PASS with both homepage shell tests green.

- [ ] **Step 5: Commit the homepage rebuild**

```bash
git add src/pages/index.astro src/components/home src/components/music/HomeMusicCard.tsx src/components/music/HomeLyricBar.tsx src/styles/global.css tests/homepage-shell.spec.ts
git commit -m "feat: rebuild homepage to match reference layout"
```

## Task 5: Add a structured local-manager editor for homepage shell settings

**Files:**
- Create: `manager/src/lib/homePageConfig.ts`
- Create: `manager/src/components/AssetUrlPicker.tsx`
- Modify: `manager/src/pages/PageBuilder.tsx`
- Modify: `src/config/pages/home.json`
- Test: `tests/manager-home-config.test.ts`

- [ ] **Step 1: Write the failing manager-config unit test**

```ts
import { describe, expect, it } from "vitest";
import { normalizeHomePageConfig, serializeHomePageConfig } from "../manager/src/lib/homePageConfig";

describe("home page config manager helpers", () => {
  it("normalizes announcements, image urls, and cloud music ids into editable arrays", () => {
    const config = normalizeHomePageConfig({
      announcements: ["公告 A"],
      backgroundImages: ["/uploads/ui/a.jpg"],
      music: { cloudMusicIds: ["12345"], fallbackCover: "/uploads/ui/cover.jpg" }
    });

    expect(config.announcements).toEqual(["公告 A"]);
    expect(config.backgroundImages).toEqual(["/uploads/ui/a.jpg"]);
    expect(config.music.cloudMusicIds).toEqual(["12345"]);
  });

  it("serializes edited arrays back into the home.json shape", () => {
    const json = serializeHomePageConfig({
      brand: { title: "maki", suffix: "の", after: "archive" },
      hero: { eyebrow: "文稿与资料归档", title: "标题", description: "描述" },
      announcements: ["公告 A", "公告 B"],
      backgroundImages: ["/uploads/ui/a.jpg", "/uploads/ui/b.jpg"],
      music: {
        apiBaseUrl: "https://api.injahow.cn/meting/",
        server: "netease",
        type: "song",
        cloudMusicIds: ["12345", "67890"],
        idleLyric: "欢迎",
        fallbackCover: "/uploads/ui/cover.jpg"
      }
    });

    expect(json.music.cloudMusicIds).toEqual(["12345", "67890"]);
    expect(json.announcements).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the manager-config test and verify it fails**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/manager-home-config.test.ts`

Expected: FAIL because `manager/src/lib/homePageConfig.ts` does not exist yet.

- [ ] **Step 3: Implement the structured homepage settings editor in the local manager**

`manager/src/lib/homePageConfig.ts`

```ts
export type HomePageConfig = {
  brand: { title: string; suffix: string; after: string };
  hero: { eyebrow: string; title: string; description: string };
  announcements: string[];
  backgroundImages: string[];
  music: {
    apiBaseUrl: string;
    server: string;
    type: string;
    cloudMusicIds: string[];
    idleLyric: string;
    fallbackCover: string;
  };
  blocks?: unknown[];
};

export function normalizeHomePageConfig(input: Partial<HomePageConfig>): HomePageConfig {
  return {
    brand: {
      title: input.brand?.title ?? "maki",
      suffix: input.brand?.suffix ?? "の",
      after: input.brand?.after ?? "archive"
    },
    hero: {
      eyebrow: input.hero?.eyebrow ?? "",
      title: input.hero?.title ?? "",
      description: input.hero?.description ?? ""
    },
    announcements: input.announcements ?? [],
    backgroundImages: input.backgroundImages ?? [],
    music: {
      apiBaseUrl: input.music?.apiBaseUrl ?? "https://api.injahow.cn/meting/",
      server: input.music?.server ?? "netease",
      type: input.music?.type ?? "song",
      cloudMusicIds: input.music?.cloudMusicIds ?? [],
      idleLyric: input.music?.idleLyric ?? "",
      fallbackCover: input.music?.fallbackCover ?? ""
    },
    blocks: input.blocks ?? []
  };
}

export function serializeHomePageConfig(config: HomePageConfig) {
  return {
    ...config,
    announcements: config.announcements.filter(Boolean),
    backgroundImages: config.backgroundImages.filter(Boolean),
    music: {
      ...config.music,
      cloudMusicIds: config.music.cloudMusicIds.filter(Boolean)
    }
  };
}
```

`manager/src/components/AssetUrlPicker.tsx`

```tsx
import { useEffect, useState } from "react";
import { getAssets } from "../api";
import type { AssetItem } from "../types";

export function AssetUrlPicker({
  onPick,
  onClose
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<AssetItem[]>([]);

  useEffect(() => {
    void getAssets().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="dialog-backdrop">
      <div className="dialog-panel">
        <div className="toolbar">
          <h2>选择资源地址</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="stack">
          {items.map((item) => (
            <button key={item.url} type="button" className="asset-option" onClick={() => onPick(item.url)}>
              <strong>{item.path}</strong>
              <span>{item.url}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

`manager/src/pages/PageBuilder.tsx` core replacement for `home`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { getPageConfig, savePageConfig } from "../api";
import { AssetUrlPicker } from "../components/AssetUrlPicker";
import { normalizeHomePageConfig, serializeHomePageConfig, type HomePageConfig } from "../lib/homePageConfig";

// keep the existing raw JSON editor path for non-home configs
// but when name === "home", render structured fields
const [homeConfig, setHomeConfig] = useState<HomePageConfig | null>(null);
const [showPicker, setShowPicker] = useState<null | { kind: "bg" | "cover"; index: number }>(null);

useEffect(() => {
  if (name !== "home") return;
  try {
    setHomeConfig(normalizeHomePageConfig(JSON.parse(json)));
  } catch {
    setHomeConfig(normalizeHomePageConfig({}));
  }
}, [json, name]);

const updateHome = (updater: (current: HomePageConfig) => HomePageConfig) => {
  setHomeConfig((current) => (current ? updater(current) : current));
};

const addBackgroundImage = () =>
  updateHome((current) => ({
    ...current,
    backgroundImages: [...current.backgroundImages, ""]
  }));

const updateBackgroundImage = (index: number, value: string) =>
  updateHome((current) => ({
    ...current,
    backgroundImages: current.backgroundImages.map((item, itemIndex) =>
      itemIndex === index ? value : item
    )
  }));

const removeBackgroundImage = (index: number) =>
  updateHome((current) => ({
    ...current,
    backgroundImages: current.backgroundImages.filter((_, itemIndex) => itemIndex !== index)
  }));

const addCloudMusicId = () =>
  updateHome((current) => ({
    ...current,
    music: {
      ...current.music,
      cloudMusicIds: [...current.music.cloudMusicIds, ""]
    }
  }));

const updateCloudMusicId = (index: number, value: string) =>
  updateHome((current) => ({
    ...current,
    music: {
      ...current.music,
      cloudMusicIds: current.music.cloudMusicIds.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    }
  }));

const removeCloudMusicId = (index: number) =>
  updateHome((current) => ({
    ...current,
    music: {
      ...current.music,
      cloudMusicIds: current.music.cloudMusicIds.filter((_, itemIndex) => itemIndex !== index)
    }
  }));

// Example structured save path
const handleStructuredSave = async () => {
  if (!homeConfig) return;
  const normalized = serializeHomePageConfig(homeConfig);
  const saved = await savePageConfig("home", JSON.stringify(normalized, null, 2));
  setJson(saved.json);
};
```

Structured fields to render in `PageBuilder.tsx` when `name === "home"`:

```tsx
<label className="field">
  <span>公告文字</span>
  <textarea
    value={homeConfig.announcements.join("\n")}
    onChange={(event) =>
      updateHome((current) => ({
        ...current,
        announcements: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
      }))
    }
  />
</label>

<section className="panel stack">
  <div className="toolbar">
    <h2>背景图片</h2>
    <button type="button" onClick={() => addBackgroundImage()}>新增图片</button>
  </div>
  {homeConfig.backgroundImages.map((value, index) => (
    <div key={`${value}-${index}`} className="field-row">
      <input value={value} onChange={(event) => updateBackgroundImage(index, event.target.value)} />
      <button type="button" onClick={() => setShowPicker({ kind: "bg", index })}>选择资源</button>
      <button type="button" onClick={() => removeBackgroundImage(index)}>删除</button>
    </div>
  ))}
</section>

<section className="panel stack">
  <div className="toolbar">
    <h2>云音乐歌曲 ID</h2>
    <button type="button" onClick={() => addCloudMusicId()}>新增 ID</button>
  </div>
  {homeConfig.music.cloudMusicIds.map((value, index) => (
    <div key={`${value}-${index}`} className="field-row">
      <input value={value} onChange={(event) => updateCloudMusicId(index, event.target.value)} />
      <button type="button" onClick={() => removeCloudMusicId(index)}>删除</button>
    </div>
  ))}
</section>
```

- [ ] **Step 4: Run the manager-config test to verify it passes**

Run: `pnpm --config.minimum-release-age=0 vitest run tests/manager-home-config.test.ts`

Expected: PASS with both manager config helper tests green.

- [ ] **Step 5: Commit the local manager homepage editor**

```bash
git add tests/manager-home-config.test.ts manager/src/lib/homePageConfig.ts manager/src/components/AssetUrlPicker.tsx manager/src/pages/PageBuilder.tsx src/config/pages/home.json
git commit -m "feat: add manager controls for homepage shell settings"
```

## Task 6: Add the floating player and re-theme inner archive cards

**Files:**
- Create: `src/components/music/FloatingPlayer.tsx`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/components/ReferenceCard.astro`
- Modify: `src/components/NoteCard.astro`
- Modify: `src/components/TopicCard.astro`
- Test: `tests/floating-player.spec.ts`

- [ ] **Step 1: Write the failing Playwright test for floating-player visibility and inner-page glass cards**

```ts
import { expect, test } from "@playwright/test";

test("floating player stays off the homepage and appears on inner content pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-floating-player]")).toHaveCount(0);

  await page.goto("/references/to-heart-entry/");
  await expect(page.locator("[data-floating-player]")).toBeVisible();
});

test("archive pages use the new shared glass card shell", async ({ page }) => {
  await page.goto("/references/");
  await expect(page.locator(".glass-card").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /To Heart/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the floating-player Playwright test and verify it fails**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/floating-player.spec.ts`

Expected: FAIL because `[data-floating-player]` and the new `.glass-card` archive shell are not implemented yet.

- [ ] **Step 3: Implement the floating player and add stable inner-page card hooks**

`src/components/music/FloatingPlayer.tsx`

```tsx
import { useStore } from "@nanostores/react";
import { musicState, setPlayback } from "./store";

export default function FloatingPlayer({ currentPath }: { currentPath: string }) {
  const state = useStore(musicState);
  const track = state.tracks[state.currentIndex];

  if (!track || currentPath === "/") return null;

  return (
    <aside className="floating-player glass-card" data-floating-player>
      <img src={track.cover} alt="" />
      <div>
        <strong>{track.title}</strong>
        <span>{state.currentLyric}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          const audio = document.querySelector("audio");
          if (!audio) return;
          if (state.isPlaying) {
            audio.pause();
            setPlayback({ isPlaying: false });
          } else {
            void audio.play();
            setPlayback({ isPlaying: true });
          }
        }}
      >
        {state.isPlaying ? "暂停" : "播放"}
      </button>
    </aside>
  );
}
```

Mount it in `src/layouts/BaseLayout.astro`:

```astro
---
import FloatingPlayer from "../components/music/FloatingPlayer";
---

<body>
  <SiteBackground />
  <TopNav client:load currentPath={currentPath} />
  <MusicRuntime client:load />
  <FloatingPlayer client:load currentPath={currentPath} />
  <main class="shell">
    <div class="page-stack">
      <slot />
    </div>
  </main>
</body>
```

Add stable classes to each archive card component:

`src/components/ArticleCard.astro`

```astro
<article class="archive-card glass-card media-card">
  ...
</article>
```

`src/components/ReferenceCard.astro`

```astro
<article class="archive-card glass-card media-card">
  ...
</article>
```

`src/components/NoteCard.astro`

```astro
<article class="archive-card glass-card media-card">
  ...
</article>
```

`src/components/TopicCard.astro`

```astro
<article class="archive-card glass-card media-card">
  ...
</article>
```

Add floating-player and archive-card polish in `src/styles/global.css`:

```css
.floating-player {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 30;
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
}

.media-card {
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.media-card:hover {
  transform: translateY(-3px) scale(1.01);
}
```

- [ ] **Step 4: Run the floating-player test to verify it passes**

Run: `pnpm --config.minimum-release-age=0 playwright test tests/floating-player.spec.ts`

Expected: PASS with floating player visible on inner pages and `.glass-card` archive shells detected.

- [ ] **Step 5: Commit the floating player and inner-page theme unification**

```bash
git add src/components/music/FloatingPlayer.tsx src/layouts/BaseLayout.astro src/styles/global.css src/components/ArticleCard.astro src/components/ReferenceCard.astro src/components/NoteCard.astro src/components/TopicCard.astro tests/floating-player.spec.ts
git commit -m "feat: add floating player and glass archive cards"
```

## Task 7: Run full regression and static-site verification

**Files:**
- Modify if needed after failures: exact files reported by the failing test run
- Test: `tests/home-shell.test.ts`
- Test: `tests/music-cloud.test.ts`
- Test: `tests/homepage-nav.spec.ts`
- Test: `tests/homepage-shell.spec.ts`
- Test: `tests/floating-player.spec.ts`
- Test: `tests/reference-extract.test.ts`
- Test: `tests/reference-reading.test.ts`
- Test: `tests/public-content-filter.test.ts`

- [ ] **Step 1: Run the targeted Vitest suite**

Run:

```bash
pnpm --config.minimum-release-age=0 vitest run \
  tests/home-shell.test.ts \
  tests/music-cloud.test.ts \
  tests/reference-extract.test.ts \
  tests/reference-reading.test.ts \
  tests/public-content-filter.test.ts
```

Expected: PASS with all targeted unit tests green.

- [ ] **Step 2: Run the targeted Playwright suite**

Run:

```bash
pnpm --config.minimum-release-age=0 playwright test \
  tests/homepage-nav.spec.ts \
  tests/homepage-shell.spec.ts \
  tests/floating-player.spec.ts
```

Expected: PASS with all desktop/mobile UI checks green.

- [ ] **Step 3: Run the static build**

Run: `pnpm --config.minimum-release-age=0 build`

Expected: PASS with Astro producing a fresh `dist/` output and no build-blocking errors.

- [ ] **Step 4: Fix any regression surfaced by the verification runs**

If a failure appears, patch only the reported file with the smallest change required. For example, if the homepage search selector changed, update `src/components/home/HomeSearch.tsx` rather than weakening the Playwright assertion.

```ts
// Example minimal regression fix pattern:
// keep the public selector stable instead of deleting the assertion hook
<input data-home-search-input ... />
```

- [ ] **Step 5: Re-run the exact failing command until all verifications pass**

Run the same command that failed in Step 1, 2, or 3.

Expected: PASS for the previously failing suite with no new regressions introduced.

- [ ] **Step 6: Commit the final verified UI rebuild**

```bash
git add .
git commit -m "feat: restyle homepage with reference-inspired glass shell"
```
