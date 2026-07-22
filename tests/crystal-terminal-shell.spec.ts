import { expect, test } from "@playwright/test";

const dismissSplash = async (page: Parameters<typeof test>[0]["page"]) => {
  await page.addInitScript(() => sessionStorage.setItem("blog-shell-splash-dismissed", "true"));
};

test("desktop shell uses Crystal Terminal geometry and semantic state colors", async ({ page }) => {
  await dismissSplash(page); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto("/");
  const nav = page.locator("[data-top-nav]"); const search = nav.locator(".home-search-field"); const command = nav.locator(".top-nav-command-button").first(); const activeSlot = page.locator('.character-slot[aria-current="page"]');
  await expect(page.locator("body")).toHaveAttribute("data-interface-theme", "crystal-terminal");
  await expect(search).toHaveCSS("border-radius", "5px"); await expect(command).toHaveCSS("border-radius", "5px"); await expect(command).toHaveCSS("width", "42px"); await expect(command).toHaveCSS("height", "42px"); await expect(activeSlot).toHaveCSS("color", "rgb(241, 245, 248)");
  const before = await command.boundingBox(); await command.hover(); await expect(command).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -1)"); const after = await command.boundingBox(); expect(after?.width).toBe(before?.width); expect(after?.height).toBe(before?.height); expect((after?.y ?? 0) - (before?.y ?? 0)).toBeCloseTo(-1, 0);
  await command.focus(); expect(await command.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
});

test("rail toggling does not recenter the command search", async ({ page }) => {
  await dismissSplash(page); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto("/");
  const search = page.locator("[data-top-nav] [data-home-search]"); const center = () => search.evaluate((node) => { const rect = node.getBoundingClientRect(); return rect.left + rect.width / 2; });
  const before = await center(); await page.locator("[data-character-rail-toggle]").click(); await expect(page.locator("[data-character-rail]")).toHaveAttribute("data-open", "false"); expect(await center()).toBeCloseTo(before, 0);
});

test("1024px keeps a centered content plane clear of the open rail", async ({ page }) => {
  await dismissSplash(page); await page.setViewportSize({ width: 1024, height: 1000 }); await page.goto("/");
  const [railBox, openingBox] = await Promise.all([page.locator("[data-character-rail]").boundingBox(), page.locator("[data-home-hero] .home-hero-grid").boundingBox()]);
  expect((railBox?.x ?? 0) + (railBox?.width ?? 0)).toBeLessThanOrEqual(openingBox?.x ?? 0); expect(Math.abs((openingBox?.x ?? 0) - (1024 - ((openingBox?.x ?? 0) + (openingBox?.width ?? 0))))).toBeLessThanOrEqual(2);
});

test("reduced motion removes shared travel and shimmer", async ({ page }) => {
  await dismissSplash(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto("/");
  const command = page.locator(".top-nav-command-button").first(); await command.hover(); await expect(command).toHaveCSS("transition-duration", "0s"); await expect(command).toHaveCSS("transform", "none");
});
