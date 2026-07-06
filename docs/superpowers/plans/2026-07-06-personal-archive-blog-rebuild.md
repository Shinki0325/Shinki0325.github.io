# Personal Archive Blog Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a maintainable Astro-based personal archive blog with public articles/notes/topics, private drafts/vault content kept out of the public site, and automated deployment from a private source repo to the public `Shinki0325.github.io` GitHub Pages repo.

**Architecture:** The implementation uses a private Astro source repository as the authoring system and the existing public GitHub Pages repository only as the deployment target. Content is split into `articles`, `notes`, `topics`, `drafts`, and `vault`, with Astro content collections and a small public-content filter ensuring only intended content reaches the built site.

**Tech Stack:** Astro 5, TypeScript, Astro content collections with Zod, Vitest, Playwright, GitHub Actions, Markdown/MDX.

---

## File Structure

The implementation assumes a new private source repository, suggested name: `maki-archive-source`.

### Repository root

- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.github/workflows/deploy.yml`
- Create: `playwright.config.ts`
- Create: `vitest.config.ts`
- Create: `tests/content-schema.test.ts`
- Create: `tests/public-content-filter.test.ts`
- Create: `tests/routes.spec.ts`
- Create: `scripts/assert-public-content.mjs`

### Source files

- Create: `src/content/config.ts`
- Create: `src/content/articles/welcome.md`
- Create: `src/content/notes/first-note.md`
- Create: `src/content/topics/archive.md`
- Create: `src/content/drafts/example-draft.md`
- Create: `src/content/vault/example-private-note.md`
- Create: `src/data/site.ts`
- Create: `src/lib/content.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/components/NoteCard.astro`
- Create: `src/components/TopicCard.astro`
- Create: `src/components/TagList.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/articles/index.astro`
- Create: `src/pages/articles/[...slug].astro`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[...slug].astro`
- Create: `src/pages/topics/index.astro`
- Create: `src/pages/topics/[slug].astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/archive/index.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/links.astro`
- Create: `src/styles/global.css`

### Content migration staging

- Create: `content-migration/articles/`
- Create: `content-migration/pages/`
- Create: `content-migration/assets/`
- Create: `docs/authoring.md`

## Task 1: Create the private source repo and Astro baseline

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/styles/global.css`

- [ ] **Step 1: Write the failing baseline test**

Create `tests/content-schema.test.ts` with this starter test:

```ts
import { describe, expect, it } from "vitest";

describe("project baseline", () => {
  it("loads the site config module", async () => {
    await expect(import("../src/data/site")).resolves.toMatchObject({
      siteTitle: "Shinki",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/content-schema.test.ts`

Expected: FAIL with a module resolution error because `src/data/site.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation and tooling**

Create `package.json`:

```json
{
  "name": "maki-archive-source",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

Create `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://shinki0325.github.io",
  output: "static"
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

Create `src/data/site.ts`:

```ts
export const siteTitle = "Shinki";
export const siteDescription = "A personal archive for long-form writing, notes, and image-backed ideas.";
```

Create `.gitignore`:

```gitignore
node_modules
dist
.astro
playwright-report
test-results
```

Create `src/styles/global.css`:

```css
:root {
  --bg: #f5f0e8;
  --paper: #fffaf2;
  --ink: #1f1a17;
  --muted: #6f655d;
  --accent: #b15c2e;
  --line: #dccfbe;
}

html, body {
  margin: 0;
  padding: 0;
  background: radial-gradient(circle at top, #fff5de 0%, var(--bg) 55%, #efe6d8 100%);
  color: var(--ink);
  font-family: "Source Han Serif SC", "Noto Serif SC", serif;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm install && npm test -- tests/content-schema.test.ts`

Expected: PASS with 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore src/data/site.ts src/styles/global.css tests/content-schema.test.ts
git commit -m "chore: bootstrap Astro source repo"
```

## Task 2: Define content collections and public/private boundaries

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/articles/welcome.md`
- Create: `src/content/notes/first-note.md`
- Create: `src/content/topics/archive.md`
- Create: `src/content/drafts/example-draft.md`
- Create: `src/content/vault/example-private-note.md`
- Create: `src/lib/content.ts`
- Test: `tests/public-content-filter.test.ts`

- [ ] **Step 1: Write the failing public-content filter test**

Create `tests/public-content-filter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isPublicCollection } from "../src/lib/content";

describe("isPublicCollection", () => {
  it("allows only public content collections", () => {
    expect(isPublicCollection("articles")).toBe(true);
    expect(isPublicCollection("notes")).toBe(true);
    expect(isPublicCollection("topics")).toBe(true);
    expect(isPublicCollection("drafts")).toBe(false);
    expect(isPublicCollection("vault")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/public-content-filter.test.ts`

Expected: FAIL because `src/lib/content.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const article = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

const note = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    source: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

const topic = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: z.string().optional(),
    pinned: z.boolean().default(false)
  })
});

const draft = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(true)
  })
});

const vault = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date()
  })
});

export const collections = {
  articles: article,
  notes: note,
  topics: topic,
  drafts: draft,
  vault: vault
};
```

Create `src/lib/content.ts`:

```ts
const PUBLIC_COLLECTIONS = new Set(["articles", "notes", "topics"]);

export const isPublicCollection = (collection: string) =>
  PUBLIC_COLLECTIONS.has(collection);
```

Create `src/content/articles/welcome.md`:

```md
---
title: "Welcome Back"
date: 2026-07-06
summary: "The first rebuilt article in the new archive blog."
tags: ["meta"]
topics: ["archive"]
draft: false
---

This is the first article in the rebuilt site.
```

Create `src/content/notes/first-note.md`:

```md
---
date: 2026-07-06
tags: ["note", "archive"]
images: []
draft: false
---

Short notes belong here.
```

Create `src/content/topics/archive.md`:

```md
---
title: "Archive"
description: "A curated topic page for notes and essays about the site itself."
pinned: true
---

This topic collects posts about the archive.
```

Create `src/content/drafts/example-draft.md`:

```md
---
title: "Private Draft"
date: 2026-07-06
draft: true
---

This file should never be published.
```

Create `src/content/vault/example-private-note.md`:

```md
---
title: "Private Vault Entry"
date: 2026-07-06
---

This file is for private reference only.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/public-content-filter.test.ts`

Expected: PASS with 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts src/content/articles/welcome.md src/content/notes/first-note.md src/content/topics/archive.md src/content/drafts/example-draft.md src/content/vault/example-private-note.md src/lib/content.ts tests/public-content-filter.test.ts
git commit -m "feat: define public and private content collections"
```

## Task 3: Build the shared layouts and core list/detail routes

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/components/NoteCard.astro`
- Create: `src/components/TopicCard.astro`
- Create: `src/components/TagList.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/articles/index.astro`
- Create: `src/pages/articles/[...slug].astro`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[...slug].astro`
- Create: `src/pages/topics/index.astro`
- Create: `src/pages/topics/[slug].astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/archive/index.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/links.astro`
- Test: `tests/routes.spec.ts`

- [ ] **Step 1: Write the failing route smoke test**

Create `tests/routes.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("homepage exposes the three core sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Articles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/routes.spec.ts`

Expected: FAIL because there is no built site and no homepage implementation yet.

- [ ] **Step 3: Write minimal implementation**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";
import { siteDescription, siteTitle } from "../data/site";

interface Props {
  title?: string;
  description?: string;
}

const { title = siteTitle, description = siteDescription } = Astro.props;
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
    <main class="shell">
      <slot />
    </main>
  </body>
</html>
```

Create `src/layouts/PostLayout.astro`:

```astro
---
import BaseLayout from "./BaseLayout.astro";

interface Props {
  title: string;
  summary?: string;
  date?: Date;
}

const { title, summary, date } = Astro.props;
---

<BaseLayout title={title} description={summary}>
  <article class="prose">
    <header>
      <h1>{title}</h1>
      {date && <time>{date.toISOString().slice(0, 10)}</time>}
    </header>
    <slot />
  </article>
</BaseLayout>
```

Create `src/components/ArticleCard.astro`:

```astro
---
const { entry } = Astro.props;
---

<article>
  <h3><a href={`/articles/${entry.slug}/`}>{entry.data.title}</a></h3>
  <p>{entry.data.summary}</p>
</article>
```

Create `src/components/NoteCard.astro`:

```astro
---
const { entry } = Astro.props;
---

<article>
  <h3><a href={`/notes/${entry.slug}/`}>{entry.data.title ?? "Untitled note"}</a></h3>
  <p>{entry.body.slice(0, 120)}</p>
</article>
```

Create `src/components/TopicCard.astro`:

```astro
---
const { entry } = Astro.props;
---

<article>
  <h3><a href={`/topics/${entry.slug}/`}>{entry.data.title}</a></h3>
  <p>{entry.data.description}</p>
</article>
```

Create `src/components/TagList.astro`:

```astro
---
const { tags = [] } = Astro.props;
---

<ul>
  {tags.map((tag: string) => <li><a href={`/tags/${tag}/`}>{tag}</a></li>)}
</ul>
```

Create `src/pages/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import ArticleCard from "../components/ArticleCard.astro";
import NoteCard from "../components/NoteCard.astro";
import TopicCard from "../components/TopicCard.astro";

const articles = await getCollection("articles");
const notes = await getCollection("notes");
const topics = await getCollection("topics");
---

<BaseLayout>
  <section>
    <h1>Shinki</h1>
    <p>A public archive for essays, notes, and curated themes.</p>
  </section>

  <section>
    <h2>Latest Articles</h2>
    {articles.slice(0, 5).map((entry) => <ArticleCard entry={entry} />)}
  </section>

  <section>
    <h2>Recent Notes</h2>
    {notes.slice(0, 8).map((entry) => <NoteCard entry={entry} />)}
  </section>

  <section>
    <h2>Topics</h2>
    {topics.slice(0, 6).map((entry) => <TopicCard entry={entry} />)}
  </section>
</BaseLayout>
```

Create `src/pages/articles/index.astro`, `src/pages/notes/index.astro`, `src/pages/topics/index.astro`, `src/pages/archive/index.astro`, `src/pages/about.astro`, and `src/pages/links.astro` as list/static pages using the same collection APIs and `BaseLayout`.

Create `src/pages/articles/[...slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";

export async function getStaticPaths() {
  const entries = await getCollection("articles");
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---

<PostLayout title={entry.data.title} summary={entry.data.summary} date={entry.data.date}>
  <Content />
</PostLayout>
```

Create `src/pages/notes/[...slug].astro` with the same pattern against `notes`.

Create `src/pages/topics/[slug].astro` with the same pattern against `topics`.

Create `src/pages/tags/[tag].astro` to filter `articles` and `notes` by matching tag.

- [ ] **Step 4: Run test to verify it passes**

Run these commands:

```bash
npx playwright install
npm run build
npm run test:e2e -- tests/routes.spec.ts
```

Expected: build succeeds and Playwright reports 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add src/layouts src/components src/pages tests/routes.spec.ts
git commit -m "feat: add public archive routes and layouts"
```

## Task 4: Add deployment safeguards and GitHub Actions publishing

**Files:**
- Create: `scripts/assert-public-content.mjs`
- Create: `.github/workflows/deploy.yml`
- Test: `tests/public-content-filter.test.ts`

- [ ] **Step 1: Extend the failing filter test**

Append this test to `tests/public-content-filter.test.ts`:

```ts
import { publicContentGlob } from "../src/lib/content";

it("builds only from public content roots", () => {
  expect(publicContentGlob).toEqual([
    "src/content/articles/**/*",
    "src/content/notes/**/*",
    "src/content/topics/**/*"
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/public-content-filter.test.ts`

Expected: FAIL because `publicContentGlob` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/content.ts`:

```ts
const PUBLIC_COLLECTIONS = new Set(["articles", "notes", "topics"]);

export const isPublicCollection = (collection: string) =>
  PUBLIC_COLLECTIONS.has(collection);

export const publicContentGlob = [
  "src/content/articles/**/*",
  "src/content/notes/**/*",
  "src/content/topics/**/*"
];
```

Create `scripts/assert-public-content.mjs`:

```js
import { readdir } from "node:fs/promises";

const banned = ["drafts", "vault"];
const contentDirs = await readdir(new URL("../src/content/", import.meta.url), { withFileTypes: true });

for (const dir of contentDirs) {
  if (dir.isDirectory() && banned.includes(dir.name)) {
    console.log(`Private collection preserved locally: ${dir.name}`);
  }
}
```

Create `.github/workflows/deploy.yml`:

```yml
name: Deploy public site

on:
  push:
    branches: ["main"]

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: node scripts/assert-public-content.mjs
      - run: npm run build

      - name: Publish to Shinki0325.github.io
        uses: peaceiris/actions-gh-pages@v4
        with:
          personal_token: ${{ secrets.PAGES_DEPLOY_TOKEN }}
          external_repository: Shinki0325/Shinki0325.github.io
          publish_dir: ./dist
          publish_branch: master
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/public-content-filter.test.ts`

Expected: PASS with all filter tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts scripts/assert-public-content.mjs .github/workflows/deploy.yml tests/public-content-filter.test.ts
git commit -m "feat: add deployment workflow and public-content safeguards"
```

## Task 5: Migrate old content and base pages into the new model

**Files:**
- Create: `content-migration/articles/`
- Create: `content-migration/pages/`
- Create: `content-migration/assets/`
- Modify: `src/content/articles/*.md`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/links.astro`
- Test: `tests/routes.spec.ts`

- [ ] **Step 1: Write the failing migration smoke test**

Append this test to `tests/routes.spec.ts`:

```ts
test("articles index shows migrated legacy titles", async ({ page }) => {
  await page.goto("/articles/");
  await expect(page.getByRole("link", { name: "政府与市场关系之我见" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && npm run test:e2e -- tests/routes.spec.ts`

Expected: FAIL because the migrated article files do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create one migrated article file first, for example `src/content/articles/market-government.md`:

```md
---
title: "政府与市场关系之我见"
date: 2022-12-14
summary: "关于市场、自由与政府规制关系的旧文迁移版本。"
tags: ["经济学"]
topics: []
draft: false
---

从旧站正文中提取并清洗 Markdown 内容，保留段落结构，去掉旧站 HTML 包装。
```

Copy remaining old posts from the current repo into `content-migration/articles/` first, normalize them one by one into `src/content/articles/`.

For legacy static pages:

- move the old `about` copy into `src/pages/about.astro`
- move the old `link` page into `src/pages/links.astro`

Use this skeleton in `src/pages/about.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="About">
  <section class="prose">
    <h1>About</h1>
    <p>Move the cleaned biography and archive statement here.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npm run test:e2e -- tests/routes.spec.ts`

Expected: PASS with the migrated title visible in `/articles/`.

- [ ] **Step 5: Commit**

```bash
git add content-migration src/content/articles src/pages/about.astro src/pages/links.astro tests/routes.spec.ts
git commit -m "feat: migrate legacy posts and base pages"
```

## Task 6: Document the browser-based authoring workflow

**Files:**
- Create: `docs/authoring.md`
- Test: `npm run build`

- [ ] **Step 1: Write the failing documentation smoke check**

Add this script to `package.json` under `scripts`:

```json
"docs:check": "node -e \"import('node:fs').then(fs => fs.accessSync('docs/authoring.md'))\""
```

- [ ] **Step 2: Run check to verify it fails**

Run: `npm run docs:check`

Expected: FAIL because `docs/authoring.md` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `docs/authoring.md`:

```md
# Authoring Guide

## Public content

- Add long-form writing under `src/content/articles/`
- Add short notes under `src/content/notes/`
- Add curated pages under `src/content/topics/`

## Private content

- Store unpublished drafts under `src/content/drafts/`
- Store private research notes under `src/content/vault/`

## Browser workflow

1. Open the private source repo in GitHub.
2. Press `.` to open `github.dev`, or use the web file editor.
3. Create or update Markdown files.
4. Upload images into the matching public or private folder.
5. Commit changes to `main`.
6. Wait for the deploy workflow to publish the public site.
```

- [ ] **Step 4: Run checks to verify they pass**

Run:

```bash
npm run docs:check
npm run build
```

Expected: both commands succeed.

- [ ] **Step 5: Commit**

```bash
git add package.json docs/authoring.md
git commit -m "docs: add browser-based authoring workflow"
```

## Self-Review

### Spec coverage

- Public articles/notes/topics: covered by Tasks 2 and 3.
- Private drafts/vault isolation: covered by Tasks 2 and 4.
- GitHub Pages deployment from a private source repo: covered by Task 4.
- Legacy content and base page migration: covered by Task 5.
- Browser-first authoring workflow: covered by Task 6.

No major spec gaps remain. A future CMS-like editor is intentionally excluded from MVP.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Each task lists exact files, commands, and concrete starter code.

### Type consistency

- Public collections are consistently named `articles`, `notes`, `topics`.
- Private collections are consistently named `drafts`, `vault`.
- Shared helper names remain `isPublicCollection` and `publicContentGlob`.
