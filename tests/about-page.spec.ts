import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
});

test("about page presents the approved project console", async ({ page }) => {
  await page.goto("/about/");

  await expect(page.locator("[data-about-project]")).toBeVisible();
  await expect(page.locator("[data-about-hero]")).toContainText("美妙故事的瞬间");
  await expect(page.locator("[data-about-guide] img")).toHaveAttribute(
    "src",
    "/uploads/about/about-guide-character.webp",
  );
  await expect(page.locator("[data-about-modules] a")).toHaveCount(4);
  await expect(page.locator("[data-about-collection-showcase] a")).toHaveCount(6);
  await expect(page.locator("[data-about-collection-panel]")).toBeHidden();
  await expect(page.locator("[data-about-tabs], [data-about-cover]")).toHaveCount(0);
});

test("About birthday and height entries activate the requested archive view", async ({ page }) => {
  await page.goto("/about/");
  await page.locator('a[href="/?archive=height#character-archive"]').click();
  await expect(page).toHaveURL(/archive=height#character-archive$/);
  await expect(page.locator("#character-archive").getByRole("tab").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.goto("/about/");
  await page.locator('a[href="/?archive=birthday#character-archive"]').click();
  await expect(page).toHaveURL(/archive=birthday#character-archive$/);
  await expect(page.locator("#character-archive").getByRole("tab").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("About music entry reaches the homepage music console", async ({ page }) => {
  await page.goto("/about/");
  await page.locator('a[href="/#home-music-card"]').click();
  await expect(page).toHaveURL(/#home-music-card$/);
  await expect(page.locator("#home-music-card")).toBeVisible();
});

test("collection loads once, preserves state, and restores focus", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/data/about-collection.json") {
      payloadRequests += 1;
    }
  });

  await page.goto("/about/");
  const toggle = page.locator("[data-about-collection-toggle]");
  const panel = page.locator("[data-about-collection-panel]");

  expect(payloadRequests).toBe(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  await panel.locator('[data-about-collection-category="game"]').click();
  await panel.locator("[data-about-collection-page-next]").click();
  await expect(panel.locator("[data-about-collection-page-info]")).toContainText("2 /");
  await toggle.click();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await expect(panel.locator('[data-about-collection-category="game"]')).toHaveClass(
    /is-active/,
  );
  await expect(panel.locator("[data-about-collection-page-info]")).toContainText("2 /");
  expect(payloadRequests).toBe(1);
  expect(pageErrors).toHaveLength(0);
});

test("concurrent retry activation shares one request and then succeeds", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    if (payloadRequests === 1) {
      await route.fulfill({ status: 503, body: "Unavailable" });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.continue();
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await expect(retry).toBeVisible();

  const disabledAfterFirstActivation = await retry.evaluate((node) => {
    const button = node as HTMLButtonElement;
    button.click();
    const disabled = button.disabled;
    button.click();
    return disabled;
  });

  expect(disabledAfterFirstActivation).toBe(true);
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  await expect(panel.locator('[data-about-collection-category="anime"]')).toBeFocused();
  expect(payloadRequests).toBe(2);
  expect(pageErrors).toHaveLength(0);
});

test("malformed payload shows an inline error and remains retryable", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    if (payloadRequests === 1) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }
    await route.continue();
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  await expect(panel).toContainText("完整收藏暂时无法加载。");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await expect(retry).toBeVisible();
  expect(pageErrors).toHaveLength(0);

  await retry.click();
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  expect(payloadRequests).toBe(2);
  expect(pageErrors).toHaveLength(0);
});

test("a repeated request failure focuses the replacement retry", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    await route.fulfill({ status: 503, body: "Unavailable" });
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await retry.click();

  await expect.poll(() => payloadRequests).toBe(2);
  await expect(retry).toBeFocused();
  expect(await retry.getAttribute("aria-pressed")).toBeNull();
  expect(pageErrors).toHaveLength(0);
});

test("collection filters expose grouped pressed state without marking commands", async ({
  page,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  await expect(panel.getByRole("group", { name: "番组分类" })).toBeVisible();
  await expect(panel.getByRole("group", { name: "收藏状态" })).toBeVisible();
  await expect(panel.getByRole("group", { name: "排序方式" })).toBeVisible();

  await expect(panel.locator('[data-about-collection-category="anime"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-category="game"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(panel.locator('[data-about-collection-status="all"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-status="wish"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(panel.locator('[data-about-collection-sort="default"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-sort="rating"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(
    await panel.locator("[data-about-collection-page-prev]").getAttribute("aria-pressed"),
  ).toBeNull();
  expect(
    await panel.locator("[data-about-collection-page-next]").getAttribute("aria-pressed"),
  ).toBeNull();
  expect(pageErrors).toHaveLength(0);
});
