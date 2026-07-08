# Global Shell And Photo Wall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent global music shell, floating player, splash/click effects, a public photo wall with album content modeling, and local manager authoring support while keeping Astro + GitHub Pages deployment intact.

**Architecture:** Keep Astro as the public page layer, then extend the existing React-islands shell with one global music runtime, one global floating player, one splash overlay, and one click-effect canvas mounted from `BaseLayout`. Add a first-class `albums` collection to the existing file-backed content system, render it through a dedicated `/photowall/` page, and expose album editing through the existing local manager instead of adding a new CMS.

**Tech Stack:** Astro 5, React 18 islands, Nanostores, TypeScript, Vitest, Playwright, Express, Vite, CSS

---

## File Map

### New files

- `src/components/music/FloatingPlayer.tsx`
  Purpose: persistent inner-page mini player that consumes the shared music store and hides itself on `/`.
- `src/components/home/SplashScreen.tsx`
  Purpose: session-scoped welcome overlay mounted from the global layout.
- `src/components/chrome/ClickEffect.tsx`
  Purpose: global click-ripple canvas overlay.
- `src/components/photowall/PhotoWallClient.tsx`
  Purpose: client-side album switching, wall search, masonry rendering, and fullscreen image viewer.
- `src/pages/photowall/index.astro`
  Purpose: public photo wall route that feeds published albums into the client component.
- `src/content/albums/站点素材墙示例.md`
  Purpose: fixture entry to exercise the new album schema and route during development.
- `tests/floating-player.spec.ts`
  Purpose: Playwright coverage for playback persistence and inner-page floating controls.
- `tests/photowall.spec.ts`
  Purpose: Playwright coverage for album overview, search, album detail, and fullscreen viewer.
- `tests/album-schema.test.ts`
  Purpose: unit coverage for the new `albums` schema and published filtering behavior.
- `manager/src/pages/AlbumEditor.tsx`
  Purpose: dedicated manager screen for album metadata and photo list editing.
- `tests/manager-album-editor.test.ts`
  Purpose: smoke test that the new manager editor module can be imported.

### Modified files

- `src/layouts/BaseLayout.astro`
  Purpose: mount the global music runtime, floating player, splash screen, click effect, and still render the shared site background and nav.
- `src/pages/index.astro`
  Purpose: stop mounting `MusicRuntime` locally, include published albums in homepage search, and keep the existing hero layout intact.
- `src/components/music/MusicRuntime.tsx`
  Purpose: harden startup so it behaves correctly when mounted globally.
- `src/components/music/store.ts`
  Purpose: add helpers the floating player and page transitions need without resetting playback.
- `src/components/chrome/HomeSearchBar.tsx`
  Purpose: restyle the search field/panel to match the reference site more closely.
- `src/components/chrome/TopNav.tsx`
  Purpose: surface the new “照片墙” nav item.
- `src/config/site-shell.ts`
  Purpose: add the new nav item to the shared shell config.
- `src/lib/home-shell.ts`
  Purpose: extend the homepage search index to include published albums.
- `src/lib/public-content.ts`
  Purpose: add `getPublishedAlbums` beside articles, notes, and references.
- `src/content/config.ts`
  Purpose: register the new `albums` collection.
- `packages/content-core/src/schemas.ts`
  Purpose: define the `albumSchema` next to `articleSchema` and `referenceSchema`.
- `src/styles/global.css`
  Purpose: add the floating player, splash, click-effect, photo wall, and refined search styles.
- `manager/src/types.ts`
  Purpose: add `albums` to `ContentKind`.
- `manager/src/api.ts`
  Purpose: reuse the existing CRUD API for the new album content kind.
- `manager/src/App.tsx`
  Purpose: route album entries to the new album editor.
- `manager/src/pages/ContentList.tsx`
  Purpose: expose the albums collection in the manager list.
- `manager/src/pages/PageBuilder.tsx`
  Purpose: keep homepage shell editing intact while implementation proceeds around it.
- `manager/server/files.ts`
  Purpose: register `albums` as a first-class markdown content directory.
- `tests/home-shell.test.ts`
  Purpose: cover album search items and nav labels.
- `tests/content-schema.test.ts`
  Purpose: add schema assertions for the new collection.
- `tests/public-content-filter.test.ts`
  Purpose: cover published album filtering.
- `tests/homepage-shell.spec.ts`
  Purpose: assert splash visibility and homepage search shell after the redesign.
- `tests/manager-api.test.ts`
  Purpose: keep the manager content route contract covered after `albums` is added.

## Task 1: Globalize Music Runtime And Add Shell Effects

**Files:**
- Create: `src/components/music/FloatingPlayer.tsx`
- Create: `src/components/home/SplashScreen.tsx`
- Create: `src/components/chrome/ClickEffect.tsx`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/music/MusicRuntime.tsx`
- Modify: `src/components/music/store.ts`
- Modify: `src/styles/global.css`
- Test: `tests/floating-player.spec.ts`
- Test: `tests/homepage-shell.spec.ts`

- [ ] **Step 1: Write the failing browser tests for persistent playback and shell effects**

```ts
import { expect, test } from "@playwright/test";

test("music keeps playing after leaving the homepage and shows the floating player on inner pages", async ({ page }) => {
  await page.route("https://api.injahow.cn/meting/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get("type");

    if (type === "lrc") {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "[00:00.00]欢迎来到资料岛\n[00:01.00]第二句歌词",
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify([
        {
          id: requestUrl.searchParams.get("id") ?? "4931896",
          name: "鳥の詩",
          artist: "Lia",
          url: "https://cdn.example.com/song.mp3",
          pic: "https://cdn.example.com/cover.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=4931896",
        },
      ]),
    });
  });

  await page.goto("/");
  await page.locator("[data-home-music-toggle]").click();
  await expect(page.locator("[data-home-lyric-bar]")).toContainText("欢迎来到资料岛");
  await page.goto("/about/");
  await expect(page.locator("[data-floating-player]")).toBeVisible();
  await expect(page.locator("[data-floating-player-title]")).toContainText("鳥の詩");
  await expect(page.locator("[data-floating-player-lyric]")).toContainText("欢迎来到资料岛");
});

test("splash is shown once per session and then stays dismissed", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-splash-screen]")).toBeVisible();
  await expect(page.locator("[data-splash-screen]")).toBeHidden({ timeout: 5000 });
  await page.reload();
  await expect(page.locator("[data-splash-screen]")).toHaveCount(0);
});
```

- [ ] **Step 2: Run the targeted tests to confirm they fail**

Run: `pnpm test:e2e tests/floating-player.spec.ts tests/homepage-shell.spec.ts`

Expected:
- `FAIL` because `[data-floating-player]` and `[data-splash-screen]` do not exist yet
- `FAIL` because `MusicRuntime` is still mounted only on the homepage

- [ ] **Step 3: Implement the global runtime, floating player, splash screen, and click effect**

`src/layouts/BaseLayout.astro`

```astro
---
import "../styles/global.css";
import SiteBackground from "../components/chrome/SiteBackground.astro";
import TopNav from "../components/chrome/TopNav";
import ClickEffect from "../components/chrome/ClickEffect";
import SplashScreen from "../components/home/SplashScreen";
import FloatingPlayer from "../components/music/FloatingPlayer";
import MusicRuntime from "../components/music/MusicRuntime";
import { siteShell } from "../config/site-shell";
import { siteDescription, siteTitle } from "../data/site";

const currentPath = Astro.props.currentPath ?? Astro.url.pathname;
---

<body>
  <SiteBackground />
  <MusicRuntime client:load />
  <SplashScreen client:load />
  <ClickEffect client:load />
  <TopNav client:load currentPath={currentPath} />
  <FloatingPlayer client:load currentPath={currentPath} />

  <main class="shell">
    <div class="page-stack">
      <slot />
    </div>
  </main>
</body>
```

`src/components/music/FloatingPlayer.tsx`

```tsx
import { useStore } from "@nanostores/react";
import { musicState, setCurrentTrack, setPlayback } from "./store";

export default function FloatingPlayer({ currentPath }: { currentPath: string }) {
  const state = useStore(musicState);
  const track = state.tracks[state.currentIndex] ?? null;
  const hidden = currentPath === "/";

  if (!track) {
    return null;
  }

  return (
    <aside
      aria-hidden={hidden}
      className={`floating-player${hidden ? " is-hidden" : ""}`}
      data-floating-player
    >
      <button
        className="floating-player__cover"
        onClick={() => setPlayback({ isPlaying: !state.isPlaying })}
        type="button"
      >
        <img alt={`${track.title} cover`} src={track.coverUrl} />
      </button>
      <div className="floating-player__copy">
        <strong data-floating-player-title>{track.title}</strong>
        <span data-floating-player-lyric>{state.currentLyric}</span>
      </div>
      <div className="floating-player__actions">
        <button onClick={() => setPlayback({ isPlaying: !state.isPlaying })} type="button">播放</button>
        <button onClick={() => setCurrentTrack(state.currentIndex + 1)} type="button">下一首</button>
      </div>
    </aside>
  );
}
```

`src/components/home/SplashScreen.tsx`

```tsx
import { useEffect, useState } from "react";

const STORAGE_KEY = "maki-shell-splash-seen";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="site-splash" data-splash-screen>
      <div className="site-splash__card">
        <img alt="站点头像" src="https://s1.ax1x.com/2023/07/28/pCx6j3R.jpg" />
        <h1>maki archive</h1>
        <p>正在载入文稿、资料与图片归档</p>
        <span className="site-splash__progress" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update homepage mounting and styles, then rerun the shell tests**

Run: `pnpm test:e2e tests/floating-player.spec.ts tests/homepage-shell.spec.ts`

Expected:
- `PASS` on the new floating-player test
- `PASS` on the splash behavior test
- existing homepage shell tests remain green after `MusicRuntime` is removed from `src/pages/index.astro`

- [ ] **Step 5: Commit the shell-layer change**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro src/components/music/FloatingPlayer.tsx src/components/home/SplashScreen.tsx src/components/chrome/ClickEffect.tsx src/components/music/MusicRuntime.tsx src/components/music/store.ts src/styles/global.css tests/floating-player.spec.ts tests/homepage-shell.spec.ts
git commit -m "feat: add persistent music shell and intro effects"
```

## Task 2: Add Albums To The Content Model And Homepage Search

**Files:**
- Modify: `packages/content-core/src/schemas.ts`
- Modify: `src/content/config.ts`
- Create: `src/content/albums/站点素材墙示例.md`
- Modify: `src/lib/public-content.ts`
- Modify: `src/lib/home-shell.ts`
- Modify: `src/config/site-shell.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/album-schema.test.ts`
- Test: `tests/home-shell.test.ts`
- Test: `tests/public-content-filter.test.ts`
- Test: `tests/content-schema.test.ts`

- [ ] **Step 1: Write the failing schema and search-index tests**

```ts
import { describe, expect, it } from "vitest";
import { albumSchema } from "../packages/content-core/src/schemas";
import { buildHomeSearchIndex } from "../src/lib/home-shell";

describe("album schema", () => {
  it("accepts a public album with nested photos", () => {
    const parsed = albumSchema.parse({
      title: "Leaf / Key 访谈相册",
      date: "2026-07-08",
      summary: "站内图片资料墙",
      cover: "/uploads/albums/key/cover.jpg",
      tags: ["Leaf", "Key"],
      visibility: "public",
      photos: [
        {
          url: "/uploads/albums/key/page-1.jpg",
          caption: "卷首页",
          alt: "Leaf Key 采访卷首",
        },
      ],
    });

    expect(parsed.visibility).toBe("public");
    expect(parsed.photos).toHaveLength(1);
  });
});

describe("buildHomeSearchIndex", () => {
  it("includes published albums as 照片墙 results", () => {
    const items = buildHomeSearchIndex({
      articles: [],
      notes: [],
      references: [],
      albums: [
        {
          slug: "leaf-key-gallery",
          data: {
            title: "Leaf / Key 访谈相册",
            summary: "图片资料墙",
            tags: ["访谈", "扫描页"],
          },
        },
      ],
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/photowall/#album-leaf-key-gallery",
          section: "照片墙",
        }),
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the targeted tests and confirm the missing `albums` support**

Run: `pnpm vitest run tests/album-schema.test.ts tests/home-shell.test.ts tests/public-content-filter.test.ts tests/content-schema.test.ts`

Expected:
- `FAIL` because `albumSchema` is not exported yet
- `FAIL` because `buildHomeSearchIndex` does not accept `albums`
- `FAIL` because no published album helper exists

- [ ] **Step 3: Implement the album schema, published helper, nav item, and homepage search wiring**

`packages/content-core/src/schemas.ts`

```ts
const albumPhotoSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
  alt: z.string().optional(),
  credit: z.string().optional(),
  relatedReferences: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
});

export const albumSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  cover: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  visibility: z.enum(["public", "hidden"]).default("public"),
  relatedArticles: z.array(z.string()).default([]),
  relatedReferences: z.array(z.string()).default([]),
  photos: z.array(albumPhotoSchema).default([]),
});
```

`src/lib/public-content.ts`

```ts
export const getPublishedAlbums = async () =>
  sortByDateDesc(
    filterPublishedEntries(await getCollection("albums")).filter(
      (entry) => entry.data.visibility === "public",
    ),
  );
```

`src/lib/home-shell.ts`

```ts
type HomeCollections = {
  articles: EntryLike[];
  notes: EntryLike[];
  references: EntryLike[];
  albums: EntryLike[];
};

type SearchItem = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  section: "文稿" | "笔记" | "资料库" | "照片墙";
};

...albums.map((entry) => ({
  title: entry.data.title,
  summary: entry.data.summary,
  tags: withTags(entry.data.tags),
  href: `/photowall/#album-${entry.slug}`,
  section: "照片墙" as const,
})),
```

- [ ] **Step 4: Update fixtures and rerun the content/search tests**

Run: `pnpm vitest run tests/album-schema.test.ts tests/home-shell.test.ts tests/public-content-filter.test.ts tests/content-schema.test.ts`

Expected:
- `PASS` with album schema coverage
- `PASS` with homepage search now including “照片墙”
- `PASS` with `siteShell.navItems` containing the new nav entry

- [ ] **Step 5: Commit the content-model and search integration**

```bash
git add packages/content-core/src/schemas.ts src/content/config.ts src/content/albums/站点素材墙示例.md src/lib/public-content.ts src/lib/home-shell.ts src/config/site-shell.ts src/pages/index.astro tests/album-schema.test.ts tests/home-shell.test.ts tests/public-content-filter.test.ts tests/content-schema.test.ts
git commit -m "feat: add album content model and homepage search"
```

## Task 3: Build The Public Photo Wall Page

**Files:**
- Create: `src/components/photowall/PhotoWallClient.tsx`
- Create: `src/components/photowall/photowall.css`
- Create: `src/pages/photowall/index.astro`
- Test: `tests/photowall.spec.ts`

- [ ] **Step 1: Write the failing browser test for the photo wall flow**

```ts
import { expect, test } from "@playwright/test";

test("photo wall supports album overview, album drill-in, and fullscreen preview", async ({ page }) => {
  await page.goto("/photowall/");

  await expect(page.locator("[data-photowall-overview]")).toBeVisible();
  await expect(page.locator("[data-album-card]")).toHaveCount(1);
  await page.locator("[data-album-card]").first().click();
  await expect(page.locator("[data-album-detail]")).toBeVisible();
  await page.locator("[data-album-photo]").first().click();
  await expect(page.locator("[data-photowall-lightbox]")).toBeVisible();
});
```

- [ ] **Step 2: Run the photo wall test and verify the new route is missing**

Run: `pnpm test:e2e tests/photowall.spec.ts`

Expected:
- `FAIL` because `/photowall/` does not exist yet

- [ ] **Step 3: Implement the photo wall route and client component**

`src/pages/photowall/index.astro`

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PhotoWallClient from "../../components/photowall/PhotoWallClient";
import { getPublishedAlbums } from "../../lib/public-content";

const albums = await getPublishedAlbums();
---

<BaseLayout title="照片墙 | maki archive" currentPath="/photowall/">
  <PhotoWallClient client:load albums={albums} />
</BaseLayout>
```

`src/components/photowall/PhotoWallClient.tsx`

```tsx
import { useMemo, useState } from "react";
import "./photowall.css";

export default function PhotoWallClient({ albums }: { albums: AlbumEntry[] }) {
  const [currentAlbumSlug, setCurrentAlbumSlug] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);
  const [query, setQuery] = useState("");

  const currentAlbum = albums.find((album) => album.slug === currentAlbumSlug) ?? null;
  const filteredAlbums = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return albums;
    }
    return albums.filter((album) =>
      [album.data.title, album.data.summary, ...(album.data.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [albums, query]);

  if (currentAlbum) {
    return (
      <section className="photowall" data-album-detail>
        <button onClick={() => setCurrentAlbumSlug(null)} type="button">返回照片墙</button>
        <h1>{currentAlbum.data.title}</h1>
        <div className="photowall__masonry">
          {currentAlbum.data.photos.map((photo, index) => (
            <button data-album-photo key={`${photo.url}-${index}`} onClick={() => setSelectedPhoto(photo)} type="button">
              <img alt={photo.alt ?? photo.caption ?? currentAlbum.data.title} src={photo.url} />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="photowall" data-photowall-overview>
      <header className="photowall__head">
        <div>
          <p className="eyebrow">Photo Wall</p>
          <h1>照片墙</h1>
          <p>把文稿之外的图像线索整理成可以继续互链的公开相册。</p>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索相册标题或说明…" />
      </header>
      <div className="photowall__albums">
        {filteredAlbums.map((album) => (
          <button data-album-card id={`album-${album.slug}`} key={album.slug} onClick={() => setCurrentAlbumSlug(album.slug)} type="button">
            <img alt={album.data.title} src={album.data.cover} />
            <strong>{album.data.title}</strong>
            <span>{album.data.photos.length} 张图片</span>
          </button>
        ))}
      </div>
      {selectedPhoto ? (
        <div className="photowall__lightbox" data-photowall-lightbox onClick={() => setSelectedPhoto(null)}>
          <button className="photowall__lightbox-close" type="button">关闭</button>
          <figure className="photowall__lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img alt={selectedPhoto.alt ?? selectedPhoto.caption ?? "照片预览"} src={selectedPhoto.url} />
            {selectedPhoto.caption ? <figcaption>{selectedPhoto.caption}</figcaption> : null}
          </figure>
        </div>
      ) : null}
    </section>
  );
}
```

`src/components/photowall/photowall.css`

```css
.photowall {
  display: grid;
  gap: 24px;
}

.photowall__head,
.photowall__albums,
.photowall__masonry {
  display: grid;
  gap: 20px;
}

.photowall__albums {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.photowall__masonry {
  columns: 3 260px;
}

.photowall__masonry > button {
  break-inside: avoid;
  margin-bottom: 16px;
}

.photowall__lightbox {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(3, 7, 18, 0.9);
  z-index: 90;
}
```

- [ ] **Step 4: Add wall styling and rerun the browser test**

Run: `pnpm test:e2e tests/photowall.spec.ts`

Expected:
- `PASS` with album overview, drill-in, and fullscreen preview all working

- [ ] **Step 5: Commit the public photo wall**

```bash
git add src/components/photowall/PhotoWallClient.tsx src/components/photowall/photowall.css src/pages/photowall/index.astro tests/photowall.spec.ts
git commit -m "feat: add public photo wall page"
```

## Task 4: Add Album Editing To The Local Manager

**Files:**
- Create: `manager/src/pages/AlbumEditor.tsx`
- Modify: `manager/src/App.tsx`
- Modify: `manager/src/types.ts`
- Modify: `manager/src/pages/ContentList.tsx`
- Modify: `manager/src/pages/Editor.tsx`
- Modify: `manager/src/api.ts`
- Modify: `manager/server/files.ts`
- Modify: `manager/server/routes/content.ts`
- Test: `tests/manager-album-editor.test.ts`
- Test: `tests/manager-api.test.ts`

- [ ] **Step 1: Write the failing manager smoke test**

```ts
import { describe, expect, it } from "vitest";

describe("manager album editor modules", () => {
  it("exports the dedicated album editor", async () => {
    await expect(import("../manager/src/pages/AlbumEditor")).resolves.toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the manager tests to confirm album support is missing**

Run: `pnpm vitest run tests/manager-album-editor.test.ts tests/manager-api.test.ts tests/manager-editor.test.ts`

Expected:
- `FAIL` because `AlbumEditor` does not exist
- `FAIL` or `TYPECHECK` errors because `albums` is not part of `ContentKind`

- [ ] **Step 3: Implement `albums` support across manager types, routing, and editing**

`manager/src/types.ts`

```ts
export type ContentKind =
  | "articles"
  | "references"
  | "albums"
  | "drafts"
  | "notes"
  | "topics"
  | "vault";
```

`manager/server/files.ts`

```ts
const CONTENT_DIRS: Record<ContentKind, string> = {
  articles: "articles",
  references: "references",
  albums: "albums",
  drafts: "drafts",
  notes: "notes",
  topics: "topics",
  vault: "vault",
};
```

`manager/src/App.tsx`

```tsx
type View =
  | "dashboard"
  | "content"
  | "editor"
  | "reference-editor"
  | "album-editor"
  | "pages"
  | "assets";

const openEntry = (item: ContentListItem) => {
  setSelectedEntry(item);
  if (item.kind === "references") {
    setView("reference-editor");
    return;
  }
  if (item.kind === "albums") {
    setView("album-editor");
    return;
  }
  setView("editor");
};
```

`manager/src/pages/AlbumEditor.tsx`

```tsx
import { useEffect, useState } from "react";
import { getContentEntry, saveContentEntry } from "../api";
import type { ContentListItem } from "../types";

export default function AlbumEditor({ selectedEntry }: { selectedEntry: ContentListItem | null }) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [photosJson, setPhotosJson] = useState("[]");

  useEffect(() => {
    if (!selectedEntry || selectedEntry.kind !== "albums") {
      return;
    }

    void getContentEntry("albums", selectedEntry.slug).then((entry) => {
      setSlug(entry.slug);
      setTitle(String(entry.frontmatter.title ?? ""));
      setSummary(String(entry.frontmatter.summary ?? ""));
      setCover(String(entry.frontmatter.cover ?? ""));
      setVisibility(String(entry.frontmatter.visibility ?? "public"));
      setPhotosJson(JSON.stringify(entry.frontmatter.photos ?? [], null, 2));
    });
  }, [selectedEntry]);

  const handleSave = async () => {
    const parsedPhotos = JSON.parse(photosJson) as Array<Record<string, unknown>>;
    await saveContentEntry({
      kind: "albums",
      slug,
      body: "",
      frontmatter: {
        title,
        summary,
        cover,
        visibility,
        photos: parsedPhotos,
      },
    });
  };

  return (
    <main className="page">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Album Editor</p>
            <h1>照片墙相册编辑</h1>
          </div>
          <button className="primary-button" onClick={handleSave} type="button">保存相册</button>
        </div>
        <label className="field"><span>Slug</span><input value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
        <label className="field"><span>标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="field"><span>简介</span><textarea className="meta-area" value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
        <label className="field"><span>封面图</span><input value={cover} onChange={(event) => setCover(event.target.value)} /></label>
        <label className="field"><span>公开状态</span><select value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="public">公开</option><option value="hidden">隐藏</option></select></label>
        <label className="field"><span>图片列表 JSON</span><textarea className="editor-area" value={photosJson} onChange={(event) => setPhotosJson(event.target.value)} /></label>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Rerun the manager tests and build the manager app**

Run: `pnpm vitest run tests/manager-album-editor.test.ts tests/manager-api.test.ts tests/manager-editor.test.ts && pnpm build:manager`

Expected:
- `PASS` for the new album editor import smoke test
- `PASS` for existing manager API contract tests
- `PASS` for the manager production build

- [ ] **Step 5: Commit the manager authoring support**

```bash
git add manager/src/pages/AlbumEditor.tsx manager/src/App.tsx manager/src/types.ts manager/src/pages/ContentList.tsx manager/src/pages/Editor.tsx manager/src/api.ts manager/server/files.ts manager/server/routes/content.ts tests/manager-album-editor.test.ts tests/manager-api.test.ts
git commit -m "feat: add album authoring to local manager"
```

## Task 5: Polish Search UI, Run Full Verification, And Produce A Local Preview

**Files:**
- Modify: `src/components/chrome/HomeSearchBar.tsx`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/homepage-shell.spec.ts`
- Modify: `docs/authoring.md`

- [ ] **Step 1: Add the final failing assertions for the refined search shell**

```ts
test("homepage search keeps the refined glass shell and can surface photo wall albums", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-home-search]")).toBeVisible();
  await page.locator("[data-home-search] input").fill("素材墙");
  await expect(page.locator(".home-search-panel")).toBeVisible();
  await expect(page.locator(".home-search-result")).toContainText("照片墙");
});
```

- [ ] **Step 2: Run the homepage/browser checks before the final UI polish**

Run: `pnpm test:e2e tests/homepage-shell.spec.ts tests/floating-player.spec.ts tests/photowall.spec.ts`

Expected:
- `FAIL` until the search panel styling and album-result text are fully wired

- [ ] **Step 3: Apply the final UI polish and docs update**

`src/components/chrome/HomeSearchBar.tsx`

```tsx
<div className="home-search-shell" data-home-search ref={containerRef}>
  <label className="home-search-field">
    <span className="home-search-icon" aria-hidden="true">
      <svg fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.8-3.8" />
      </svg>
    </span>
    <input
      autoComplete="off"
      className="home-search-input"
      onChange={(event) => {
        setQuery(event.target.value);
        setOpen(true);
      }}
      placeholder={placeholder}
      type="text"
      value={query}
    />
  </label>
  {open && query.trim() ? (
    <div className="home-search-panel">
      {results.map((item) => (
        <a className="home-search-result" href={item.href} key={item.href}>
          <div className="home-search-result__head">
            <strong>{item.title}</strong>
            <span>{item.section}</span>
          </div>
          <p>{item.summary}</p>
        </a>
      ))}
    </div>
  ) : null}
</div>
```

`docs/authoring.md`

```md
## 照片墙

- 新建相册请使用本地 manager 的“内容 -> 相册 -> 打开编辑”
- `visibility: public` 的相册会出现在 `/photowall/`
- `draft: true` 或 `visibility: hidden` 的相册只保留在本地维护流中
- 首页搜索会收录公开相册标题与摘要，但不会显示单张图片命中结果
```

- [ ] **Step 4: Run the full verification stack and start a local preview**

Run:

```bash
pnpm vitest run tests/album-schema.test.ts tests/home-shell.test.ts tests/public-content-filter.test.ts tests/content-schema.test.ts tests/manager-album-editor.test.ts tests/manager-api.test.ts tests/manager-editor.test.ts
pnpm test:e2e tests/homepage-shell.spec.ts tests/floating-player.spec.ts tests/photowall.spec.ts
pnpm build
pnpm build:manager
pnpm preview --host 0.0.0.0
```

Expected:
- all targeted Vitest suites `PASS`
- all targeted Playwright suites `PASS`
- `astro build` completes successfully
- `vite build` for the manager completes successfully
- local preview starts and prints a reachable preview URL

- [ ] **Step 5: Commit the final polish**

```bash
git add src/components/chrome/HomeSearchBar.tsx src/pages/index.astro src/styles/global.css tests/homepage-shell.spec.ts docs/authoring.md
git commit -m "feat: polish homepage search and photowall preview"
```

## Parallel Execution Notes

Use the following ownership split during execution so workers do not fight over the same files:

- Worker A: Task 1 only
  Write scope: `src/layouts/BaseLayout.astro`, `src/components/music/*`, `src/components/home/SplashScreen.tsx`, `src/components/chrome/ClickEffect.tsx`, `tests/floating-player.spec.ts`, `tests/homepage-shell.spec.ts`
- Worker B: Task 2 and Task 3 core content/page work
  Write scope: `packages/content-core/src/schemas.ts`, `src/content/config.ts`, `src/content/albums/*`, `src/lib/public-content.ts`, `src/lib/home-shell.ts`, `src/pages/photowall/index.astro`, `src/components/photowall/PhotoWallClient.tsx`, `tests/album-schema.test.ts`, `tests/photowall.spec.ts`, `tests/public-content-filter.test.ts`
- Worker C: Task 4 manager work
  Write scope: `manager/src/*`, `manager/server/*`, `tests/manager-album-editor.test.ts`, `tests/manager-api.test.ts`
- Main agent: Task 5 integration and any `src/styles/global.css` merge work
  Write scope: `src/styles/global.css`, `src/components/chrome/HomeSearchBar.tsx`, `docs/authoring.md`, final verification commands, preview startup

## Self-Review

### Spec Coverage Check

- Persistent global music runtime: Task 1
- Floating player on inner pages: Task 1
- Splash/loading animation: Task 1
- Click effect: Task 1
- New `albums` content model: Task 2
- Homepage search includes photo wall albums: Task 2 and Task 5
- Public `/photowall/` route with album overview/detail/lightbox: Task 3
- Local manager album authoring: Task 4
- Local preview verification: Task 5

### Placeholder Scan

This plan intentionally avoids `TODO`, `TBD`, “implement later”, and “similar to previous task” placeholders. Each task names concrete files, tests, commands, and the minimum code shape that must exist.

### Type Consistency Check

- The new content kind is always named `albums`
- Album visibility is always `public | hidden`
- Homepage search section label is always `照片墙`
- The public photo wall route is always `/photowall/`
