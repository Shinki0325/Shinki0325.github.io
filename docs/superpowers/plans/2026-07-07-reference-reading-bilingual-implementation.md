# Reference Reading Bilingual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade public reference detail pages so the left column reads like a wiki-style source page with curated body text, paragraph-by-paragraph Chinese translation for foreign-language sources, Chinese-only UI labels, and explicit video-relevant paragraph markers.

**Architecture:** Keep the existing Astro reference route and sidebar layout, but introduce a small structured reading model in reference frontmatter plus a dedicated rendering component. A helper in `src/lib/` will decide whether a page should render curated reading blocks or fall back to the existing attachment-based text extract, which keeps the static GitHub Pages flow intact.

**Tech Stack:** Astro 5, TypeScript, Zod, Playwright, Vitest, pnpm workspace, Markdown content collections.

---

## File Structure Map

### Existing files to modify

- `packages/content-core/src/schemas.ts`
  Add the structured reading schema for references.
- `src/content/config.ts`
  Keep the Astro collection wiring unchanged while picking up the richer shared reference schema.
- `src/lib/reference-extract.ts`
  Reuse the existing attachment text loader from a new reading-state helper instead of calling it directly in the page.
- `src/pages/references/[...slug].astro`
  Replace the current “summary + extract below” behavior with curated reading blocks in the left column and Chinese UI labels throughout the page shell.
- `src/components/ReferenceMeta.astro`
  Localize metadata and attachment labels into Chinese.
- `src/components/BacklinkList.astro`
  Localize the backlink panel heading and empty-state copy into Chinese.
- `src/styles/global.css`
  Add styles for the reading blocks, translation rows, and “视频重点” marker while preserving the current visual language.
- `tests/content-schema.test.ts`
  Add schema coverage for reading blocks and the `focus` marker.
- `tests/routes.spec.ts`
  Replace English UI assertions with Chinese ones and add coverage for curated bilingual rendering plus extract fallback behavior.
- `docs/authoring.md`
  Document how to author `readingBlocks` and how to mark video-relevant paragraphs.
- `src/content/references/to-heart-wikipedia.md`
  Add the first curated foreign-language reading sample with translations and video-focus markers.
- `src/content/references/pc-9801-computer-museum.md`
  Add the first curated foreign-language reading sample with translations and video-focus markers.

### New files to create

- `src/lib/reference-reading.ts`
  Normalize a reference entry into a renderable reading state (`curated` or `extract`).
- `src/components/ReferenceReading.astro`
  Render the “编者说明 / 正文阅读 / 站内摘录” stack in the left column.
- `tests/reference-reading.test.ts`
  Unit-test the reading-state helper without hitting the full Astro route.

---

### Task 1: Extend The Reference Schema For Curated Reading Blocks

**Files:**
- Modify: `packages/content-core/src/schemas.ts`
- Modify: `tests/content-schema.test.ts`
- Test: `tests/content-schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, expect, it, vi } from "vitest";
import { referenceSchema } from "../packages/content-core/src/index";

vi.mock("@maki/content-core", async () => import("../packages/content-core/src/index.ts"));
vi.mock("astro:content", async () => {
  const { z } = await import("zod");

  return {
    defineCollection: (config: unknown) => config,
    z
  };
});

describe("content collections", () => {
  it("parses curated reading blocks with translation and focus markers", () => {
    const parsed = referenceSchema.parse({
      title: "Example Reference",
      kind: "source",
      visibility: "public",
      date: "2026-07-07",
      summary: "Structured reading data should parse.",
      readingMode: "curated",
      sourceLanguage: "ja",
      translationLanguage: "zh-CN",
      readingBlocks: [
        {
          label: "作品简介",
          original: "原文段落",
          translation: "中文译文",
          note: "编者备注",
          focus: true
        }
      ]
    });

    expect(parsed.readingMode).toBe("curated");
    expect(parsed.readingBlocks?.[0]?.translation).toBe("中文译文");
    expect(parsed.readingBlocks?.[0]?.focus).toBe(true);
  });
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run: `pnpm vitest run tests/content-schema.test.ts -t "parses curated reading blocks with translation and focus markers"`

Expected: FAIL because `readingMode`, `sourceLanguage`, `translationLanguage`, `readingBlocks`, and `focus` are not part of `referenceSchema` yet.

- [ ] **Step 3: Add the reading schemas to the shared content package**

```ts
import { z } from "zod";

export const readingBlockSchema = z.object({
  label: z.string().optional(),
  original: z.string(),
  translation: z.string().optional(),
  note: z.string().optional(),
  focus: z.boolean().default(false)
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
  relatedRefs: z.array(z.string()).optional(),
  relatedScripts: z.array(z.string()).optional(),
  readingMode: z.enum(["curated", "extract"]).default("extract"),
  sourceLanguage: z.string().optional(),
  translationLanguage: z.string().optional(),
  readingBlocks: z.array(readingBlockSchema).default([])
});
```

- [ ] **Step 4: Re-run the schema test**

Run: `pnpm vitest run tests/content-schema.test.ts`

Expected: PASS with the new reading fields accepted and the older optional metadata assertions still green.

- [ ] **Step 5: Commit**

```bash
git add packages/content-core/src/schemas.ts tests/content-schema.test.ts
git commit -m "feat: add curated reference reading schema"
```

### Task 2: Add A Reading-State Helper With Curated And Extract Modes

**Files:**
- Create: `src/lib/reference-reading.ts`
- Modify: `src/lib/reference-extract.ts`
- Create: `tests/reference-reading.test.ts`
- Test: `tests/reference-reading.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
import { describe, expect, it } from "vitest";
import { buildReferenceReadingState } from "../src/lib/reference-reading";

describe("buildReferenceReadingState", () => {
  it("prefers curated reading blocks over attachment extracts", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      readingBlocks: [
        {
          label: "平台定位",
          original: "PC-9801は...",
          translation: "PC-9801 是...",
          focus: true
        }
      ],
      attachments: ["/uploads/example.txt"]
    });

    expect(state.mode).toBe("curated");
    expect(state.blocks).toHaveLength(1);
    expect(state.extract).toBeNull();
  });

  it("falls back to extracts when no curated blocks are present", () => {
    const state = buildReferenceReadingState({
      readingMode: "extract",
      readingBlocks: [],
      attachments: []
    });

    expect(state.mode).toBe("extract");
    expect(state.blocks).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run: `pnpm vitest run tests/reference-reading.test.ts`

Expected: FAIL because `src/lib/reference-reading.ts` does not exist yet.

- [ ] **Step 3: Implement the reading-state helper**

```ts
import { getTextExtractFromAttachments } from "./reference-extract";

type ReadingBlock = {
  label?: string;
  original: string;
  translation?: string;
  note?: string;
  focus?: boolean;
};

type ReadingInput = {
  readingMode?: "curated" | "extract";
  readingBlocks?: ReadingBlock[];
  attachments?: string[];
};

export const buildReferenceReadingState = (entry: ReadingInput) => {
  const blocks = (entry.readingBlocks ?? []).filter((block) => block.original.trim().length > 0);

  if (blocks.length > 0 && entry.readingMode !== "extract") {
    return {
      mode: "curated" as const,
      blocks,
      extract: null
    };
  }

  return {
    mode: "extract" as const,
    blocks: [],
    extract: getTextExtractFromAttachments(entry.attachments ?? [])
  };
};
```

```ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const publicRoot = path.join(projectRoot, "public");

export const normalizeExtract = (value: string) =>
  value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const getTextExtractFromAttachments = (attachments: string[] = [], limit = 1200) => {
  const textAttachment = attachments.find((attachment) => /\.txt$/i.test(attachment));

  if (!textAttachment) {
    return null;
  }

  const filePath = path.join(publicRoot, textAttachment.replace(/^\//, ""));

  if (!existsSync(filePath)) {
    return null;
  }

  const text = normalizeExtract(readFileSync(filePath, "utf-8"));

  if (!text) {
    return null;
  }

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
};
```

- [ ] **Step 4: Run the helper tests**

Run: `pnpm vitest run tests/reference-reading.test.ts`

Expected: PASS with one curated-mode test and one extract-mode test.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reference-reading.ts src/lib/reference-extract.ts tests/reference-reading.test.ts
git commit -m "feat: add reference reading state helper"
```

### Task 3: Render Curated Reading Blocks And Localize The Reference Page UI

**Files:**
- Create: `src/components/ReferenceReading.astro`
- Modify: `src/pages/references/[...slug].astro`
- Modify: `src/components/ReferenceMeta.astro`
- Modify: `src/components/BacklinkList.astro`
- Modify: `src/styles/global.css`
- Test: `tests/routes.spec.ts`

- [ ] **Step 1: Write the failing route assertions**

```ts
test("reference detail page renders Chinese UI labels and bilingual reading blocks", async ({
  page
}) => {
  await page.goto("/references/to-heart-wikipedia/");
  await expect(page.getByText("参考资料")).toBeVisible();
  await expect(page.getByRole("heading", { name: "资料详情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "关联内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "引用此页" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("视频重点")).toBeVisible();
  await expect(page.locator(".reading-block").first()).toContainText("To Heart");
  await expect(page.locator(".reading-block").first()).toContainText("《To Heart》");
});
```

```ts
test("reference detail falls back to internal extracts when curated reading is absent", async ({
  page
}) => {
  await page.goto("/references/example-public-reference/");
  await expect(page.getByRole("heading", { name: "站内摘录" })).toBeVisible();
});
```

- [ ] **Step 2: Run the reference route tests to verify they fail**

Run: `CI=true pnpm playwright test tests/routes.spec.ts --grep "reference detail"`

Expected: FAIL because the page still shows English headings and has no `正文阅读` block renderer yet.

- [ ] **Step 3: Add a dedicated reading component and wire it into the page**

```astro
---
interface ReadingBlock {
  label?: string;
  original: string;
  translation?: string;
  note?: string;
  focus?: boolean;
}

interface Props {
  intro?: string;
  blocks: ReadingBlock[];
  extract: string | null;
}

const { intro, blocks, extract } = Astro.props;
---

{intro && (
  <section class="glass-panel prose reading-section">
    <h2>编者说明</h2>
    <p>{intro}</p>
  </section>
)}

{blocks.length > 0 && (
  <section class="glass-panel prose reading-section">
    <h2>正文阅读</h2>
    <div class="reading-stack">
      {blocks.map((block) => (
        <article class="reading-block">
          <div class="reading-block__head">
            {block.label && <h3>{block.label}</h3>}
            {block.focus && <span class="reading-focus">视频重点</span>}
          </div>
          <div class="reading-original">
            <strong>原文</strong>
            <p>{block.original}</p>
          </div>
          {block.translation && (
            <div class="reading-translation">
              <strong>对照翻译</strong>
              <p>{block.translation}</p>
            </div>
          )}
          {block.note && <p class="reading-note">编者备注：{block.note}</p>}
        </article>
      ))}
    </div>
  </section>
)}

{!blocks.length && extract && (
  <section class="glass-panel prose reading-section text-extract">
    <h2>站内摘录</h2>
    <p class="muted">当前资料尚未完成整理正文，先展示归档文本摘录。</p>
    <pre>{extract}</pre>
  </section>
)}
```

```astro
---
import { render } from "astro:content";
import BacklinkList from "../../components/BacklinkList.astro";
import ReferenceMeta from "../../components/ReferenceMeta.astro";
import ReferenceReading from "../../components/ReferenceReading.astro";
import { buildReferenceReadingState } from "../../lib/reference-reading";
import PostLayout from "../../layouts/PostLayout.astro";
// existing imports omitted for brevity

const { entry, backlinks, networkLinks } = Astro.props;
const { Content } = await render(entry);
const renderedIntro = await Content();
const readingState = buildReferenceReadingState(entry.data);
---

<PostLayout title={entry.data.title} summary={entry.data.summary} date={entry.data.date}>
  <Fragment slot="lead">
    <section class="glass-panel side-panel stack">
      <p class="eyebrow">参考资料</p>
      <p class="muted">公开资料页会持续链接回主稿、笔记与其他参考节点。</p>
    </section>
    <ReferenceMeta entry={entry} />
    <section class="glass-panel side-panel stack">
      <h2>关联内容</h2>
      <!-- existing lists, but with Chinese labels -->
    </section>
  </Fragment>

  <ReferenceReading
    intro={entry.body ? undefined : undefined}
    blocks={readingState.blocks}
    extract={readingState.extract}
  />

  <div class="reference-editorial prose glass-panel">
    <h2>编者说明</h2>
    <Content />
  </div>

  <BacklinkList slot="after" items={backlinks} />
</PostLayout>
```

```astro
---
const rows = [
  { label: "类型", value: entry.data.kind === "source" ? "来源页" : "专题页" },
  { label: "来源类型", value: entry.data.sourceType },
  { label: "来源标题", value: entry.data.sourceTitle },
  { label: "作者", value: entry.data.author },
  { label: "发布方", value: entry.data.publisher },
  { label: "发布时间", value: entry.data.publishedAt },
  { label: "标签", value: entry.data.tags?.join("，") },
  { label: "主题", value: entry.data.topics?.join("，") }
].filter((row) => row.value);
---

<section class="glass-panel side-panel stack">
  <h2>资料详情</h2>
  <!-- existing metadata table -->
  <div class="stack attachments-block">
    <h3>归档文件</h3>
  </div>
</section>
```

```astro
<section class="glass-panel side-panel stack">
  <h2>引用此页</h2>
  {
    items.length > 0 ? (
      <ul class="backlinks">
        {items.map((item) => (
          <li>
            <a href={item.href}>{item.title}</a>
            <span class="muted"> {item.kind}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p class="muted">暂时还没有公开页面引用这里。</p>
    )
  }
</section>
```

- [ ] **Step 4: Add the new reading styles**

```css
.reading-section {
  display: grid;
  gap: 1rem;
}

.reading-stack {
  display: grid;
  gap: 1rem;
}

.reading-block {
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.36);
  border: 1px solid rgba(255, 255, 255, 0.56);
}

.reading-block__head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.reading-focus {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 0.75rem;
  border-radius: 999px;
  background: rgba(111, 124, 255, 0.14);
  color: #4b57c6;
  font-size: 0.82rem;
  font-weight: 700;
}

.reading-original,
.reading-translation {
  display: grid;
  gap: 0.45rem;
}

.reading-note {
  margin: 0;
  color: var(--muted);
}
```

- [ ] **Step 5: Run the route tests**

Run: `CI=true pnpm playwright test tests/routes.spec.ts --grep "reference detail"`

Expected: PASS for the updated Chinese-label assertions, bilingual block rendering, and extract fallback behavior.

- [ ] **Step 6: Commit**

```bash
git add src/components/ReferenceReading.astro src/pages/references/[...slug].astro src/components/ReferenceMeta.astro src/components/BacklinkList.astro src/styles/global.css tests/routes.spec.ts
git commit -m "feat: render bilingual reference reading pages"
```

### Task 4: Seed The First Curated References And Document The Authoring Format

**Files:**
- Modify: `src/content/references/to-heart-wikipedia.md`
- Modify: `src/content/references/pc-9801-computer-museum.md`
- Modify: `docs/authoring.md`
- Modify: `tests/authoring-docs.test.ts`
- Test: `tests/routes.spec.ts`
- Test: `tests/authoring-docs.test.ts`

- [ ] **Step 1: Write the failing documentation and content expectations**

```ts
import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("authoring docs", () => {
  it("documents curated reading blocks and video focus markers", () => {
    const doc = fs.readFileSync("docs/authoring.md", "utf8");
    expect(doc).toContain("readingBlocks");
    expect(doc).toContain("focus: true");
    expect(doc).toContain("对照翻译");
  });
});
```

```ts
test("pc-9801 reference page shows translated source paragraphs", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("PC-9801は")).toBeVisible();
  await expect(page.getByText("PC-9801 是 NEC 于 1982 年 10 月发表的 16 位个人电脑")).toBeVisible();
});
```

- [ ] **Step 2: Run the documentation and route tests to verify they fail**

Run: `pnpm vitest run tests/authoring-docs.test.ts && CI=true pnpm playwright test tests/routes.spec.ts --grep "pc-9801 reference page shows translated source paragraphs"`

Expected: FAIL because the docs do not mention `readingBlocks` yet and the content files do not contain curated bilingual blocks.

- [ ] **Step 3: Add the first curated reading blocks and authoring docs**

```md
---
title: "PC-9801-コンピュータ博物館"
kind: "source"
visibility: "public"
date: "2026-07-07"
summary: "补平台史背景的基础资料页，用来承接主稿里关于 PC-98 生态与 90 年代 galgame 土壤的说明。"
readingMode: "curated"
sourceLanguage: "ja"
translationLanguage: "zh-CN"
readingBlocks:
  - label: "平台定位"
    original: "PC-9801は，1982年10月に日本電気が発表した16ビットパソコンである。"
    translation: "PC-9801 是 NEC 于 1982 年 10 月发表的一款 16 位个人电脑。"
    note: "这一段适合承接视频里关于 PC-98 作为九十年代 galgame 土壤的开场说明。"
    focus: true
  - label: "系列扩张"
    original: "以後，機種を増やしながらPC-9800シリーズとして発展した。"
    translation: "此后它在持续扩充机型的过程中，逐步发展成了 PC-9800 系列。"
---
这一页更偏“平台底座”，不是直接谈某一部作品，而是给九十年代 PC-98 语境补一块公开可引用的背景资料。
```

```md
## 参考资料正文块

外文资料建议按段录入：

```yaml
readingMode: "curated"
sourceLanguage: "ja"
translationLanguage: "zh-CN"
readingBlocks:
  - label: "平台定位"
    original: "PC-9801は..."
    translation: "PC-9801 是..."
    note: "适合承接视频里的平台背景说明。"
    focus: true
```

- `original`：原文
- `translation`：中文对照翻译
- `note`：编者备注
- `focus: true`：表示这一段与视频主稿直接相关，页面会显示“视频重点”标签
```

- [ ] **Step 4: Run the docs, route, and full verification commands**

Run: `pnpm vitest run tests/authoring-docs.test.ts tests/reference-reading.test.ts tests/content-schema.test.ts`

Expected: PASS for docs and unit coverage.

Run: `CI=true pnpm playwright test tests/routes.spec.ts`

Expected: PASS for the updated reference-detail behavior and existing public-route coverage.

Run: `CI=true pnpm check && CI=true pnpm build`

Expected: PASS with no new schema or route regressions.

- [ ] **Step 5: Commit**

```bash
git add src/content/references/to-heart-wikipedia.md src/content/references/pc-9801-computer-museum.md docs/authoring.md tests/authoring-docs.test.ts tests/routes.spec.ts
git commit -m "feat: seed curated bilingual reference content"
```

## Self-Review

### Spec coverage

- Chinese UI labels: covered in Task 3.
- Curated reading blocks in the left column: covered in Tasks 2 and 3.
- Foreign-language paragraph-by-paragraph translation: covered in Tasks 1, 3, and 4.
- Extract fallback for unfinished references: covered in Tasks 2 and 3.
- Video-relevant paragraph markers: covered in Tasks 1, 3, and 4.
- Authoring guidance for future maintenance: covered in Task 4.

No uncovered spec requirements remain for this implementation slice.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Every file path is explicit.
- Every test step includes the command to run and the expected failure/pass condition.

### Type consistency

- The plan consistently uses `readingMode`, `sourceLanguage`, `translationLanguage`, `readingBlocks`, and `focus`.
- The helper returns only two modes: `curated` and `extract`, matching the schema.
- The UI badge text is consistently `视频重点`.
