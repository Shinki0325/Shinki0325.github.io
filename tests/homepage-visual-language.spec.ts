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
  const profileFamily = await page.locator("[data-home-profile-card] h1").evaluate((node) => getComputedStyle(node).fontFamily); const commandFamily = await page.locator("[data-home-section-command] strong").first().evaluate((node) => getComputedStyle(node).fontFamily);
  expect(profileFamily).toMatch(/Noto Serif SC|Source Han Serif SC|Songti SC|STSong|Georgia/); expect(commandFamily).toMatch(/Noto Serif SC|Source Han Serif SC|Songti SC|STSong|Georgia/); await expect(page.locator("[data-home-system-status] p")).toHaveCSS("font-size", "12px");
  for (const card of await page.locator(".home-feature-card").all()) { const radius = await card.evaluate((node) => parseFloat(getComputedStyle(node).borderTopLeftRadius)); expect(radius).toBeLessThanOrEqual(5); }
});
test("content-card hover and focus preserve geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page); const card = page.locator(".home-feature-card").nth(1); await card.scrollIntoViewIfNeeded(); const before = await card.boundingBox(); await card.hover(); await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)"); const hovered = await card.boundingBox(); expect(hovered?.width).toBe(before?.width); expect(hovered?.height).toBe(before?.height); expect((hovered?.y ?? 0) - (before?.y ?? 0)).toBeCloseTo(-2, 0); await card.focus(); expect(await card.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
});
for (const viewport of viewports) {
  test(`${viewport.name}px homepage has no overlap or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height }); await prepare(page); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
    const rects = await page.locator("[data-home-section-command], [data-home-history-entry], [data-home-character-archive], .home-records-grid, [data-home-system-status]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map((rect) => ({ bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top })));
    for (const rect of rects) { expect(rect.left).toBeGreaterThanOrEqual(-1); expect(rect.right).toBeLessThanOrEqual(viewport.width + 1); expect(rect.bottom).toBeGreaterThan(rect.top); }
    if (reviewOutput) { await mkdir(reviewOutput, { recursive: true }); await page.screenshot({ fullPage: true, path: `${reviewOutput}/home-crystal-${viewport.name}.png` }); }
  });
}
test("reduced motion keeps hierarchy without travel", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); await page.setViewportSize({ width: 1440, height: 1000 }); await prepare(page); const card = page.locator(".home-feature-card").nth(1); await card.hover(); await expect(card).toHaveCSS("transition-duration", "0s"); await expect(card).toHaveCSS("transform", "none"); await expect(page.locator("[data-home-history-entry]")).toBeVisible(); await expect(page.locator("[data-home-character-archive]")).toBeVisible(); });
