import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /YES|はい|进入站点|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("desktop homepage uses the approved command bar and six-character rail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const topNav = page.locator("[data-top-nav]");
  const rail = page.locator("[data-character-rail]");

  await expect(topNav).toBeVisible();
  const navBox = await topNav.boundingBox();
  expect(navBox).not.toBeNull();
  expect(navBox?.x).toBe(0);
  expect(navBox?.width).toBe(1440);
  expect(navBox?.height).toBe(72);

  await expect(topNav.locator("[data-home-search]")).toHaveCount(1);
  await expect(page.locator("[data-home-search]")).toHaveCount(1);
  await expect(topNav.locator("[data-utility]")).toHaveCount(2);
  await expect(topNav.locator("img, [data-avatar]")).toHaveCount(0);
  await expect(rail.getByRole("link")).toHaveCount(6);
  await expect(rail.locator("img")).toHaveCount(6);
  await expect(rail.locator(".character-slot__index")).toHaveText(["01", "02", "03", "04", "05", "06"]);
  await expect(rail.getByRole("link", { name: "首页", exact: true })).toHaveAttribute("aria-current", "page");

  const searchMetrics = await topNav.locator("[data-home-search]").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      centerDelta: Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2),
      height: rect.height,
      width: rect.width,
    };
  });
  expect(searchMetrics.centerDelta).toBeLessThanOrEqual(2);
  expect(searchMetrics.height).toBe(44);
  expect(searchMetrics.width).toBeGreaterThanOrEqual(660);
  expect(searchMetrics.width).toBeLessThanOrEqual(684);
});

test("character rail toggle persists and current route follows inner pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/articles/");
  await dismissSplashIfVisible(page);

  const rail = page.locator("[data-character-rail]");
  const toggle = page.locator("[data-character-rail-toggle]");
  await expect(rail).toHaveAttribute("data-open", "true");
  await expect(rail.getByRole("link", { name: "文稿", exact: true })).toHaveAttribute("aria-current", "page");

  await toggle.click();
  await expect(rail).toHaveAttribute("data-open", "false");
  await page.reload();
  await expect(rail).toHaveAttribute("data-open", "false");
  expect(await page.evaluate(() => localStorage.getItem("blog-shell-character-rail-open"))).toBe("false");
});

test("desktop command search opens real indexed results", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const search = page.locator("[data-top-nav] [data-home-search]");
  await search.locator("input").fill("E-LOGIN");
  await expect(search.locator(".home-search-panel")).toBeVisible();
  await expect(search.locator(".home-search-result").first()).toContainText("E-LOGIN");
});

test("desktop command bar hides on downward scroll and keeps only the primary brand", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const topNav = page.locator("[data-top-nav]");
  await expect(topNav).not.toContainText("SAKURA");
  await expect(topNav).toContainText("ARCHIVE");

  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await expect(topNav).toHaveClass(/is-hidden/);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(topNav).not.toHaveClass(/is-hidden/);
});

test("mobile homepage exposes the radial menu trigger and opens the overlay", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-mobile-nav-trigger]")).toBeVisible();
  await expect(page.locator("[data-character-rail]")).toBeHidden();
  await expect(page.locator("[data-top-nav] [data-home-search]")).toBeVisible();
  await page.locator("[data-mobile-nav-trigger]").click();
  const mobileMenu = page.locator("[data-mobile-radial-menu]");

  await expect(mobileMenu).toBeVisible();
  await expect(mobileMenu.getByRole("link", { name: "文稿", exact: true })).toBeVisible();
});
