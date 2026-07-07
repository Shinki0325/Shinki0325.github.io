# Reference Wiki Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-phase personal archive that supports public video scripts, public/private reference pages, wiki-style internal links, automatic backlinks, and a local web manager while keeping Astro static deployment to GitHub Pages.

**Architecture:** Keep the public site in the existing Astro app, introduce a shared TypeScript content layer for schemas/link parsing/validation, and add a `manager/` sub-app that runs a local React UI plus Node API for file access, validation, builds, and git actions. Phase 1 favors file-backed content, deterministic build-time validation, and focused UI flows over full CMS flexibility.

**Tech Stack:** Astro 5, TypeScript, Zod, Vitest, Playwright, pnpm workspace, Vite + React + Express for `manager/`, `gray-matter`, `remark`, `remark-gfm`, `unist-util-visit`.

---

## File Structure Map

### Existing files to modify

- `pnpm-workspace.yaml`
  Add explicit workspace package globs for the root site, `manager`, and `packages/*`.
- `package.json`
  Add workspace-aware scripts for root validation, manager dev/build, and backlink checks.
- `src/content/config.ts`
  Extend Astro collections with `references` and richer `articles` frontmatter.
- `src/lib/content.ts`
  Expand public collection helpers for `references` and script/article typing.
- `src/lib/public-content.ts`
  Add published reference retrieval and shared listing helpers.
- `src/layouts/PostLayout.astro`
  Add support for metadata panels and backlink sections.
- `src/pages/index.astro`
  Replace the old sections with config-driven blocks that can show scripts and references.
- `src/pages/articles/[...slug].astro`
  Render parsed wiki links and script-specific metadata.
- `tests/content-schema.test.ts`
  Add collection schema coverage for `references` and article `type`.
- `tests/public-content-filter.test.ts`
  Extend public filtering expectations to include `references`.
- `tests/routes.spec.ts`
  Cover reference pages, backlinks, and private-link rejection behavior.
- `scripts/assert-public-content.mjs`
  Upgrade the build assertion to validate internal links and private reference leakage.

### New root-site files

- `src/content/references/example-public-reference.md`
  Fixture for a public `source` entry.
- `src/content/references/example-topic-reference.md`
  Fixture for a public `topic` entry that links to another reference.
- `src/components/ReferenceCard.astro`
  Card component for reference index and home blocks.
- `src/components/BacklinkList.astro`
  Shared backlink rendering component.
- `src/components/ReferenceMeta.astro`
  Structured metadata card for `references` entries.
- `src/config/pages/home.json`
  Config-driven homepage sections.
- `src/config/pages/references.json`
  Config for the reference hub page.
- `src/lib/content-links.ts`
  Parse `[[title]]` and `[[title|label]]` into normalized link tokens.
- `src/lib/reference-index.ts`
  Build slug/title/alias lookup tables and backlink maps.
- `src/lib/home-config.ts`
  Validate and load homepage block JSON.
- `src/pages/references/index.astro`
  Public reference hub route.
- `src/pages/references/[...slug].astro`
  Public reference detail route.

### New shared package files

- `packages/content-core/package.json`
  Shared package manifest.
- `packages/content-core/src/schemas.ts`
  Zod schemas for article/reference/page config frontmatter.
- `packages/content-core/src/wiki-links.ts`
  Shared wiki link tokenizer/parser.
- `packages/content-core/src/reference-graph.ts`
  Shared backlink/index generation.
- `packages/content-core/src/validation.ts`
  Shared public/private link validation logic.
- `packages/content-core/src/index.ts`
  Barrel exports for site and manager reuse.
- `tests/wiki-links.test.ts`
  Root-level test for parser behavior.
- `tests/reference-graph.test.ts`
  Root-level test for backlink and visibility validation behavior.

### New manager files

- `manager/package.json`
  Manager scripts and dependencies.
- `manager/tsconfig.json`
  Manager TypeScript config.
- `manager/vite.config.ts`
  Frontend dev/build config.
- `manager/server/index.ts`
  Express server that exposes local-only APIs.
- `manager/server/files.ts`
  File CRUD helpers for Markdown, JSON, and assets.
- `manager/server/git.ts`
  Build, status, commit, and push helpers.
- `manager/server/routes/content.ts`
  Content list/read/write endpoints.
- `manager/server/routes/assets.ts`
  Asset copy/list endpoints.
- `manager/server/routes/system.ts`
  Validation/build/git endpoints.
- `manager/src/main.tsx`
  React bootstrap.
- `manager/src/App.tsx`
  Shell, navigation, and route layout.
- `manager/src/api.ts`
  Client fetch helpers.
- `manager/src/types.ts`
  Shared view-model types for the UI.
- `manager/src/pages/Dashboard.tsx`
  Dashboard page.
- `manager/src/pages/ContentList.tsx`
  List/filter page for articles, references, drafts, vault.
- `manager/src/pages/Editor.tsx`
  Generic Markdown editor for articles and drafts.
- `manager/src/pages/ReferenceEditor.tsx`
  Reference editor with structured metadata form.
- `manager/src/pages/PageBuilder.tsx`
  Home/reference page config editor.
- `manager/src/pages/Assets.tsx`
  Asset manager page.
- `manager/src/components/LinkInsertDialog.tsx`
  Search and insert wiki/Markdown link helper.
- `manager/src/components/MarkdownPreview.tsx`
  Local preview component with parsed wiki links.

### New docs

- `docs/authoring.md`
  Update the authoring guide to explain `references`, `type: script`, and manager usage.

---

### Task 1: Convert The Workspace Into A Shared Site + Manager Monorepo

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Create: `packages/content-core/package.json`
- Create: `packages/content-core/src/index.ts`
- Create: `manager/package.json`
- Create: `manager/tsconfig.json`
- Create: `manager/vite.config.ts`
- Test: `tests/playwright-config.test.ts`

- [ ] **Step 1: Write the failing workspace test expectations**

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("workspace layout", () => {
  it("declares manager and shared packages in pnpm workspace", () => {
    const workspace = fs.readFileSync("pnpm-workspace.yaml", "utf8");
    expect(workspace).toContain("packages:");
    expect(workspace).toContain("- manager");
    expect(workspace).toContain("- packages/*");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/playwright-config.test.ts -t "declares manager and shared packages in pnpm workspace"`

Expected: FAIL because `pnpm-workspace.yaml` currently has no `packages:` section.

- [ ] **Step 3: Add the workspace packages and root scripts**

```yaml
# pnpm-workspace.yaml
packages:
  - .
  - manager
  - packages/*

allowBuilds:
  esbuild: true
  sharp: true
```

```json
// package.json
{
  "scripts": {
    "dev": "astro dev",
    "dev:manager": "pnpm --filter ./manager dev",
    "build": "astro build",
    "build:manager": "pnpm --filter ./manager build",
    "check:links": "vitest run tests/wiki-links.test.ts tests/reference-graph.test.ts",
    "validate:public": "node scripts/assert-public-content.mjs"
  }
}
```

```json
// packages/content-core/package.json
{
  "name": "@maki/content-core",
  "private": true,
  "type": "module",
  "exports": "./src/index.ts"
}
```

```ts
// packages/content-core/src/index.ts
export * from "./schemas";
export * from "./wiki-links";
export * from "./reference-graph";
export * from "./validation";
```

```json
// manager/package.json
{
  "name": "@maki/manager",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "server": "tsx server/index.ts"
  }
}
```

- [ ] **Step 4: Run the workspace test and config tests**

Run: `pnpm vitest run tests/playwright-config.test.ts`

Expected: PASS for the new workspace assertion and no regressions in existing config checks.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json packages/content-core manager tests/playwright-config.test.ts
git commit -m "chore: add shared workspace layout for site and manager"
```

### Task 2: Add Shared Schemas For Articles, References, Drafts, And Page Config

**Files:**
- Create: `packages/content-core/src/schemas.ts`
- Modify: `src/content/config.ts`
- Modify: `tests/content-schema.test.ts`
- Modify: `tests/public-content-filter.test.ts`

- [ ] **Step 1: Write the failing schema tests**

```ts
import { describe, expect, it } from "vitest";

describe("content schema", () => {
  it("loads the Astro collections with references and article types", async () => {
    const { collections } = await import("../src/content/config");
    expect(collections).toHaveProperty("references");
    expect(collections).toHaveProperty("articles");
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { isPublicCollection, publicContentGlob } from "../src/lib/content";

describe("public content helpers", () => {
  it("treats references as public content", () => {
    expect(isPublicCollection("references")).toBe(true);
    expect(publicContentGlob).toContain("src/content/references/**/*");
  });
});
```

- [ ] **Step 2: Run the schema tests to verify they fail**

Run: `pnpm vitest run tests/content-schema.test.ts tests/public-content-filter.test.ts`

Expected: FAIL because `references` is not defined and the public glob list does not include it.

- [ ] **Step 3: Implement shared schemas and wire Astro collections**

```ts
// packages/content-core/src/schemas.ts
import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  type: z.enum(["article", "script"]).default("article"),
  tags: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  template: z.string().optional()
});

export const referenceSchema = z.object({
  title: z.string(),
  kind: z.enum(["source", "topic"]),
  visibility: z.enum(["public", "private"]).default("public"),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  sourceType: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  publisher: z.string().optional(),
  quote: z.string().optional(),
  note: z.string().optional(),
  intro: z.string().optional(),
  relatedRefs: z.array(z.string()).default([]),
  relatedScripts: z.array(z.string()).default([])
});
```

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { articleSchema, referenceSchema } from "@maki/content-core";

const article = defineCollection({ schema: articleSchema });
const reference = defineCollection({ schema: referenceSchema });

const draft = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["article", "reference", "note", "vault"]).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(true)
  })
});

export const collections = {
  articles: article,
  references: reference,
  notes: note,
  topics: topic,
  drafts: draft,
  vault: vault
};
```

```ts
// src/lib/content.ts
const PUBLIC_COLLECTIONS = new Set(["articles", "notes", "topics", "references"]);

export const publicContentGlob = [
  "src/content/articles/**/*",
  "src/content/notes/**/*",
  "src/content/topics/**/*",
  "src/content/references/**/*"
];
```

- [ ] **Step 4: Run the schema and helper tests**

Run: `pnpm vitest run tests/content-schema.test.ts tests/public-content-filter.test.ts`

Expected: PASS with `references` treated as a public collection and no regressions to draft handling.

- [ ] **Step 5: Commit**

```bash
git add packages/content-core/src/schemas.ts src/content/config.ts src/lib/content.ts tests/content-schema.test.ts tests/public-content-filter.test.ts
git commit -m "feat: add article and reference content schemas"
```

### Task 3: Build Wiki Link Parsing, Reference Indexing, And Visibility Validation

**Files:**
- Create: `packages/content-core/src/wiki-links.ts`
- Create: `packages/content-core/src/reference-graph.ts`
- Create: `packages/content-core/src/validation.ts`
- Create: `src/lib/content-links.ts`
- Create: `src/lib/reference-index.ts`
- Create: `tests/wiki-links.test.ts`
- Create: `tests/reference-graph.test.ts`
- Modify: `scripts/assert-public-content.mjs`

- [ ] **Step 1: Write failing parser and graph tests**

```ts
import { describe, expect, it } from "vitest";
import { parseWikiLinks } from "@maki/content-core";

describe("wiki link parser", () => {
  it("parses simple and aliased wiki links", () => {
    expect(parseWikiLinks("A [[Ref A]] and [[Ref B|shown]]")).toEqual([
      { raw: "[[Ref A]]", target: "Ref A", label: "Ref A" },
      { raw: "[[Ref B|shown]]", target: "Ref B", label: "shown" }
    ]);
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { buildReferenceGraph, validatePublicLinks } from "@maki/content-core";

describe("reference graph", () => {
  it("reports backlinks and rejects public-to-private links", () => {
    const graph = buildReferenceGraph([
      { slug: "ref-a", title: "Ref A", aliases: [], visibility: "public", body: "" },
      { slug: "ref-private", title: "Private Ref", aliases: [], visibility: "private", body: "" }
    ], [
      { slug: "video-script", visibility: "public", body: "[[Ref A]] [[Private Ref]]" }
    ]);

    expect(graph.backlinks["ref-a"]).toContain("video-script");
    expect(validatePublicLinks(graph).errors).toContain(
      "Public entry video-script links to private reference Private Ref"
    );
  });
});
```

- [ ] **Step 2: Run the parser and graph tests to verify they fail**

Run: `pnpm vitest run tests/wiki-links.test.ts tests/reference-graph.test.ts`

Expected: FAIL because the shared parser and graph helpers do not exist yet.

- [ ] **Step 3: Implement the parser, graph, and validation helpers**

```ts
// packages/content-core/src/wiki-links.ts
const WIKI_LINK_RE = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

export const parseWikiLinks = (source: string) =>
  [...source.matchAll(WIKI_LINK_RE)].map((match) => ({
    raw: match[0],
    target: match[1].trim(),
    label: (match[3] ?? match[1]).trim()
  }));
```

```ts
// packages/content-core/src/reference-graph.ts
import { parseWikiLinks } from "./wiki-links";

export const buildReferenceGraph = (references, entries) => {
  const titleMap = new Map();
  const backlinks = {};

  for (const ref of references) {
    titleMap.set(ref.title, ref.slug);
    for (const alias of ref.aliases) titleMap.set(alias, ref.slug);
    backlinks[ref.slug] = [];
  }

  const links = entries.flatMap((entry) =>
    parseWikiLinks(entry.body).map((link) => ({ entry, link, targetSlug: titleMap.get(link.target) }))
  );

  for (const item of links) {
    if (item.targetSlug) backlinks[item.targetSlug].push(item.entry.slug);
  }

  return { titleMap, backlinks, links, references };
};
```

```ts
// packages/content-core/src/validation.ts
export const validatePublicLinks = (graph) => {
  const errors = [];

  for (const item of graph.links) {
    const target = graph.references.find((ref) => ref.slug === item.targetSlug);
    if (!item.targetSlug) {
      errors.push(`Broken internal link in ${item.entry.slug}: ${item.link.target}`);
      continue;
    }
    if (item.entry.visibility === "public" && target?.visibility === "private") {
      errors.push(`Public entry ${item.entry.slug} links to private reference ${target.title}`);
    }
  }

  return { errors };
};
```

```js
// scripts/assert-public-content.mjs
import { buildReferenceGraph, validatePublicLinks } from "@maki/content-core";

const result = validatePublicLinks(graph);
if (result.errors.length) {
  console.error(result.errors.join("\n"));
  process.exit(1);
}
```

- [ ] **Step 4: Run the parser, graph, and validation tests**

Run: `pnpm vitest run tests/wiki-links.test.ts tests/reference-graph.test.ts`

Expected: PASS, and `pnpm validate:public` remains green on the sample content.

- [ ] **Step 5: Commit**

```bash
git add packages/content-core/src/wiki-links.ts packages/content-core/src/reference-graph.ts packages/content-core/src/validation.ts src/lib/content-links.ts src/lib/reference-index.ts tests/wiki-links.test.ts tests/reference-graph.test.ts scripts/assert-public-content.mjs
git commit -m "feat: add wiki link parsing and reference validation"
```

### Task 4: Add Public Reference Fixtures, Routes, Cards, And Backlink Rendering

**Files:**
- Create: `src/content/references/example-public-reference.md`
- Create: `src/content/references/example-topic-reference.md`
- Create: `src/components/ReferenceCard.astro`
- Create: `src/components/BacklinkList.astro`
- Create: `src/components/ReferenceMeta.astro`
- Create: `src/pages/references/index.astro`
- Create: `src/pages/references/[...slug].astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/lib/public-content.ts`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Write failing route tests for the reference hub and detail pages**

```ts
import { expect, test } from "@playwright/test";

test("reference hub lists public references", async ({ page }) => {
  await page.goto("/references/");
  await expect(page.getByRole("heading", { name: "Reference Library" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Example Public Reference" })).toBeVisible();
});

test("reference detail page shows backlinks", async ({ page }) => {
  await page.goto("/references/example-public-reference/");
  await expect(page.getByText("Referenced By")).toBeVisible();
});
```

- [ ] **Step 2: Run the Playwright route tests to verify they fail**

Run: `pnpm playwright test tests/routes.spec.ts --grep "reference"`

Expected: FAIL with 404s because the routes and fixtures do not exist.

- [ ] **Step 3: Implement reference fixtures, listings, and detail pages**

```md
<!-- src/content/references/example-public-reference.md -->
---
title: Example Public Reference
kind: source
visibility: public
date: 2026-07-07
summary: Example reference used to verify reference routes.
tags: [testing]
topics: [archive]
sourceType: web
sourceTitle: Example Source
sourceUrl: https://example.com
quote: A short citation.
note: Why this source matters.
---

This reference exists so scripts and topic pages can link to it.
```

```ts
// src/lib/public-content.ts
export const getPublishedReferences = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("references"))).filter(
    (entry) => entry.data.visibility === "public"
  );
```

```astro
--- // src/pages/references/[...slug].astro
import { render } from "astro:content";
import { getPublishedReferences } from "../../lib/public-content";
import PostLayout from "../../layouts/PostLayout.astro";
import ReferenceMeta from "../../components/ReferenceMeta.astro";
import BacklinkList from "../../components/BacklinkList.astro";

export async function getStaticPaths() {
  const entries = await getPublishedReferences();
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<PostLayout title={entry.data.title} summary={entry.data.summary} date={entry.data.date}>
  <ReferenceMeta entry={entry} />
  <Content />
  <BacklinkList slug={entry.slug} />
</PostLayout>
```

- [ ] **Step 4: Run route tests plus a static build**

Run: `pnpm playwright test tests/routes.spec.ts --grep "reference"`

Run: `pnpm build`

Expected: PASS for the new hub/detail routes and a successful Astro static build.

- [ ] **Step 5: Commit**

```bash
git add src/content/references src/components/ReferenceCard.astro src/components/BacklinkList.astro src/components/ReferenceMeta.astro src/pages/references src/layouts/PostLayout.astro src/lib/public-content.ts tests/routes.spec.ts
git commit -m "feat: add public reference pages and backlinks"
```

### Task 5: Make The Homepage And Reference Hub Config-Driven

**Files:**
- Create: `src/config/pages/home.json`
- Create: `src/config/pages/references.json`
- Create: `src/lib/home-config.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/references/index.astro`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Write failing route coverage for the config-driven sections**

```ts
test("homepage exposes scripts and references from config blocks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Scripts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reference Library" })).toBeVisible();
});
```

- [ ] **Step 2: Run the homepage route test to verify it fails**

Run: `pnpm playwright test tests/routes.spec.ts --grep "config blocks"`

Expected: FAIL because the homepage still renders the hard-coded legacy sections.

- [ ] **Step 3: Add page config JSON and a typed loader**

```json
// src/config/pages/home.json
{
  "blocks": [
    { "type": "hero", "title": "Maki Archive", "text": "Scripts, notes, and references." },
    { "type": "article-list", "title": "Latest Scripts", "limit": 5, "articleType": "script" },
    { "type": "reference-list", "title": "Reference Library", "limit": 8 }
  ]
}
```

```ts
// src/lib/home-config.ts
import fs from "node:fs/promises";
import { z } from "zod";

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), title: z.string(), text: z.string() }),
  z.object({
    type: z.literal("article-list"),
    title: z.string(),
    limit: z.number().int().positive(),
    articleType: z.enum(["article", "script"]).optional()
  }),
  z.object({ type: z.literal("reference-list"), title: z.string(), limit: z.number().int().positive() })
]);

export const loadHomeConfig = async () =>
  z.object({ blocks: z.array(blockSchema) }).parse(
    JSON.parse(await fs.readFile("src/config/pages/home.json", "utf8"))
  );
```

```astro
--- // src/pages/index.astro
import { loadHomeConfig } from "../lib/home-config";
import { getPublishedArticles, getPublishedReferences } from "../lib/public-content";
const config = await loadHomeConfig();
const articles = await getPublishedArticles();
const references = await getPublishedReferences();
---
```

- [ ] **Step 4: Run route tests and a type check**

Run: `pnpm playwright test tests/routes.spec.ts --grep "config blocks"`

Run: `pnpm check`

Expected: PASS with the homepage rendered from JSON config and Astro type-checking clean.

- [ ] **Step 5: Commit**

```bash
git add src/config/pages/home.json src/config/pages/references.json src/lib/home-config.ts src/pages/index.astro src/pages/references/index.astro tests/routes.spec.ts
git commit -m "feat: add config-driven home and reference hub pages"
```

### Task 6: Scaffold The Local Manager Server And Read-Only Content APIs

**Files:**
- Create: `manager/server/index.ts`
- Create: `manager/server/files.ts`
- Create: `manager/server/routes/content.ts`
- Create: `manager/server/routes/system.ts`
- Create: `manager/src/main.tsx`
- Create: `manager/src/App.tsx`
- Create: `manager/src/api.ts`
- Create: `manager/src/pages/Dashboard.tsx`
- Create: `manager/src/pages/ContentList.tsx`
- Create: `manager/src/types.ts`
- Create: `tests/manager-api.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write a failing API smoke test**

```ts
import { describe, expect, it } from "vitest";

describe("manager api contract", () => {
  it("exports a local content listing handler", async () => {
    const mod = await import("../manager/server/routes/content");
    expect(mod).toHaveProperty("registerContentRoutes");
  });
});
```

- [ ] **Step 2: Run the manager smoke test to verify it fails**

Run: `pnpm vitest run tests/manager-api.test.ts`

Expected: FAIL because the manager server files do not exist.

- [ ] **Step 3: Create the local-only server shell and content listing UI**

```ts
// manager/server/index.ts
import express from "express";
import cors from "cors";
import { registerContentRoutes } from "./routes/content";
import { registerSystemRoutes } from "./routes/system";

const app = express();
app.use(cors({ origin: "http://127.0.0.1:4173" }));
app.use(express.json({ limit: "10mb" }));

registerContentRoutes(app);
registerSystemRoutes(app);

app.listen(4318, "127.0.0.1");
```

```ts
// manager/server/routes/content.ts
import type { Express } from "express";
import { listEntries } from "../files";

export const registerContentRoutes = (app: Express) => {
  app.get("/api/content", async (req, res) => {
    const kind = String(req.query.kind ?? "articles");
    res.json(await listEntries(kind));
  });
};
```

```tsx
// manager/src/pages/ContentList.tsx
import { useEffect, useState } from "react";
import { getContentList } from "../api";

export default function ContentList() {
  const [items, setItems] = useState([]);
  useEffect(() => void getContentList("articles").then(setItems), []);
  return <main><h1>Content</h1><ul>{items.map((item: any) => <li key={item.slug}>{item.title}</li>)}</ul></main>;
}
```

- [ ] **Step 4: Run the manager smoke test and dev boot commands**

Run: `pnpm vitest run tests/manager-api.test.ts`

Run: `pnpm --filter ./manager build`

Expected: PASS for the server export test and a successful Vite build for the manager shell.

- [ ] **Step 5: Commit**

```bash
git add manager package.json tests/manager-api.test.ts
git commit -m "feat: scaffold local manager server and content shell"
```

### Task 7: Add Manager Editing, Link Insertion, And Asset Copy Workflows

**Files:**
- Create: `manager/server/routes/assets.ts`
- Modify: `manager/server/routes/content.ts`
- Create: `manager/src/pages/Editor.tsx`
- Create: `manager/src/pages/ReferenceEditor.tsx`
- Create: `manager/src/pages/PageBuilder.tsx`
- Create: `manager/src/pages/Assets.tsx`
- Create: `manager/src/components/LinkInsertDialog.tsx`
- Create: `manager/src/components/MarkdownPreview.tsx`
- Modify: `manager/src/api.ts`
- Modify: `manager/src/App.tsx`
- Create: `tests/manager-editor.test.ts`

- [ ] **Step 1: Write the failing editor contract tests**

```ts
import { describe, expect, it } from "vitest";

describe("manager editor modules", () => {
  it("exports the link insert dialog and reference editor", async () => {
    await expect(import("../manager/src/components/LinkInsertDialog")).resolves.toBeTruthy();
    await expect(import("../manager/src/pages/ReferenceEditor")).resolves.toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the editor module tests to verify they fail**

Run: `pnpm vitest run tests/manager-editor.test.ts`

Expected: FAIL because the editor components are not implemented.

- [ ] **Step 3: Implement write APIs and focused editor UI pieces**

```ts
// manager/server/routes/content.ts
app.post("/api/content/save", async (req, res) => {
  const { kind, slug, frontmatter, body } = req.body;
  await saveMarkdownEntry({ kind, slug, frontmatter, body });
  res.json({ ok: true });
});
```

```tsx
// manager/src/components/LinkInsertDialog.tsx
export function LinkInsertDialog({ references, onPick }) {
  return (
    <dialog open>
      <input placeholder="Search references" />
      <ul>
        {references.map((ref) => (
          <li key={ref.slug}>
            <button onClick={() => onPick(`[[${ref.title}]]`)}>{ref.title}</button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
```

```tsx
// manager/src/pages/ReferenceEditor.tsx
export default function ReferenceEditor() {
  return (
    <main>
      <h1>Reference Editor</h1>
      <form>
        <input name="title" placeholder="Title" />
        <select name="kind">
          <option value="source">source</option>
          <option value="topic">topic</option>
        </select>
        <textarea name="quote" placeholder="Quote" />
        <textarea name="note" placeholder="Note" />
      </form>
    </main>
  );
}
```

```tsx
// manager/src/pages/PageBuilder.tsx
export default function PageBuilder() {
  return (
    <main>
      <h1>Page Builder</h1>
      <p>Edit home and reference hub JSON blocks.</p>
    </main>
  );
}
```

- [ ] **Step 4: Run the editor tests and manager build**

Run: `pnpm vitest run tests/manager-editor.test.ts`

Run: `pnpm --filter ./manager build`

Expected: PASS, with the dialog/editor modules compiling and the manager bundle building cleanly.

- [ ] **Step 5: Commit**

```bash
git add manager/server/routes/content.ts manager/server/routes/assets.ts manager/src/pages/Editor.tsx manager/src/pages/ReferenceEditor.tsx manager/src/pages/PageBuilder.tsx manager/src/pages/Assets.tsx manager/src/components/LinkInsertDialog.tsx manager/src/components/MarkdownPreview.tsx manager/src/api.ts manager/src/App.tsx tests/manager-editor.test.ts
git commit -m "feat: add manager editors and link insertion flow"
```

### Task 8: Add Build Validation, Git Actions, Docs, And End-To-End Coverage

**Files:**
- Modify: `manager/server/routes/system.ts`
- Modify: `scripts/assert-public-content.mjs`
- Modify: `docs/authoring.md`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Write failing validation and docs tests**

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("authoring docs", () => {
  it("documents references and scripts", () => {
    const doc = fs.readFileSync("docs/authoring.md", "utf8");
    expect(doc).toContain("src/content/references/");
    expect(doc).toContain("type: script");
  });
});
```

- [ ] **Step 2: Run the docs and end-to-end suite to verify gaps remain**

Run: `pnpm vitest run tests/content-schema.test.ts tests/public-content-filter.test.ts tests/wiki-links.test.ts tests/reference-graph.test.ts`

Run: `pnpm playwright test tests/routes.spec.ts`

Expected: At least one FAIL until docs, manager endpoints, and final validation wiring are complete.

- [ ] **Step 3: Finish validation endpoints, git helpers, and docs**

```ts
// manager/server/routes/system.ts
app.post("/api/system/validate", async (_req, res) => {
  const result = await runCommand("pnpm validate:public");
  res.json(result);
});

app.post("/api/system/build", async (_req, res) => {
  const result = await runCommand("pnpm build");
  res.json(result);
});

app.post("/api/system/commit", async (req, res) => {
  const { message } = req.body;
  const result = await runCommand(`git add -A && git commit -m ${JSON.stringify(message)}`);
  res.json(result);
});
```

```md
<!-- docs/authoring.md -->
## Public reference library

- Add reference pages under `src/content/references/`
- Use `kind: source` for single-source entries
- Use `kind: topic` for synthesis pages
- Use `type: script` in `src/content/articles/` for video scripts
- Public scripts may only link to public references
```

- [ ] **Step 4: Run the full verification set**

Run: `pnpm test`

Run: `pnpm playwright test`

Run: `pnpm check`

Run: `pnpm build`

Run: `pnpm validate:public`

Expected: PASS across unit tests, end-to-end tests, Astro type-check, static build, and public-content validation.

- [ ] **Step 5: Commit**

```bash
git add manager/server/routes/system.ts scripts/assert-public-content.mjs docs/authoring.md tests/routes.spec.ts tests/manager-api.test.ts tests/manager-editor.test.ts
git commit -m "feat: finalize manager publishing flow and verification"
```

---

## Self-Review Notes

### Spec coverage

- `references` 集合、`articles.type`、公开资料页、资料库索引页: covered by Tasks 2, 4, and 5.
- wiki 链接、自动回链、公开/私有校验: covered by Tasks 3, 4, and 8.
- 本地后台、内容列表、编辑器、结构化资料表单、图片/截图、构建与 git 操作: covered by Tasks 6, 7, and 8.
- 首页与资料库入口页 JSON 编辑: site-side config is covered by Task 5; manager-side editing scaffold is covered by Task 7 and can be extended within `PageBuilder.tsx`.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Every task names concrete files, commands, and at least one concrete code target.

### Type consistency

- Shared naming is consistent around `references`, `type: script`, `kind: source | topic`, and `visibility: public | private`.
- Validation consistently treats public article/reference entries as disallowed from linking to private references.
