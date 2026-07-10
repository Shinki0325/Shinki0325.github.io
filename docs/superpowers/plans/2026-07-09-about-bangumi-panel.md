# About Bangumi Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Bangumi collection panel to the About page for user `shinkisakura`.

**Architecture:** Fetch Bangumi collections into a local JSON snapshot, normalize that snapshot through a small typed library, and render a static About-page panel with lightweight client-side category/status filtering. The public site reads only local data, so page load does not depend on Bangumi API availability.

**Tech Stack:** Astro, TypeScript, Vitest, Bangumi v0 API, CSS in `src/styles/global.css`.

---

### Task 1: Data Normalization Tests

**Files:**
- Create: `tests/bangumi-collections.test.ts`
- Create: `src/lib/bangumi-collections.ts`

- [ ] Write tests for converting a Bangumi API collection item into a local card model.
- [ ] Run `pnpm exec vitest run tests/bangumi-collections.test.ts` and confirm it fails because the module does not exist.
- [ ] Implement `normalizeBangumiCollectionItem` and `buildBangumiCollectionViewModel`.
- [ ] Re-run the targeted test and confirm it passes.

### Task 2: Sync Script And Snapshot

**Files:**
- Create: `scripts/sync-bangumi-collections.mjs`
- Create: `src/data/bangumi-collections.json`
- Modify: `package.json`

- [ ] Add a script that pages through `/v0/users/shinkisakura/collections` for anime, book, music, and game subject types.
- [ ] Store normalized raw API items with `username`, `updatedAt`, and `items`.
- [ ] Add `sync:bangumi` to `package.json`.
- [ ] Run the script in WSL and verify the JSON has non-empty items.

### Task 3: About Page UI

**Files:**
- Modify: `src/pages/about.astro`
- Modify: `src/styles/global.css`
- Create or extend: `tests/about-bangumi.test.ts`

- [ ] Write a source-level test that About imports the Bangumi snapshot and renders `data-bangumi-panel`.
- [ ] Add the panel below the intro section with category tabs, status pills, and poster cards.
- [ ] Add a small inline script that filters cards by `data-bangumi-category` and `data-bangumi-status`.
- [ ] Style the panel to match the site's glass-card language while borrowing the reference blog's poster-grid layout.

### Task 4: Verification

- [ ] Run `pnpm check`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Restart the local WSL static preview on `http://127.0.0.1:4321/`.
