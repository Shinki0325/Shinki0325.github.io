import { expect, test, type Page } from "@playwright/test";

async function openPhotoWall(page: Page, path = "/photowall/") {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-photowall-shell]")).toBeVisible();
}

test("album detail replaces the overview and restores its trigger on return", async ({ page }) => {
  await openPhotoWall(page);

  const hiddenCgAlbum = page.getByRole("button", { name: /隐藏cg/ });
  await expect(page.locator("[data-photo-special-masthead]")).toBeVisible();
  await expect(page.locator("[data-album-paper]")).toHaveCount(2);

  await hiddenCgAlbum.click();

  const detail = page.locator("[data-album-detail]");
  await expect(detail).toBeVisible();
  await expect(page.locator("[data-photo-special-masthead]")).toHaveCount(0);
  await expect(page.locator("[data-album-paper]")).toHaveCount(0);
  await expect(detail.getByRole("heading", { name: "隐藏cg" })).toBeVisible();
  await expect(detail.locator("[data-photo-tile]")).toHaveCount(4);
  await expect(detail.locator(".photowall-photo-tile__caption")).toHaveCount(4);
  await expect(detail.locator("[data-photo-tile] img + .photowall-photo-tile__caption")).toHaveCount(
    4,
  );

  await detail.getByRole("button", { name: "返回相册" }).click();

  await expect(page.locator("[data-album-paper]")).toHaveCount(2);
  await expect(page.getByRole("button", { name: /隐藏cg/ })).toBeFocused();
});

test("album hash deep link opens the contact sheet directly", async ({ page }) => {
  await openPhotoWall(page, "/photowall/#album-隐藏cg");

  await expect(page.locator("[data-album-detail]")).toBeVisible();
  await expect(page.locator("[data-album-paper]")).toHaveCount(0);
  await expect(page.locator("[data-photo-tile]")).toHaveCount(4);
});

test("latest album stamp stays above the paper image well", async ({ page }) => {
  await openPhotoWall(page);

  const layers = await page.locator("[data-album-paper]").first().evaluate((paper) => {
    const stamp = paper.querySelector<HTMLElement>("[data-album-new]")!;
    const imageWell = paper.querySelector<HTMLElement>(".photowall-album-card__image-well")!;
    const stampBox = stamp.getBoundingClientRect();
    return {
      imageWell: Number.parseInt(getComputedStyle(imageWell).zIndex, 10),
      stampHeight: stampBox.height,
      stamp: Number.parseInt(getComputedStyle(stamp).zIndex, 10),
      stampText: stamp.textContent,
      stampWidth: stampBox.width,
    };
  });

  expect(layers.stamp).toBeGreaterThan(layers.imageWell);
  expect(layers.stampText).toBe("NEW");
  expect(layers.stampWidth).toBeGreaterThanOrEqual(48);
  expect(layers.stampHeight).toBeGreaterThanOrEqual(24);
});

test("lightbox uses icon controls, keyboard navigation, and focus restoration", async ({ page }) => {
  await openPhotoWall(page, "/photowall/#album-隐藏cg");

  const firstTile = page.locator("[data-photo-tile]").first();
  await firstTile.click();

  const dialog = page.getByRole("dialog", { name: "隐藏cg 大图预览" });
  const close = dialog.getByRole("button", { name: "关闭大图" });
  const previous = dialog.getByRole("button", { name: "上一张" });
  const next = dialog.getByRole("button", { name: "下一张" });

  await expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(await dialog.evaluate((element) => element.parentElement === document.body)).toBe(true);
  await expect(close).toBeFocused();
  await expect(close).toHaveAttribute("title", "关闭");
  await expect(previous).toHaveAttribute("title", "上一张");
  await expect(next).toHaveAttribute("title", "下一张");
  await expect(dialog.locator("[data-lightbox-count]")).toHaveText("1 / 4");

  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("[data-lightbox-count]")).toHaveText("2 / 4");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator("[data-lightbox-count]")).toHaveText("1 / 4");

  await dialog.click({ position: { x: 4, y: 4 } });
  await expect(dialog).toHaveCount(0);
  await expect(firstTile).toBeFocused();

  await firstTile.click();
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(firstTile).toBeFocused();
});

test("paper-board overview keeps complete cards in the first desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPhotoWall(page);

  const geometry = await page.evaluate(() => {
    const masthead = document.querySelector<HTMLElement>("[data-photo-special-masthead]")!;
    const papers = [...document.querySelectorAll<HTMLElement>("[data-album-paper]")];
    const boxes = papers.map((paper) => {
      const box = paper.getBoundingClientRect();
      const footer = paper.querySelector<HTMLElement>(".photowall-album-card__body")!.getBoundingClientRect();
      const image = paper.querySelector<HTMLImageElement>(".photowall-album-card__image-well img")!;
      return {
        bottom: box.bottom,
        footerBottom: footer.bottom,
        footerTop: footer.top,
        imageFit: getComputedStyle(image).objectFit,
        left: box.left,
        right: box.right,
        top: box.top,
      };
    });

    return {
      boxes,
      mastheadHeight: masthead.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  expect(geometry.mastheadHeight).toBeGreaterThanOrEqual(88);
  expect(geometry.mastheadHeight).toBeLessThanOrEqual(112);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
  expect(geometry.boxes).toHaveLength(2);
  expect(geometry.boxes.every((box) => box.top >= 0 && box.bottom <= 1000)).toBe(true);
  expect(
    geometry.boxes.every(
      (box) => box.imageFit === "contain" && box.footerTop >= box.top && box.footerBottom <= box.bottom,
    ),
  ).toBe(true);
  expect(
    geometry.boxes[0].right <= geometry.boxes[1].left ||
      geometry.boxes[1].right <= geometry.boxes[0].left,
  ).toBe(true);
});

test("photowall stays within the standard archive shell and caps photo grids", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
  await page.goto("/articles/", { waitUntil: "domcontentloaded" });

  const archive = page.locator(".archive-overview");
  await expect(archive).toBeVisible();
  const archiveWidth = await archive.evaluate((element) => element.getBoundingClientRect().width);

  await openPhotoWall(page);
  const overviewWidths = await page.evaluate(() => ({
    grid: document.querySelector<HTMLElement>(".photowall-albums")!.getBoundingClientRect().width,
    masthead: document
      .querySelector<HTMLElement>("[data-photo-special-masthead]")!
      .getBoundingClientRect().width,
    shell: document.querySelector<HTMLElement>("[data-photowall-shell]")!.getBoundingClientRect().width,
  }));

  expect(overviewWidths.shell).toBeLessThanOrEqual(archiveWidth + 1);
  expect(overviewWidths.masthead).toBeLessThanOrEqual(archiveWidth + 1);
  expect(overviewWidths.grid).toBeLessThanOrEqual(920);

  await page.locator('[data-album-slug="隐藏cg"]').click();
  const detailWidths = await page.evaluate(() => ({
    detail: document.querySelector<HTMLElement>("[data-album-detail]")!.getBoundingClientRect().width,
    grid: document.querySelector<HTMLElement>(".photowall-photo-grid")!.getBoundingClientRect().width,
  }));

  expect(detailWidths.detail).toBeLessThanOrEqual(archiveWidth + 1);
  expect(detailWidths.grid).toBeLessThanOrEqual(920);
});

for (const viewport of [
  { width: 736, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`${viewport.width}px paper overview has no overlap or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openPhotoWall(page);

    const geometry = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll<HTMLElement>("[data-album-paper]")].map((paper) => {
        const box = paper.getBoundingClientRect();
        return { bottom: box.bottom, left: box.left, right: box.right, top: box.top };
      });
      const overlaps = boxes.some((box, index) =>
        boxes.slice(index + 1).some(
          (other) =>
            box.left < other.right &&
            box.right > other.left &&
            box.top < other.bottom &&
            box.bottom > other.top,
        ),
      );
      return {
        backingCounts: [...document.querySelectorAll<HTMLElement>("[data-album-paper]")].map(
          (paper) =>
            [...paper.querySelectorAll<HTMLElement>("[data-album-backing]")].filter(
              (backing) => getComputedStyle(backing).display !== "none",
            ).length,
        ),
        overlaps,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    expect(geometry.overflow).toBeLessThanOrEqual(0);
    expect(geometry.overlaps).toBe(false);
    if (viewport.width === 390) {
      expect(geometry.backingCounts.every((count) => count <= 1)).toBe(true);
    }
  });
}

test("detail and lightbox keep contact-sheet media uncropped", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPhotoWall(page, "/photowall/#album-隐藏cg");

  const detail = page.locator("[data-album-detail]");
  await expect(detail).toHaveCSS("border-radius", "0px");
  await expect(detail).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(detail.locator("[data-photo-tile] img").first()).toHaveCSS("object-fit", "contain");
  await expect(detail.locator(".photowall-photo-tile__caption").first()).not.toHaveCSS(
    "position",
    "absolute",
  );

  await detail.locator("[data-photo-tile]").first().click();
  await expect(page.locator("[data-lightbox-image]")).toHaveCSS("object-fit", "contain");
});
