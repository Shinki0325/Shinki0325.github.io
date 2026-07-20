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
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
  await page.goto("/");
  await dismissSplashIfVisible(page);
  return page.locator("[data-character-archive]");
}

test("response HTML contains the real birthday archive with compact island props", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("data-character-archive");
  expect(html).toContain("data-birthday-node");

  const archive = await openArchive(page);
  await expect(archive.locator("[data-birthday-node]").first()).toBeVisible();
  const island = page.locator('astro-island[component-url*="CharacterArchiveTerminal"]');
  await expect(island).toHaveAttribute("client", "load");
  expect((await island.getAttribute("props"))?.length ?? Number.POSITIVE_INFINITY).toBeLessThan(2_000);
});

test("uses one shell with a birthday default and a deferred height view", async ({ page }) => {
  const heightRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/uploads/character-heights/")) heightRequests.push(request.url());
  });
  const archive = await openArchive(page);

  await expect(archive).toHaveCount(1);
  await expect(archive.getByRole("tab")).toHaveCount(2);
  await expect(archive.getByRole("tab", { name: "生日星图", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(archive.locator("[data-character-height-lineup]")).toHaveCount(0);
  expect(heightRequests).toHaveLength(0);

  const heightTab = archive.getByRole("tab").nth(1);
  await heightTab.focus();
  await expect.poll(() => heightRequests.length).toBeGreaterThan(0);
  expect(new Set(heightRequests).size).toBeLessThanOrEqual(8);

  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  await expect(archive.locator("[data-character-height-lineup]")).toBeVisible();
  await expect.poll(() => heightRequests.length).toBeGreaterThan(0);
  await expect(archive.locator("[data-height-character]")).toHaveCount(41);
  await expect(archive.locator("[data-roster-mark], [data-roster-window], .character-height__roster")).toHaveCount(0);
});

test("opens a 42-item height focus menu and dismisses it accessibly", async ({ page }) => {
  const archive = await openArchive(page);
  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  const trigger = archive.locator("[data-height-focus-trigger]");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toContainText("全员");
  await expect(trigger).toContainText("41");
  await trigger.click();
  const menu = archive.locator("[data-height-focus-menu]");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(42);
  await expect(menu.getByRole("menuitemradio", { name: /^全员/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  const menuItems = menu.getByRole("menuitemradio");
  await expect(menuItems.first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menuItems.nth(1)).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(menuItems.first()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toBeVisible();
  await archive.locator("[data-height-stage]").click({ position: { x: 120, y: 120 } });
  await expect(archive.locator("[data-height-focus-menu]")).toHaveCount(0);
});

test("focuses one calibrated standee, uses adjacent arrows, and restores the full roster scroll", async ({ page }) => {
  const archive = await openArchive(page);
  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  const track = archive.locator("[data-height-track]");
  await track.evaluate((node) => {
    node.scrollLeft = 1700;
    node.dispatchEvent(new Event("scroll"));
  });
  const fullScrollLeft = await track.evaluate((node) => node.scrollLeft);
  const trigger = archive.locator("[data-height-focus-trigger]");
  await trigger.click();
  await archive
    .locator("[data-height-focus-menu]")
    .getByRole("menuitemradio", { name: /希尔维娅.*165 CM/ })
    .click();

  await expect(archive.locator("[data-character-height-lineup]")).toHaveAttribute(
    "data-focus-id",
    "character-41",
  );
  await expect(archive.locator("[data-height-character]")).toHaveCount(1);
  await expect(archive.locator('[data-height-character="character-41"]')).toBeVisible();
  await expect(trigger).toContainText("希尔维娅");
  await expect(trigger).toContainText("165 CM");

  await archive.getByRole("button", { name: "查看较矮角色" }).click();
  await expect(archive.locator('[data-height-character="character-41"]')).toHaveCount(0);
  await expect(archive.locator("[data-height-character]")).toHaveCount(1);
  await expect(trigger).not.toContainText("希尔维娅");

  await trigger.click();
  await archive
    .locator("[data-height-focus-menu]")
    .getByRole("menuitemradio", { name: /^全员/ })
    .click();
  await expect(archive.locator("[data-height-character]")).toHaveCount(41);
  await expect(archive.locator("[data-character-height-lineup]")).toHaveAttribute(
    "data-focus-id",
    "",
  );
  expect(await track.evaluate((node) => node.scrollLeft)).toBeCloseTo(fullScrollLeft, 0);
});

test("preserves birthday state and height selection across tab switches", async ({ page }) => {
  const archive = await openArchive(page);
  await archive.getByRole("button", { name: /7月7日/ }).click();
  await archive.getByRole("button", { name: "下个月" }).click();
  await expect(archive.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-08",
  );

  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  const track = archive.locator("[data-height-track]");
  await track.evaluate((node) => {
    node.scrollLeft = 1800;
    node.dispatchEvent(new Event("scroll"));
  });
  const character = archive.locator('[data-height-character="character-20"]');
  await character.click();
  await expect(character).toHaveAttribute("aria-pressed", "true");
  const scrollLeft = await track.evaluate((node) => node.scrollLeft);

  await archive.getByRole("tab", { name: "生日星图", exact: true }).click();
  await expect(archive.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-08",
  );
  await expect(archive.locator("[data-selected-birthday-date]")).toHaveText("2026.07.07");

  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  await expect(character).toHaveAttribute("aria-pressed", "true");
  expect(await track.evaluate((node) => node.scrollLeft)).toBeCloseTo(scrollLeft, 0);
});

test("keeps the shell height and following article position stable between views", async ({ page }) => {
  const archive = await openArchive(page);
  const article = page.locator("[data-home-script-carousel]");
  const birthdayBox = await archive.boundingBox();
  const birthdayArticleTop = (await article.boundingBox())?.y ?? 0;

  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  const heightBox = await archive.boundingBox();
  const heightArticleTop = (await article.boundingBox())?.y ?? 0;

  expect(Math.abs((heightBox?.height ?? 0) - (birthdayBox?.height ?? 0))).toBeLessThanOrEqual(4);
  expect(Math.abs(heightArticleTop - birthdayArticleTop)).toBeLessThanOrEqual(4);
  await expect(archive.locator("[data-height-stage]")).toHaveCSS("height", "510px");
  await expect(archive.locator("[data-height-character]").first()).toHaveCSS("width", "168px");
});

test("restores the selected tab for the browser session", async ({ page }) => {
  let archive = await openArchive(page);
  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
  await page.reload();
  await dismissSplashIfVisible(page);
  archive = page.locator("[data-character-archive]");
  await expect(archive.getByRole("tab", { name: "身高图鉴", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("explicit archive query overrides the stored session tab", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
  await page.goto("/about/");
  await page.evaluate(() => {
    window.sessionStorage.setItem("blog:character-archive-view:v1", "height");
  });
  await page.goto("/?archive=birthday#character-archive");
  const archive = page.locator("[data-character-archive]");
  await expect(archive.getByRole("tab", { name: "生日星图", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect.poll(() =>
    page.evaluate(() => window.sessionStorage.getItem("blog:character-archive-view:v1")),
  ).toBe("birthday");

  await page.goto("/#character-archive");
  await expect(
    page.locator("[data-character-archive]").getByRole("tab", {
      name: "生日星图",
      exact: true,
    }),
  ).toHaveAttribute("aria-selected", "true");
});

for (const width of [1440, 736, 390]) {
  test(`${width}px archive has no document overflow in either view`, async ({ page }) => {
    const archive = await openArchive(page, width);
    const measureOverflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    expect(await measureOverflow()).toBeLessThanOrEqual(1);
    await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();
    expect(await measureOverflow()).toBeLessThanOrEqual(1);
  });
}

test("uses a stable command cassette in both archive views", async ({ page }) => {
  const archive = await openArchive(page);
  const header = archive.locator(".character-archive__header");
  const cassette = archive.locator("[data-archive-status-cassette]");
  const birthdayHeader = await header.boundingBox();
  const birthdayCassette = await cassette.boundingBox();

  await expect(archive.getByRole("tab", { name: "生日星图", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await archive.getByRole("tab", { name: "身高图鉴", exact: true }).click();

  const heightHeader = await header.boundingBox();
  const heightCassette = await cassette.boundingBox();
  expect(Math.abs((heightHeader?.height ?? 0) - (birthdayHeader?.height ?? 0))).toBeLessThanOrEqual(1);
  expect(Math.abs((heightCassette?.width ?? 0) - (birthdayCassette?.width ?? 0))).toBeLessThanOrEqual(2);
});
