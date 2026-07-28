# Birthday Idle Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the birthday archive during homepage idle time and remove one serial network round trip before the user reaches it.

**Architecture:** Keep the server-rendered archive shell and public manifest validation. Hydrate the React island with Astro `client:idle`; after the manifest resolves, request the summary and current-month shard concurrently while preserving the existing summary fallback, retry state, and month cache.

**Tech Stack:** Astro 5, React 18, TypeScript, Vitest, Playwright

---

### Task 1: Lock The New Activation Contract

**Files:**
- Modify: `tests/character-archive-terminal.test.ts`
- Modify: `tests/character-archive-terminal.spec.ts`
- Modify: `tests/birthday-progressive-loading.spec.ts`

- [x] Replace the `client:visible` assertions with `client:idle` assertions.
- [x] Replace the 400px activation test with a test that waits for ready state before scrolling the archive into view.
- [x] Run the focused tests and confirm they fail because the island still uses `client:visible`.

### Task 2: Lock The Parallel Request Contract

**Files:**
- Modify: `tests/birthday-progressive-loading.test.ts`
- Modify: `src/lib/birthday-data-client.ts`

- [x] Add a test for a public `loadSnapshotId()` method.
- [x] Verify that summary and current-month fetches are both started immediately after manifest resolution.
- [x] Implement `loadSnapshotId()` as a cached manifest-backed accessor.

### Task 3: Implement Idle Bootstrap

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/characters/CharacterArchiveTerminal.tsx`

- [x] Change the island directive to `client:idle`.
- [x] Load the snapshot id first, then start summary and current-month requests together with `Promise.allSettled`.
- [x] Preserve summary installation when the month shard fails so retry behavior remains unchanged.

### Task 4: Verify And Preserve Candidate State

**Files:**
- Modify: `D:\blog-kb\ACTIVE-TASKS.md`
- Modify: `D:\blog-kb\agent-state\blog-manager.md`

- [x] Run focused Vitest and birthday Playwright tests.
- [x] Run Astro/manager check and one build.
- [x] Review the diff, commit the candidate locally, and record the new candidate state without merging, pushing, or deploying.
