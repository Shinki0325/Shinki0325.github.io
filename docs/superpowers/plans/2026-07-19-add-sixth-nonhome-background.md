# Add Sixth Non-Home Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the supplied image as the sixth locally optimized non-home background without changing carousel behavior or the existing five assets.

**Architecture:** Extend the existing manual Sharp acquisition manifest with one source-specific quality override, then expose the generated local WebP through the existing JSON configuration. Keep runtime code unchanged and expand the asset/request regression contracts from five backgrounds to six.

**Tech Stack:** Node.js, Sharp, Astro configuration, Vitest, Playwright, pnpm, GitHub Pages

---

### Task 1: Lock the six-background contract with failing tests

**Files:**
- Modify: `tests/nonhome-background-assets.test.ts`
- Modify: `tests/loading-performance.spec.ts`

- [x] **Step 1: Expand the expected asset list to six entries**

Change the generated expected list in `tests/nonhome-background-assets.test.ts` to:

```ts
const expectedBackgrounds = Array.from(
  { length: 6 },
  (_, index) => `/uploads/backgrounds/nonhome/background-${String(index + 1).padStart(2, "0")}.webp`,
);
```

Rename the first test to `publishes six unique bounded WebPs in the approved order`, expect a set size of 6, and change the aggregate assertion to:

```ts
expect(totalBytes).toBeLessThan(1_080_000);
```

Append the new source URL to `originalUrls`, and add these source-pipeline assertions:

```ts
expect(source).toContain("quality: 59");
expect(source).toContain("1_080_000");
```

- [x] **Step 2: Expand the Playwright background path authority**

Append this entry to `BACKGROUND_PATHS` in `tests/loading-performance.spec.ts`:

```ts
"/uploads/backgrounds/nonhome/background-06.webp",
```

- [x] **Step 3: Run the focused asset test and verify RED**

Run:

```bash
pnpm vitest run tests/nonhome-background-assets.test.ts
```

Expected: failure because the configuration and `background-06.webp` still contain only five assets.

### Task 2: Extend the acquisition pipeline and publish the local asset

**Files:**
- Modify: `scripts/acquire-nonhome-backgrounds.mjs`
- Create: `public/uploads/backgrounds/nonhome/background-06.webp`
- Modify: `src/config/pages/home.json`

- [x] **Step 1: Record hashes for backgrounds 01-05**

Run:

```bash
sha256sum public/uploads/backgrounds/nonhome/background-0{1,2,3,4,5}.webp
```

Keep the output for comparison after regeneration.

- [x] **Step 2: Add source-specific quality configuration**

Replace `sourceUrls` with:

```js
const sourceBackgrounds = [
  { url: "https://pic.imgdd.cc/i/033mKdPGvSW4H4Kdr8Z7qh.png", quality: 80 },
  { url: "https://pic.imgdd.cc/i/033mKdJZSowAnZfhAT19Jx.png", quality: 80 },
  { url: "https://pic.imgdd.cc/i/033mKdQMNqxcA7EXIMKPgG.png", quality: 80 },
  { url: "https://pic.imgdd.cc/i/033mRL5hL42K30lBIHwCpo.png", quality: 80 },
  { url: "https://pic.imgdd.cc/i/033mRL4ygydTIdfnHrklxE.png", quality: 80 },
  { url: "https://pic.imgdd.cc/i/033sANQbp4eAi1Iw97zRwt.png", quality: 59 },
];
```

Iterate with:

```js
for (const [index, { url: sourceUrl, quality }] of sourceBackgrounds.entries()) {
```

Encode with:

```js
.webp({ quality, effort: 6 })
```

Change the aggregate guard to:

```js
if (totalBytes >= 1_080_000) {
```

- [x] **Step 3: Generate all six assets**

Run:

```bash
node scripts/acquire-nonhome-backgrounds.mjs
```

Expected: six WebPs; every file below 250 KB; total below 1.08 MB; the sixth image approximately `1529x1080 / 248KB`.

- [x] **Step 4: Verify backgrounds 01-05 are byte-identical**

Run the same `sha256sum` command and compare it with Step 1. Expected: all five hashes unchanged.

- [x] **Step 5: Append the sixth configured path**

Change `backgroundImages` in `src/config/pages/home.json` to end with:

```json
"/uploads/backgrounds/nonhome/background-05.webp",
"/uploads/backgrounds/nonhome/background-06.webp"
```

- [x] **Step 6: Run focused Vitest and verify GREEN**

Run:

```bash
pnpm vitest run tests/nonhome-background-assets.test.ts tests/site-background-performance.test.ts tests/site-appearance.test.ts
```

Expected: all focused background tests pass.

### Task 3: Verify runtime behavior and release

**Files:**
- Modify: `docs/superpowers/plans/2026-07-19-add-sixth-nonhome-background.md`
- Modify after release: `D:/blog-kb/STATUS.md`
- Modify after release: `D:/blog-kb/MANIFEST.md`
- Modify after release: `D:/blog-kb/CHANGELOG.md`
- Modify after release: `D:/blog-kb/agent-state/blog-manager.md`

- [x] **Step 1: Run focused Playwright background coverage**

Run:

```bash
pnpm exec playwright test tests/loading-performance.spec.ts
```

Expected: 7/7 tests pass; every deterministic background selection requests one configured local background initially, no remote background, and session continuity remains green with six paths.

- [x] **Step 2: Run the complete release gates**

Run in WSL:

```bash
pnpm test
pnpm check
pnpm build
pnpm validate:public
git diff --check
```

Expected: no new failures; report test counts, generated page count, existing hints, and key errors only.

- [x] **Step 3: Commit the scoped implementation (`e3313d9`)**

Stage only the acquisition script, sixth asset, configuration, tests, and plan status. Commit with:

```bash
git commit -m "feat: add sixth non-home background"
```

- [x] **Step 4: Push and monitor GitHub Pages (`29687350214`)**

Push `master`, identify the repository-owned Pages workflow triggered by the implementation commit, and wait for successful build and deploy jobs. Treat unrelated duplicate legacy workflow failures as non-authoritative only if the repository-owned workflow succeeds.

- [x] **Step 5: Verify production**

Confirm the public site and `/uploads/backgrounds/nonhome/background-06.webp` return HTTP 200, verify the deployed asset byte length matches the repository file, and confirm generated public HTML includes the sixth local path with no runtime reference to the remote source URL.

- [x] **Step 6: Publish the Blog Manager handoff state**

Append concise release evidence to `D:/blog-kb/STATUS.md`, `D:/blog-kb/MANIFEST.md`, and `D:/blog-kb/CHANGELOG.md`; refresh `D:/blog-kb/agent-state/blog-manager.md`. Record commit, workflow IDs, verification counts, production checks, and preservation of pre-existing dirty files.
