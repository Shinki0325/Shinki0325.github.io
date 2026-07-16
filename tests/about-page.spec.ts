import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
});

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

test("about pagination requests covers only for the visible fourteen-card page", async ({ page }) => {
  const coverRequests: string[] = [];
  page.on("request", (request) => {
    try {
      if (new URL(request.url()).hostname === "lain.bgm.tv") {
        coverRequests.push(request.url());
      }
    } catch {
      // Ignore non-URL browser internals.
    }
  });

  await page.goto("/about/", { waitUntil: "domcontentloaded" });
  await dismissSplashIfVisible(page);
  await page.waitForTimeout(10_000);

  await expect(page.locator("[data-bangumi-card]:not([hidden])")).toHaveCount(14);
  const firstPageRequests = new Set(coverRequests);
  expect(firstPageRequests.size).toBeLessThanOrEqual(14);

  await page.locator("[data-bangumi-page-next]").click();
  await expect(page.locator("[data-bangumi-card]:not([hidden])")).toHaveCount(14);
  await expect.poll(() => new Set(coverRequests).size).toBeGreaterThan(firstPageRequests.size);
  const secondPageRequests = new Set(
    coverRequests.filter((url) => !firstPageRequests.has(url)),
  );
  expect(secondPageRequests.size).toBeLessThanOrEqual(14);
});
