import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");
  if (await splash.isVisible().catch(() => false)) {
    await splash.getByRole("button", { name: /YES|はい|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

async function openArchive(page: Parameters<typeof test>[0]["page"], width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.clock.setFixedTime(new Date("2026-07-14T12:00:00+08:00"));
  await page.goto("/");
  await dismissSplashIfVisible(page);
  return page.locator("[data-character-archive]");
}

test("uses one shell with a birthday default and a deferred height view", async ({ page }) => {
  const heightRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/uploads/character-heights/")) heightRequests.push(request.url());
  });
  const archive = await openArchive(page);

  await expect(archive).toHaveCount(1);
  await expect(archive.getByRole("tab")).toHaveCount(2);
  await expect(archive.getByRole("tab", { name: "角色生日星图" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(archive.locator("[data-character-height-lineup]")).toHaveCount(0);
  expect(heightRequests).toHaveLength(0);

  await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
  await expect(archive.locator("[data-character-height-lineup]")).toBeVisible();
  await expect.poll(() => heightRequests.length).toBeGreaterThan(0);
  await expect(archive.locator("[data-height-character]")).toHaveCount(41);
  await expect(archive.locator("[data-roster-mark]")).toHaveCount(41);
});

test("preserves birthday state and height selection across tab switches", async ({ page }) => {
  const archive = await openArchive(page);
  await archive.getByRole("button", { name: /7月7日/ }).click();
  await archive.getByRole("button", { name: "下个月" }).click();
  await expect(archive.locator("[data-birthday-month]")).toHaveText("2026.08");

  await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
  const track = archive.locator("[data-height-track]");
  await track.evaluate((node) => {
    node.scrollLeft = 1800;
    node.dispatchEvent(new Event("scroll"));
  });
  const character = archive.locator('[data-height-character="character-20"]');
  await character.click();
  await expect(character).toHaveAttribute("aria-pressed", "true");
  const scrollLeft = await track.evaluate((node) => node.scrollLeft);

  await archive.getByRole("tab", { name: "角色生日星图" }).click();
  await expect(archive.locator("[data-birthday-month]")).toHaveText("2026.08");
  await expect(archive.locator("[data-selected-birthday-date]")).toHaveText("2026.07.07");

  await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
  await expect(character).toHaveAttribute("aria-pressed", "true");
  expect(await track.evaluate((node) => node.scrollLeft)).toBeCloseTo(scrollLeft, 0);
});

test("keeps the shell height and following article position stable between views", async ({ page }) => {
  const archive = await openArchive(page);
  const article = page.locator("[data-home-script-carousel]");
  const birthdayBox = await archive.boundingBox();
  const birthdayArticleTop = (await article.boundingBox())?.y ?? 0;

  await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
  const heightBox = await archive.boundingBox();
  const heightArticleTop = (await article.boundingBox())?.y ?? 0;

  expect(Math.abs((heightBox?.height ?? 0) - (birthdayBox?.height ?? 0))).toBeLessThanOrEqual(4);
  expect(Math.abs(heightArticleTop - birthdayArticleTop)).toBeLessThanOrEqual(4);
  await expect(archive.locator("[data-height-stage]")).toHaveCSS("height", "510px");
  await expect(archive.locator("[data-height-character]").first()).toHaveCSS("width", "168px");
});

test("restores the selected tab for the browser session", async ({ page }) => {
  let archive = await openArchive(page);
  await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
  await page.reload();
  await dismissSplashIfVisible(page);
  archive = page.locator("[data-character-archive]");
  await expect(archive.getByRole("tab", { name: "角色身高图鉴" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

for (const width of [1440, 736, 390]) {
  test(`${width}px archive has no document overflow in either view`, async ({ page }) => {
    const archive = await openArchive(page, width);
    const measureOverflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    expect(await measureOverflow()).toBeLessThanOrEqual(1);
    await archive.getByRole("tab", { name: "角色身高图鉴" }).click();
    expect(await measureOverflow()).toBeLessThanOrEqual(1);
  });
}
