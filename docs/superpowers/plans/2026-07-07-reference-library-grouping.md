# Reference Library Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把批量导入的参考资料页整理成三类分组展示，并为每页补上开头摘要与站内互链。

**Architecture:** 通过 `librarySection` 承载资料分组；在运行时根据分组与标签自动补互链；用脚本一次性回填中文标题、摘要与关键互链，不改变 GitHub Pages 静态发布模式。

**Tech Stack:** Astro、Vitest、gray-matter、Node.js

---

### Task 1: 建立资料库分组工具层

**Files:**
- Create: `src/lib/reference-library.ts`
- Test: `tests/reference-library.test.ts`

- [x] 写分组、摘要与互链的失败测试
- [x] 实现三类分组、自动摘要与自动互链工具
- [x] 运行 `vitest` 验证工具层通过

### Task 2: 把资料页接入新工具层

**Files:**
- Modify: `src/pages/references/index.astro`
- Modify: `src/pages/references/[...slug].astro`
- Modify: `src/components/ReferenceCard.astro`
- Modify: `src/components/ReferenceMeta.astro`
- Modify: `packages/content-core/src/schemas.ts`
- Test: `tests/content-schema.test.ts`

- [x] 索引页改成“专题入口 + 三类分组”
- [x] 详情页加入“这份资料在讲什么”
- [x] 侧栏接入自动互链
- [x] 更新 schema 与测试

### Task 3: 批量整理现有公开资料页

**Files:**
- Create: `scripts/curate-reference-library.mjs`
- Modify: `src/content/references/*.md`

- [x] 建立标题、分组、摘要与关键互链映射
- [x] 批量回填 42 张公开来源资料页
- [x] 保留原始 `sourceTitle`，只更新公开展示标题与摘要

### Task 4: 验证与可见性检查

**Files:**
- Verify: `tests/reference-library.test.ts`
- Verify: `tests/content-schema.test.ts`
- Verify: `tests/reference-reading.test.ts`
- Verify: `tests/reference-extract.test.ts`

- [x] 运行相关 `vitest` 测试
- [x] 运行 `astro build`
- [ ] 本地预览人工检查首页分组与典型资料页
