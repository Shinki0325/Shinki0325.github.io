import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

async function openBirthdayOverflow(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const overflowButton = page.locator(".birthday-calendar__more").first();
  await expect(overflowButton).toBeVisible();
  await overflowButton.click();

  const strip = page.locator(".birthday-calendar__overflow-strip");
  await expect(strip).toBeVisible();

  return strip;
}

test("birthday overflow collapses when clicking outside the calendar", async ({ page }) => {
  await openBirthdayOverflow(page);

  await page.mouse.click(12, 12);

  await expect(page.locator(".birthday-calendar__overflow-strip")).toHaveCount(0);
  await expect(page.locator(".birthday-calendar__more").first()).toBeVisible();
});

test("expanded birthday avatars reveal their own tooltip from the visual center", async ({ page }) => {
  const strip = await openBirthdayOverflow(page);
  const avatars = strip.locator(".birthday-calendar__expanded-avatar");
  const avatarCount = await avatars.count();

  expect(avatarCount).toBeGreaterThan(1);

  for (let index = 0; index < avatarCount; index += 1) {
    const avatar = avatars.nth(index);
    const box = await avatar.boundingBox();
    const href = await avatar.getAttribute("href");

    expect(box).not.toBeNull();

    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await expect(avatar.locator(".birthday-calendar__tooltip")).toBeVisible();

    const elementHrefAtRightSide = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? null,
      {
        x: (box?.x ?? 0) + (box?.width ?? 0) * 0.78,
        y: (box?.y ?? 0) + (box?.height ?? 0) / 2,
      },
    );

    expect(elementHrefAtRightSide).toBe(href);
  }
});
