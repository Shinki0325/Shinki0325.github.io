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
for (const viewport of viewports) {
  test(`${viewport.name}px homepage has no overlap or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height }); await prepare(page); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
    const recordLinks = page.locator('[data-home-chapter="records"] .home-records-grid > a');
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
test("reduced motion keeps hierarchy without travel", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page); const card = page.locator(".home-feature-card").nth(1); await card.hover(); await expect(card).toHaveCSS("transition-duration", "0s"); await expect(card).toHaveCSS("transform", "none"); await expect(page.locator("[data-home-history-entry]")).toBeVisible(); await expect(page.locator("[data-home-character-archive]")).toBeVisible(); });
