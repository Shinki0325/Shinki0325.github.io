import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入站点|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("photo wall route renders the target stacked album cover style and launches the lightbox", async ({ page }) => {
  await page.goto("/photowall/");
  await dismissSplashIfVisible(page);

  const albumDetail = page.locator("[data-album-detail]");
  const albumStack = page.locator("[data-album-stack]").first();
  const drawingAlbum = page.getByRole("button", { name: /绘画练习/ });
  const hiddenCgAlbum = page.getByRole("button", { name: /隐藏cg/ });

  await expect(page.getByRole("heading", { name: "照片墙" })).toBeVisible();
  await expect(page.locator(".photowall-search")).toHaveCount(0);
  await expect(drawingAlbum).toBeVisible();
  await expect(hiddenCgAlbum).toBeVisible();
  await expect(drawingAlbum).toContainText("两张蓝色铅笔线稿练习");
  await expect(albumDetail).toHaveCount(0);
  await expect(albumStack).toBeVisible();
  await expect(albumStack.locator("[data-album-polaroid]")).toHaveCount(3);
  await expect(page.locator("[data-album-backdrop]")).toHaveCount(1);
  await expect(page.locator("[data-photowall-shell]")).toHaveCSS("overflow-y", "visible");

  const albumLayout = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".photowall-album-card__button")].map((card) => {
      const box = card.getBoundingClientRect();
      const body = card.querySelector(".photowall-album-card__body")?.getBoundingClientRect();
      const stack = card.querySelector("[data-album-stack]")?.getBoundingClientRect();
      const polaroids = [...card.querySelectorAll("[data-album-polaroid]")].map((polaroid) => {
        const polaroidBox = polaroid.getBoundingClientRect();
        return {
          bottom: Math.round(polaroidBox.bottom),
          top: Math.round(polaroidBox.top),
        };
      });
      return {
        bodyTop: body ? Math.round(body.top) : null,
        bottom: Math.round(box.bottom),
        height: Math.round(box.height),
        polaroids,
        stackBottom: stack ? Math.round(stack.bottom) : null,
        top: Math.round(box.top),
      };
    });

    return {
      cards,
      viewportHeight: window.innerHeight,
      uniqueHeights: new Set(cards.map((card) => card.height)).size,
    };
  });

  expect(albumLayout.cards.length).toBeGreaterThanOrEqual(2);
  expect(albumLayout.cards.every((card) => card.top >= 0 && card.bottom <= albumLayout.viewportHeight)).toBe(true);
  expect(albumLayout.cards.every((card) => card.polaroids.every((polaroid) => polaroid.top >= 0 && polaroid.bottom <= albumLayout.viewportHeight))).toBe(true);
  expect(albumLayout.cards.every((card) => card.bodyTop !== null && card.stackBottom !== null && card.bodyTop >= card.stackBottom)).toBe(true);
  expect(albumLayout.uniqueHeights).toBeGreaterThan(1);

  await drawingAlbum.click();

  await expect(albumDetail).toBeVisible();
  await expect(albumDetail.getByRole("heading", { name: "绘画练习" })).toBeVisible();
  await expect(albumDetail.getByRole("button", { name: "返回相册" })).toBeVisible();
  await expect(page.locator("[data-photo-masonry]")).toBeVisible();

  const masonryColumnCount = await page.locator("[data-photo-masonry]").evaluate((node) => {
    const styles = window.getComputedStyle(node);
    return styles.columnCount;
  });
  expect(masonryColumnCount).not.toBe("auto");

  await page.locator("[data-photo-tile]").first().click();

  await expect(page.locator("[data-lightbox]")).toBeVisible();
  await expect(page.locator("[data-lightbox-image]")).toBeVisible();
});
