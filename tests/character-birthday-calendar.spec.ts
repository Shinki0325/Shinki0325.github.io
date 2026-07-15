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

  await expect(calendar.getByRole("tab", { name: "生日星图", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(calendar.getByText(
    /MONTH ROUTE|CHARACTER BIRTHDAY|BIRTHDAY FILE|ARCHIVE STATUS|W1|W2|章节路线|星图事件|TODAY/,
  )).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-mode]")).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-node]")).toHaveCount(31);
  await expect(calendar.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-07",
  );
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText("2026.07.14");
  await expect(calendar.locator('[data-birthday-node="14"]')).toHaveAttribute("aria-pressed", "true");
  await expect(calendar.getByRole("heading", { name: "角色生日星图" })).toHaveCount(0);
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

test("replaces the empty prose with one previous and one next birthday route", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.getByRole("button", { name: /7月8日/ }).click();

  await expect(calendar.getByText("无生日事件")).toHaveCount(0);
  await expect(calendar.getByText("路线坐标保留，当前日期没有生日条目")).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-neighbor-route]")).toHaveAttribute(
    "data-density",
    "expanded",
  );
  await expect(calendar.locator('[data-birthday-neighbor="previous"]')).toHaveCount(1);
  await expect(calendar.locator('[data-birthday-neighbor="next"]')).toHaveCount(1);
  await expect(calendar.locator("[data-birthday-neighbor-current]")).toContainText("无记录");
});

test("neighbor navigation updates the browsed month and pinned full date together", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.getByRole("button", { name: /7月31日/ }).click();
  const next = calendar.locator('[data-birthday-neighbor="next"]');
  const destination = await next.getAttribute("data-neighbor-date");
  expect(destination).not.toBeNull();

  await next.click();
  await expect(calendar.locator("[data-selected-birthday-date]")).toHaveText(
    destination!.replaceAll("-", "."),
  );
  await expect(calendar.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    destination!.slice(0, 7),
  );
});

test("keeps one solid birthday route beneath a separate month scan", async ({ page }) => {
  const calendar = await openCalendar(page);
  const base = calendar.locator(".birthday-constellation__track");
  const scan = calendar.locator("[data-birthday-route-scan]");

  await expect(base).toHaveCount(1);
  await expect(scan).toHaveCount(1);
  await expect(base).toHaveAttribute("d", /M .+ L/);
  const basePath = await base.getAttribute("d");
  expect(basePath).not.toBeNull();
  await expect(scan).toHaveAttribute("d", basePath!);
  expect(await base.evaluate((node) => getComputedStyle(node).strokeDasharray)).toBe("none");
  expect(await base.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  await expect(scan).toHaveCSS("animation-duration", "0.4s");
  await expect(scan).toHaveCSS("animation-iteration-count", "1");
});

test("keeps neighbor date node and copy in separate tracks", async ({ page }) => {
  const calendar = await openCalendar(page);
  await calendar.locator('[data-birthday-node="8"]').click();

  for (const direction of ["previous", "next"] as const) {
    const row = calendar.locator(`[data-birthday-neighbor="${direction}"]`);
    const date = row.locator("[data-neighbor-date-track]");
    const node = row.locator("[data-neighbor-node-track]");
    const copy = row.locator("[data-neighbor-copy-track]");
    const [dateBox, nodeBox, copyBox] = await Promise.all([
      date.boundingBox(),
      node.boundingBox(),
      copy.boundingBox(),
    ]);

    expect((dateBox?.x ?? 0) + (dateBox?.width ?? 0)).toBeLessThanOrEqual(nodeBox?.x ?? 0);
    expect((nodeBox?.x ?? 0) + (nodeBox?.width ?? 0) + 8).toBeLessThanOrEqual(copyBox?.x ?? 0);
  }

  const current = calendar.locator("[data-birthday-neighbor-current]");
  await expect(current).not.toContainText("2026.07.08");
  await expect(current).toContainText("当前");
  await expect(current).toContainText("无记录");
});

test("renders one compact monthly sky badge outside the calendar stage", async ({ page }) => {
  const calendar = await openCalendar(page);
  const badge = calendar.locator("[data-birthday-sky-badge]");
  const stage = calendar.locator(".birthday-constellation__stage");

  await expect(badge).toHaveCount(1);
  await expect(badge).toHaveAttribute("data-sky-badge-month", "7");
  await expect(badge).toHaveAttribute("aria-label", "七月 · 夏季大三角");
  await expect(badge.locator("[data-sky-badge-month-label]")).toHaveText("07");
  await expect(badge).not.toContainText("七月 · 夏季大三角");
  await expect(badge.locator("xpath=ancestor::button[@role='tab']")).toHaveAttribute(
    "id",
    "character-archive-tab-birthday",
  );
  await expect(badge.locator("svg")).toHaveCount(1);
  expect(await badge.locator("circle").count()).toBeGreaterThanOrEqual(3);
  expect(await badge.locator("circle").count()).toBeLessThanOrEqual(4);
  expect(await badge.locator("line").count()).toBeGreaterThanOrEqual(2);
  const badgeBox = await badge.boundingBox();
  expect(badgeBox?.width).toBeGreaterThanOrEqual(24);
  expect(badgeBox?.width).toBeLessThanOrEqual(28);
  expect(badgeBox?.height).toBeGreaterThanOrEqual(24);
  expect(badgeBox?.height).toBeLessThanOrEqual(28);
  await expect(stage.locator("[data-birthday-monthly-sky]")).toHaveCount(0);
  await expect(stage.locator("[data-birthday-sky-badge]")).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-star-effects]")).toHaveCount(0);

  for (let month = 8; month <= 12; month += 1) {
    await calendar.getByRole("button", { name: "下个月" }).click();
  }
  await expect(badge).toHaveAttribute("data-sky-badge-month", "12");
  await expect(badge).toHaveAttribute("aria-label", "十二月 · 猎户座");
  await expect(badge.locator("[data-sky-badge-month-label]")).toHaveText("12");
  await expect(badge).not.toContainText("十二月 · 猎户座");
});

test("selection pulses only the existing local focus path", async ({ page }) => {
  const calendar = await openCalendar(page);
  const scan = calendar.locator("[data-birthday-route-scan]");
  const pulse = calendar.locator("[data-birthday-selection-pulse]");
  await page.waitForTimeout(500);
  await expect(scan).toHaveCSS("animation-name", "birthday-route-scan");
  const scanStartTime = await scan.evaluate((node) => node.getAnimations()[0]?.startTime);

  await calendar.locator('[data-birthday-node="7"]').click();
  await expect(pulse).toHaveAttribute("d", /M .+ L/);
  await expect(pulse).toHaveCSS("animation-duration", "0.18s");
  expect(await scan.evaluate((node) => node.getAnimations()[0]?.startTime)).toBe(scanStartTime);
});

test("uses readable compact neighbor tracks at 736px", async ({ page }) => {
  const calendar = await openCalendar(page, 736);
  await calendar.locator('[data-birthday-node="8"]').click();
  const route = calendar.locator('[data-birthday-neighbor-route]');
  const currentCopy = route.locator('.birthday-neighbor-route__current-copy');

  expect(
    await route.evaluate((node) => {
      const style = getComputedStyle(node);
      return [
        style.getPropertyValue('--neighbor-date-track').trim(),
        style.getPropertyValue('--neighbor-node-track').trim(),
        style.getPropertyValue('--neighbor-track-gap').trim(),
      ];
    }),
  ).toEqual(["40px", "52px", "6px"]);
  await expect(currentCopy).toHaveCSS("white-space", "nowrap");

  const copyMetrics = await currentCopy.evaluate((node) => {
    const style = getComputedStyle(node);
    const strong = node.querySelector("strong")!;
    const small = node.querySelector("small")!;
    const strongStyle = getComputedStyle(strong);
    const smallStyle = getComputedStyle(small);
    const strongRange = document.createRange();
    const smallRange = document.createRange();
    strongRange.selectNodeContents(strong);
    smallRange.selectNodeContents(small);
    return {
      height: node.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(style.lineHeight),
      smallHeight: small.getBoundingClientRect().height,
      smallLineHeight: Number.parseFloat(smallStyle.lineHeight),
      smallTextLines: smallRange.getClientRects().length,
      strongHeight: strong.getBoundingClientRect().height,
      strongLineHeight: Number.parseFloat(strongStyle.lineHeight),
      strongTextLines: strongRange.getClientRects().length,
      width: node.getBoundingClientRect().width,
    };
  });
  expect(copyMetrics.height).toBeLessThanOrEqual(copyMetrics.lineHeight * 1.25);
  expect(copyMetrics.strongHeight).toBeLessThanOrEqual(copyMetrics.strongLineHeight * 1.25);
  expect(copyMetrics.smallHeight).toBeLessThanOrEqual(copyMetrics.smallLineHeight * 1.25);
  expect(copyMetrics.strongTextLines).toBe(1);
  expect(copyMetrics.smallTextLines).toBe(1);
  expect(copyMetrics.width).toBeGreaterThanOrEqual(56);

  const neighborNameWidth = await route
    .locator('[data-birthday-neighbor="previous"] .birthday-neighbor-route__copy strong')
    .evaluate((node) => node.getBoundingClientRect().width);
  await expect(
    route.locator('[data-birthday-neighbor="previous"] .birthday-neighbor-route__copy'),
  ).toHaveCSS("flex-direction", "column");
  await expect(currentCopy).toHaveCSS("flex-direction", "row");
  expect(neighborNameWidth).toBeGreaterThanOrEqual(56);
});

test("keeps the monthly badge compact on responsive headers", async ({ page }) => {
  const calendar = await openCalendar(page, 736);
  const badge = calendar.locator("[data-birthday-sky-badge]");
  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS("width", "26px");
  await expect(badge).toHaveCSS("height", "26px");
  await expect(calendar.locator("[data-birthday-monthly-sky]")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS("width", "26px");
  await expect(badge).toHaveCSS("height", "26px");
  await expect(calendar.locator("[data-birthday-monthly-sky]")).toHaveCount(0);
});

test("birthday nodes preserve the approved reference geometry", async ({ page }) => {
  const calendar = await openCalendar(page);
  const console = calendar.locator(".birthday-constellation");
  const birthdayNode = calendar.locator('[data-birthday-node="7"]');
  const emptyNode = calendar.locator('[data-birthday-node="2"]');
  const primaryPortrait = birthdayNode.locator("[data-primary-portrait]");

  await expect(calendar.locator("[data-character-archive]")).toHaveCSS(
    "border-top-left-radius",
    "5px",
  );
  await expect(console).toHaveCSS("border-top-left-radius", "0px");
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

  await expect(calendar.locator("[data-birthday-month]")).toHaveAttribute(
    "data-month-key",
    "2026-08",
  );
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
  await expect(calendar.locator("[data-birthday-monthly-sky]")).toHaveCount(0);
  await expect(calendar.locator("[data-birthday-sky-badge]")).toBeVisible();
  await expect(calendar.locator(".birthday-constellation__route-scan")).toHaveCSS(
    "animation-duration",
    "0s",
  );
  await calendar.locator('[data-birthday-node="7"]').click();
  await expect(calendar.locator("[data-birthday-selection-pulse]")).toHaveCSS(
    "animation-duration",
    "0s",
  );
});

test("adapts the local route without changing inspector dimensions", async ({ page }) => {
  const calendar = await openCalendar(page);
  const detail = calendar.locator(".birthday-constellation__detail");
  const initialBox = await detail.boundingBox();

  await calendar.getByRole("button", { name: /7月8日/ }).click();
  await expect(calendar.locator("[data-birthday-neighbor-route]")).toHaveAttribute(
    "data-density",
    "expanded",
  );

  await calendar.locator('[data-birthday-node][aria-label*="1位角色生日"]').first().click();
  await expect(calendar.locator("[data-birthday-neighbor-route]")).toHaveAttribute(
    "data-density",
    "compact",
  );

  await calendar.getByRole("button", { name: /7月7日/ }).click();
  await expect(calendar.locator("[data-birthday-neighbor-route]")).toHaveAttribute(
    "data-density",
    "strip",
  );

  const finalBox = await detail.boundingBox();
  expect(Math.abs((finalBox?.height ?? 0) - (initialBox?.height ?? 0))).toBeLessThanOrEqual(1);
});

test("hover and keyboard focus light only the local route around a node", async ({ page }) => {
  const calendar = await openCalendar(page);
  const node = calendar.locator('[data-birthday-node="7"]');
  const focusTrack = calendar.locator(".birthday-constellation__focus-track");

  await node.hover();
  await expect(focusTrack).toHaveAttribute("d", /M .+ L/);
  await node.focus();
  await expect(node).toBeFocused();
  await expect(focusTrack).toHaveAttribute("d", /M .+ L/);
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
