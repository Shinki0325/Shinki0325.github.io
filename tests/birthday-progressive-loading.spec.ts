import { expect, test, type Page } from "@playwright/test";

const birthdayBase = "https://shinki0325.github.io/character-birthday-data/";

async function dismissSplash(page: Page) {
  const splash = page.locator("[data-splash-screen]");
  await splash.waitFor({ state: "visible", timeout: 3_000 }).catch(() => undefined);
  if (await splash.isVisible().catch(() => false)) {
    await splash.getByRole("button", { name: /YES|はい|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

async function openHome(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.clock.setFixedTime(new Date("2026-07-14T12:00:00+08:00"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await dismissSplash(page);
  return page.locator("[data-home-birthday-calendar]");
}

const birthdayPaths = (requests: string[]) =>
  requests.filter((url) => url.startsWith(birthdayBase)).map((url) => url.slice(birthdayBase.length));

test("defers birthday requests until the terminal reaches the 400px activation range", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const archive = await openHome(page, 1440, 300);

  await page.waitForTimeout(500);
  expect(birthdayPaths(requests)).toEqual([]);

  const before = await archive.boundingBox();
  await archive.scrollIntoViewIfNeeded();
  await expect(archive.locator('[data-birthday-data-state="ready"]')).toBeVisible({
    timeout: 20_000,
  });
  const after = await archive.boundingBox();
  const paths = birthdayPaths(requests);

  expect(paths.filter((path) => path === "assets-manifest.json")).toHaveLength(1);
  expect(paths.filter((path) => path === "birthdays/v1/summary.json")).toHaveLength(1);
  expect(paths.filter((path) => path === "birthdays/v1/months/07.json")).toHaveLength(1);
  expect(paths.some((path) => path.includes("months/06.json"))).toBe(false);
  expect(paths.some((path) => path.includes("months/08.json"))).toBe(false);
  expect(Math.abs((after?.height ?? 0) - (before?.height ?? 0))).toBeLessThanOrEqual(2);
});

test("loads one requested month and reuses the snapshot cache when returning", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const archive = await openHome(page, 1280, 800);
  await archive.scrollIntoViewIfNeeded();
  await expect(archive.locator('[data-birthday-data-state="ready"]')).toBeVisible({
    timeout: 20_000,
  });

  const next = archive.getByRole("button", { name: "下个月" });
  await next.focus();
  await next.click();
  await expect(archive.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-08",
  );
  await expect(next).toBeFocused();

  const previous = archive.getByRole("button", { name: "上个月" });
  await previous.click();
  await expect(archive.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-07",
  );

  const paths = birthdayPaths(requests);
  expect(paths.filter((path) => path === "birthdays/v1/months/08.json")).toHaveLength(1);
  expect(paths.filter((path) => path === "birthdays/v1/months/07.json")).toHaveLength(1);
});

test("keeps the summary shell and retries only a failed current month", async ({ page }) => {
  let monthAttempts = 0;
  await page.route("**/birthdays/v1/months/07.json", async (route) => {
    monthAttempts += 1;
    if (monthAttempts === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
      return;
    }
    await route.continue();
  });
  const archive = await openHome(page, 390, 844);
  await archive.scrollIntoViewIfNeeded();
  await expect(archive.locator('[data-birthday-data-state="error"]')).toBeVisible({
    timeout: 20_000,
  });
  await expect(archive.locator("[data-birthday-node]")).toHaveCount(31);
  await expect(archive.getByRole("button", { name: "重试本月星图" })).toBeVisible();

  await archive.getByRole("button", { name: "重试本月星图" }).click();
  await expect(archive.locator('[data-birthday-data-state="ready"]')).toBeVisible({
    timeout: 20_000,
  });
  expect(monthAttempts).toBe(2);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 901, height: 768 },
]) {
  test(`${viewport.width}px keeps the accepted terminal geometry across activation`, async ({
    page,
  }) => {
    const archive = await openHome(page, viewport.width, viewport.height);
    await archive.scrollIntoViewIfNeeded();
    const loadingBox = await archive.boundingBox();
    await expect(archive.locator('[data-birthday-data-state="ready"]')).toBeVisible({
      timeout: 20_000,
    });
    const readyBox = await archive.boundingBox();
    const headerBox = await archive.locator(".character-archive__header").boundingBox();
    const panelBox = await archive.locator(".character-archive__panels").boundingBox();
    const overflow = await archive.evaluate((node) => ({
      component: node.scrollWidth - node.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(headerBox?.height).toBeCloseTo(64, 0);
    expect(panelBox?.height).toBeCloseTo(566, 0);
    expect(Math.abs((readyBox?.height ?? 0) - (loadingBox?.height ?? 0))).toBeLessThanOrEqual(2);
    expect(overflow.component).toBeLessThanOrEqual(1);
    expect(overflow.page).toBeLessThanOrEqual(1);
  });
}

for (const viewport of [
  { width: 390, height: 844, avatarBudget: 8 },
  { width: 768, height: 1024, avatarBudget: 12 },
]) {
  test(`${viewport.width}px respects avatar, touch-target, and overflow budgets`, async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    const archive = await openHome(page, viewport.width, viewport.height);
    await page.waitForTimeout(300);
    const initialBox = await archive.boundingBox();
    if ((initialBox?.y ?? 0) > viewport.height + 400) {
      expect(birthdayPaths(requests)).toEqual([]);
    }

    await archive.scrollIntoViewIfNeeded();
    await expect(archive.locator('[data-birthday-data-state="ready"]')).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(300);
    const paths = birthdayPaths(requests);
    const avatars = new Set(paths.filter((path) => path.includes("/avatars/")));
    const monthButtonBoxes = await archive
      .locator("[data-archive-status-cassette] button")
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect()));
    const birthdayBox = await archive
      .locator("[data-birthday-node].has-birthday")
      .first()
      .boundingBox();
    const overflow = await archive.evaluate((node) => ({
      component: node.scrollWidth - node.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(avatars.size).toBeLessThanOrEqual(viewport.avatarBudget);
    expect(monthButtonBoxes.every((box) => box.width >= 44 && box.height >= 44)).toBe(true);
    expect(birthdayBox?.width).toBeGreaterThanOrEqual(44);
    expect(birthdayBox?.height).toBeGreaterThanOrEqual(44);
    expect(overflow.component).toBeLessThanOrEqual(1);
    expect(overflow.page).toBeLessThanOrEqual(1);
  });
}
