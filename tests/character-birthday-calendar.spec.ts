import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");
  if (await splash.isVisible().catch(() => false)) {
    await splash.getByRole("button", { name: /YES|はい|进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

async function openCalendar(page: Parameters<typeof test>[0]["page"], width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.clock.setFixedTime(new Date("2026-07-14T12:00:00+08:00"));
  await page.goto("/");
  await dismissSplashIfVisible(page);
  return page.locator("[data-home-birthday-calendar]");
}

test("birthday constellation uses the approved fixed simplified shell", async ({ page }) => {
  const calendar = await openCalendar(page);

  await expect(calendar.getByRole("heading", { name: "角色生日星图", exact: true })).toBeVisible();
  await expect(calendar.getByText(
    /MONTH ROUTE|CHARACTER BIRTHDAY|BIRTHDAY FILE|ARCHIVE STATUS|W1|W2|章节路线|星图事件|TODAY/,
  )).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-mode]")).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-node]")).toHaveCount(31);
  await expect(calendar.locator("[data-birthday-month]")).toHaveText("2026.07");
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.14");
  await expect(calendar.locator('[data-birthday-node="14"]')).toHaveAttribute("aria-pressed", "true");
  await expect(calendar.getByRole("heading", { name: "角色生日星图" })).toHaveCSS(
    "font-family",
    /Noto Sans SC.*Microsoft YaHei.*sans-serif/,
  );
});

test("birthday nodes select a date and expose every related portrait", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.getByRole("button", { name: /7月7日/ }).click();

  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.07");
  await expect(calendar.locator("[data-birthday-detail-row]")).toHaveCount(5);
  await expect(calendar.locator('[data-birthday-node="7"] [data-primary-portrait]')).toHaveCount(1);
  await expect(calendar.locator('[data-birthday-node="7"] [data-support-portrait]')).toHaveCount(4);
  await expect(calendar.locator("[data-birthday-node].has-birthday")).toHaveCount(15);
});

test("birthday nodes preserve the approved reference geometry", async ({ page }) => {
  const calendar = await openCalendar(page);
  const console = calendar.locator(".birthday-constellation");
  const birthdayNode = calendar.locator('[data-birthday-node="7"]');
  const emptyNode = calendar.locator('[data-birthday-node="2"]');
  const primaryPortrait = birthdayNode.locator("[data-primary-portrait]");

  await expect(console).toHaveCSS("border-top-left-radius", "6px");
  await expect(birthdayNode).toHaveCSS("width", "48px");
  await expect(birthdayNode).toHaveCSS("height", "48px");
  await expect(emptyNode).toHaveCSS("width", "7px");
  await expect(emptyNode).toHaveCSS("height", "7px");
  await expect(primaryPortrait).toHaveCSS("width", "38px");
  await expect(primaryPortrait).toHaveCSS("height", "38px");
  await expect(birthdayNode.locator(".birthday-constellation__date")).toHaveText("07");
  await expect(calendar.locator("[data-birthday-weekday-label]")).toHaveCount(7);

  const centers = await birthdayNode.evaluate((node) => {
    const portrait = node.querySelector("[data-primary-portrait]");
    if (!(portrait instanceof HTMLElement)) return null;
    const nodeRect = node.getBoundingClientRect();
    const portraitRect = portrait.getBoundingClientRect();
    return {
      nodeX: nodeRect.left + nodeRect.width / 2,
      nodeY: nodeRect.top + nodeRect.height / 2,
      portraitX: portraitRect.left + portraitRect.width / 2,
      portraitY: portraitRect.top + portraitRect.height / 2,
    };
  });

  expect(centers).not.toBeNull();
  expect(Math.abs(centers!.portraitX - centers!.nodeX)).toBeLessThanOrEqual(1);
  expect(Math.abs(centers!.portraitY - centers!.nodeY)).toBeLessThanOrEqual(1);
});

test("support portraits expand fully on hover and keyboard focus", async ({ page }) => {
  const calendar = await openCalendar(page);
  const node = calendar.locator('[data-birthday-node="7"]');
  const portraits = node.locator("[data-support-portrait]");

  await expect(portraits.first()).toHaveCSS("width", "19px");
  await expect(portraits.first()).toHaveCSS("height", "19px");
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.14");

  const collapsed = await portraits.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect()),
  );
  expect(collapsed).toHaveLength(4);
  expect(collapsed.slice(1).every((rect, index) => rect.left < collapsed[index].right)).toBe(true);

  await node.hover();
  await expect(portraits.first()).toHaveCSS("width", "24px");
  await expect(portraits.first()).toHaveCSS("height", "24px");
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.14");
  await expect(calendar.locator('[data-birthday-week-track="1"]')).toHaveClass(/is-active/);
  await expect.poll(async () => {
    const expanded = await portraits.evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect()),
    );
    return expanded.slice(1).every((rect, index) => rect.left >= expanded[index].right + 1);
  }).toBe(true);

  await page.mouse.move(4, 4);
  await page.keyboard.press("Tab");
  await node.focus();
  await expect(node).toBeFocused();
  await expect.poll(async () => {
    const focused = await portraits.evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect()),
    );
    return focused.slice(1).every((rect, index) => rect.left >= focused[index].right + 1);
  }).toBe(true);
});

test("today is a highlighted node without labels or markers", async ({ page }) => {
  const calendar = await openCalendar(page);
  const today = calendar.locator("[data-birthday-today]");

  await expect(calendar.getByText(/TODAY|今日/)).toHaveCount(0);
  await expect(calendar.locator("[data-today-marker]")).toHaveCount(0);
  await expect(today).toHaveCSS("border-top-width", "2px");
  expect((await today.boundingBox())?.width).toBeGreaterThanOrEqual(16);
  expect(await today.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
});

test("month navigation preserves the pinned full date and restores its selected node", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.getByRole("button", { name: /7月7日/ }).click();
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.07");

  await calendar.getByRole("button", { name: "下个月" }).click();

  await expect(calendar.locator("[data-birthday-month]")).toHaveText("2026.08");
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.07");
  await expect(calendar.locator("[data-birthday-detail-row]")).toHaveCount(5);
  await expect(calendar.locator('[data-birthday-node][aria-pressed="true"]')).toHaveCount(0);

  await calendar.getByRole("button", { name: "上个月" }).click();
  await expect(calendar.locator('[data-birthday-node="7"]')).toHaveAttribute("aria-pressed", "true");

  await calendar.getByRole("button", { name: "下个月" }).click();
  await calendar.getByRole("button", { name: /8月8日/ }).click();
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.08.08");
  await expect(calendar.locator("[data-birthday-detail-row]")).toHaveCount(6);
  await expect(calendar.locator('[data-birthday-node="8"] [data-primary-portrait]')).toHaveCount(1);
  await expect(calendar.locator('[data-birthday-node="8"] [data-support-portrait]')).toHaveCount(5);
});

test("Bangumi navigation exists only in selected detail rows", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.getByRole("button", { name: /7月7日/ }).click();

  await expect(calendar.locator("[data-birthday-node] a")).toHaveCount(0);
  const detailLinks = calendar.locator("[data-birthday-detail-row] a");
  expect(await detailLinks.count()).toBeGreaterThan(0);
  await expect(detailLinks.first()).toHaveAttribute("target", "_blank");
  await expect(detailLinks.first()).toHaveAttribute("href", /bangumi\.tv\/character\//);
});

test("reduced motion keeps portraits and route visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const calendar = await openCalendar(page);
  const node = calendar.locator('[data-birthday-node="7"]');

  await expect(calendar.locator("[data-birthday-route]")).toBeVisible();
  await expect(node.locator("[data-primary-portrait]")).toBeVisible();
  await expect(node.locator("[data-support-portrait]")).toHaveCount(4);
  await expect(node.locator("[data-support-portrait]").first()).toHaveCSS("transition-duration", "0s");
});

for (const width of [736, 390]) {
  test(`${width}px constellation layout has no horizontal overflow`, async ({ page }) => {
    const calendar = await openCalendar(page, width);
    const overflow = await calendar.evaluate((node) => ({
      component: node.scrollWidth - node.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(overflow.component).toBeLessThanOrEqual(1);
    expect(overflow.page).toBeLessThanOrEqual(1);
  });
}
