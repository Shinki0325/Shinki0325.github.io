import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入站点|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("desktop homepage shows the new glass navigation with 文稿 entry", async ({ page }) => {
  await page.goto("/");

  const topNav = page.locator("[data-top-nav]");

  await expect(topNav).toBeVisible();
  await expect(topNav.getByRole("link", { name: "文稿", exact: true })).toBeVisible();
  await expect(topNav.getByRole("link", { name: "资料库", exact: true })).toBeVisible();
});

test("mobile homepage exposes the radial menu trigger and opens the overlay", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-mobile-nav-trigger]")).toBeVisible();
  await page.locator("[data-mobile-nav-trigger]").click();
  const mobileMenu = page.locator("[data-mobile-radial-menu]");

  await expect(mobileMenu).toBeVisible();
  await expect(mobileMenu.getByRole("link", { name: "文稿", exact: true })).toBeVisible();
});
