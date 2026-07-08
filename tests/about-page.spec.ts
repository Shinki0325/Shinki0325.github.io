import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("about page mirrors the reference profile card shell", async ({ page }) => {
  await page.goto("/about/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-about-shell]")).toBeVisible();
  await expect(page.locator("[data-about-cover]")).toBeVisible();
  await expect(page.locator("[data-about-avatar]")).toBeVisible();
  await expect(page.locator("[data-about-tabs]")).toContainText("自我介绍");
  await expect(page.locator("[data-about-tabs]")).toContainText("研究动态");
  await expect(page.locator("[data-about-intro]")).toContainText("关于我");
  await expect(page.locator("[data-about-heatmap]")).toHaveCount(0);
  await expect(page.locator("[data-about-activity-list]")).toHaveCount(0);
});
