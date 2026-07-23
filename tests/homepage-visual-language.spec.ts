import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const reviewOutput = process.env.REVIEW_OUTPUT;
const viewports = [
  { name: "1440", width: 1440, height: 1000 }, { name: "1280", width: 1280, height: 1000 }, { name: "1024", width: 1024, height: 1000 }, { name: "768", width: 768, height: 1000 }, { name: "390", width: 390, height: 844 },
] as const;
const prepare = async (page: Parameters<typeof test>[0]["page"]) => { await page.addInitScript(() => sessionStorage.setItem("blog-shell-splash-dismissed", "true")); await page.goto("/", { waitUntil: "domcontentloaded" }); };

test("homepage uses one opening surface and three command chapters", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page);
  const opening = page.locator("[data-home-opening-surface]"); const profile = page.locator("[data-home-profile-card]"); const music = page.locator("[data-home-music-card]"); const commands = page.locator("[data-home-section-command]");
  await expect(opening).toHaveCSS("border-radius", "5px"); await expect(commands).toHaveCount(3); await expect(profile).toHaveCSS("border-top-left-radius", "0px"); await expect(music).toHaveCSS("border-top-right-radius", "0px");
  const [openingBox, profileBox, musicBox] = await Promise.all([opening.boundingBox(), profile.boundingBox(), music.boundingBox()]); expect(profileBox?.y).toBeCloseTo(musicBox?.y ?? 0, 0); expect(openingBox?.width).toBeGreaterThan((profileBox?.width ?? 0) + (musicBox?.width ?? 0) - 2);
});
test("homepage assigns story, UI, metadata, and surface roles", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page);
  await expect(page.locator("[data-home-section-command] h2")).toHaveCount(3);
  const profileFamily = await page.locator("[data-home-profile-card] h1").evaluate((node) => getComputedStyle(node).fontFamily); const commandFamily = await page.locator("[data-home-section-command] h2").first().evaluate((node) => getComputedStyle(node).fontFamily);
  expect(profileFamily).toMatch(/Noto Serif SC|Source Han Serif SC|Songti SC|STSong|Georgia/); expect(commandFamily).toMatch(/Noto Serif SC|Source Han Serif SC|Songti SC|STSong|Georgia/); await expect(page.locator("[data-home-system-status] p")).toHaveCSS("font-size", "12px");
  for (const card of await page.locator(".home-feature-card").all()) { const radius = await card.evaluate((node) => parseFloat(getComputedStyle(node).borderTopLeftRadius)); expect(radius).toBeLessThanOrEqual(5); }
});
test("content-card hover and focus preserve geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page); const card = page.locator(".home-feature-card").nth(1); await card.scrollIntoViewIfNeeded(); const before = await card.boundingBox(); await card.hover(); await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)"); const hovered = await card.boundingBox(); expect(hovered?.width).toBe(before?.width); expect(hovered?.height).toBe(before?.height); expect((hovered?.y ?? 0) - (before?.y ?? 0)).toBeCloseTo(-2, 0); await card.focus(); expect(await card.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
});

test("latest record dossier keeps both primary card heights across a carousel transition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await prepare(page);

  const pair = page.locator(".home-records-grid__primary-pair");
  const article = pair.locator("[data-home-script-carousel]");
  const reference = pair.locator(".home-feature-card--reference");
  await expect(pair).toBeVisible();
  await expect(article).toBeVisible();
  await expect(reference).toBeVisible();

  if (reviewOutput) {
    await mkdir(reviewOutput, { recursive: true });
    await pair.screenshot({ path: `${reviewOutput}/home-records-before-1440.png` });
  }
  const before = await Promise.all([article.boundingBox(), reference.boundingBox()]);
  await page.waitForTimeout(6500);
  const after = await Promise.all([article.boundingBox(), reference.boundingBox()]);
  if (reviewOutput) await pair.screenshot({ path: `${reviewOutput}/home-records-after-1440.png` });

  expect(after[0]?.height).toBe(before[0]?.height);
  expect(after[1]?.height).toBe(before[1]?.height);
  expect(after[0]?.height).toBeGreaterThanOrEqual(350);
  expect(after[1]?.height).toBe(after[0]?.height);
  expect((before[1]?.x ?? 0)).toBeGreaterThan((before[0]?.x ?? 0) + (before[0]?.width ?? 0));
  expect(await article.locator("h2").evaluate((node) => ({
    lineClamp: getComputedStyle(node).webkitLineClamp,
    overflow: getComputedStyle(node).overflow,
  }))).toEqual({ lineClamp: "4", overflow: "hidden" });
  await expect(reference.locator(".home-feature-card__cta")).toBeVisible();
});

for (const dossierViewport of [
  { width: 1024, articleHeight: 360, referenceHeight: 360 },
  { width: 768, articleHeight: 320, referenceHeight: 260 },
  { width: 390, articleHeight: 320, referenceHeight: 260 },
]) {
  test(`${dossierViewport.width}px dossier keeps its responsive envelopes across a transition`, async ({ page }) => {
    await page.setViewportSize({ width: dossierViewport.width, height: 1000 });
    await prepare(page);
    const article = page.locator("[data-home-script-carousel]");
    const reference = page.locator(".home-records-grid__primary-pair .home-feature-card--reference");
    const before = await Promise.all([article.boundingBox(), reference.boundingBox()]);
    await page.waitForTimeout(6500);
    const after = await Promise.all([article.boundingBox(), reference.boundingBox()]);

    expect(before[0]?.height).toBe(dossierViewport.articleHeight);
    expect(before[1]?.height).toBe(dossierViewport.referenceHeight);
    expect(after[0]?.height).toBe(before[0]?.height);
    expect(after[1]?.height).toBe(before[1]?.height);
  });
}

test("character rail hover and focus keep tile geometry stable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await prepare(page);

  const slots = page.locator("[data-character-rail] .character-slot");
  const rail = page.locator("[data-character-rail]");
  if (reviewOutput) {
    await mkdir(reviewOutput, { recursive: true });
    await rail.screenshot({ path: `${reviewOutput}/home-rail-default-active-1440.png` });
  }
  const before = await slots.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { height: rect.height, left: rect.left, top: rect.top, width: rect.width };
  }));
  await slots.nth(1).hover();
  if (reviewOutput) await rail.screenshot({ path: `${reviewOutput}/home-rail-hover-1440.png` });
  await slots.nth(2).focus();
  if (reviewOutput) await rail.screenshot({ path: `${reviewOutput}/home-rail-focus-1440.png` });
  const after = await slots.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { height: rect.height, left: rect.left, top: rect.top, width: rect.width };
  }));

  expect(after).toEqual(before);
  await expect(slots.nth(1).locator(".character-slot__label")).toBeVisible();
  await expect(slots.nth(2)).toHaveCSS("outline-style", "solid");
  if (reviewOutput) {
    const toggle = page.locator("[data-character-rail-toggle]");
    await toggle.click();
    await expect(rail).toHaveAttribute("data-open", "false");
    await page.screenshot({ path: `${reviewOutput}/home-rail-collapsed-1440.png` });
    await toggle.click();
    await expect(rail).toHaveAttribute("data-open", "true");
    await page.screenshot({ path: `${reviewOutput}/home-rail-expanded-1440.png` });
  }
});

test("homepage correction adds no new remote assets or runtime errors", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const requests: string[] = [];
  const runtimeErrors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await prepare(page);
  await page.waitForLoadState("load");
  await page.waitForTimeout(6500);

  const requestUrls = requests.map((url) => new URL(url));
  const externalOrigins = [...new Set(requestUrls
    .filter((url) => url.origin !== "http://127.0.0.1:44022")
    .map((url) => url.origin))].sort();
  const railAssets = new Set(requestUrls
    .filter((url) => url.pathname.startsWith("/uploads/navigation/character-select/"))
    .map((url) => url.pathname));
  const fontRequests = requestUrls.filter((url) => /\.(?:woff2?|ttf|otf)$/i.test(url.pathname));

  expect(runtimeErrors).toEqual([]);
  expect(externalOrigins).toEqual(["https://s1.ax1x.com"]);
  expect(railAssets.size).toBe(6);
  expect(fontRequests).toHaveLength(0);
  console.log(`NETWORK homepage ${JSON.stringify({ externalOrigins, fontRequests: fontRequests.length, railAssets: railAssets.size, requests: requests.length })}`);
});
for (const viewport of viewports) {
  test(`${viewport.name}px homepage has no overlap or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height }); await prepare(page); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
    const recordLinks = page.locator('[data-home-chapter="records"] .home-records-grid a.home-feature-card');
    await expect(recordLinks).toHaveCount(3);
    for (let recordIndex = 0; recordIndex < 3; recordIndex += 1) await expect(recordLinks.nth(recordIndex)).toBeVisible();
    const opening = page.locator("[data-home-opening-surface]");
    const lyricBar = page.locator("[data-home-lyric-bar]");
    const chapters = page.locator("[data-home-chapter]");
    await expect(opening).toHaveCount(1); await expect(opening).toBeVisible();
    await expect(lyricBar).toHaveCount(1); await expect(lyricBar).toBeVisible();
    await expect(chapters).toHaveCount(3);
    for (let chapterIndex = 0; chapterIndex < 3; chapterIndex += 1) await expect(chapters.nth(chapterIndex)).toBeVisible();
    const rects = await page.locator("[data-home-opening-surface], [data-home-lyric-bar], [data-home-chapter]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map((rect) => ({ bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top })));
    for (const rect of rects) { expect(rect.left).toBeGreaterThanOrEqual(-1); expect(rect.right).toBeLessThanOrEqual(viewport.width + 1); expect(rect.bottom).toBeGreaterThan(rect.top); }
    for (let leftIndex = 0; leftIndex < rects.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < rects.length; rightIndex += 1) {
        const left = rects[leftIndex]; const right = rects[rightIndex];
        const overlapWidth = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
        const overlapHeight = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
        expect(overlapWidth * overlapHeight, `regions ${leftIndex} and ${rightIndex} overlap`).toBeLessThanOrEqual(1);
      }
    }
    await expect(page.locator(".top-nav-shell")).toHaveCount(1); await expect(page.locator(".top-nav-shell")).toBeVisible(); await expect(page.locator(".top-nav-shell")).toHaveCSS("position", "fixed");
    const fixedRects = await page.locator(".top-nav-shell, .character-rail").evaluateAll((nodes) => nodes.filter((node) => { const style = getComputedStyle(node); return style.position === "fixed" && style.visibility !== "hidden" && style.display !== "none"; }).map((node) => node.getBoundingClientRect()).map((rect) => ({ bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top })));
    expect(fixedRects.length).toBeGreaterThan(0);
    const firstInteractive = await page.locator("[data-home-opening-surface] a, [data-home-opening-surface] button, [data-home-opening-surface] input").first().boundingBox();
    expect(firstInteractive).not.toBeNull();
    for (const fixed of fixedRects) {
      const overlapWidth = Math.max(0, Math.min(fixed.right, firstInteractive?.x! + firstInteractive?.width!) - Math.max(fixed.left, firstInteractive?.x!));
      const overlapHeight = Math.max(0, Math.min(fixed.bottom, firstInteractive?.y! + firstInteractive?.height!) - Math.max(fixed.top, firstInteractive?.y!));
      expect(overlapWidth * overlapHeight, "fixed shell or rail overlaps first opening control").toBeLessThanOrEqual(1);
    }
    if (reviewOutput) { await mkdir(reviewOutput, { recursive: true }); await page.screenshot({ fullPage: true, path: `${reviewOutput}/home-crystal-${viewport.name}.png` }); }
  });
}
test("reduced motion keeps hierarchy and rail state without travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await prepare(page);
  const card = page.locator(".home-feature-card").nth(1);
  await card.hover();
  await expect(card).toHaveCSS("transition-duration", "0s");
  await expect(card).toHaveCSS("transform", "none");

  const slotImage = page.locator(".character-slot").nth(1).locator(".character-slot__image");
  const before = await slotImage.evaluate((node) => getComputedStyle(node).transform);
  await slotImage.locator("..").hover();
  await expect(slotImage).toHaveCSS("transition-duration", "0s");
  await expect(slotImage).toHaveCSS("transform", before);
  await expect(page.locator("[data-home-history-entry]")).toBeVisible();
  await expect(page.locator("[data-home-character-archive]")).toBeVisible();
});
