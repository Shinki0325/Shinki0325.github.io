import { expect, test } from "@playwright/test";

async function dismissSplashIfVisible(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "YES はい" }).click();
    await expect(splash).toBeHidden();
  }
}

test("homepage shows the welcome shell and music modules", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-home-search]")).toBeVisible();
  await expect(page.locator("[data-home-hero]")).toBeVisible();
  await expect(page.locator("[data-home-profile-card]")).toBeVisible();
  await expect(page.locator("[data-home-music-card]")).toBeVisible();
  await expect(page.locator("[data-home-lyric-bar]")).toBeVisible();
  await expect(page.locator("[data-home-feature-grid]")).toBeVisible();
});

test("homepage uses the local looping video background without loading it on inner pages", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const backgroundVideo = page.locator("[data-home-background-video]");
  await expect(backgroundVideo).toBeVisible();
  await expect(backgroundVideo).toHaveAttribute("autoplay", "");
  await expect(backgroundVideo).toHaveAttribute("loop", "");
  await expect(backgroundVideo).toHaveAttribute("muted", "");
  await expect(backgroundVideo).toHaveAttribute("playsinline", "");
  await expect(backgroundVideo).toHaveAttribute("poster", "/uploads/backgrounds/home-loop-poster.jpg");
  await expect(backgroundVideo.locator("source").first()).toHaveAttribute("src", "/uploads/backgrounds/home-loop-1440p.mp4");

  await page.goto("/references/");
  await expect(page.locator("[data-home-background-video]")).toHaveCount(0);
});

test("homepage keeps static music metadata visible when a configured remote asset fails", async ({ page }) => {
  await page.route("https://api.injahow.cn/meting/**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ message: "remote music asset unavailable" }),
    });
  });

  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-home-music-card]")).toContainText("暁の祈り");
});

test("homepage hero matches the requested asymmetric profile layout", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator("[data-home-hero].glass-panel")).toHaveCount(0);
  await expect(page.locator(".home-identity-brand")).toHaveCount(0);
  await expect(page.locator(".home-hero-actions")).toHaveCount(0);
  await expect(page.locator(".home-stat-grid")).toHaveCount(1);
  await expect(page.locator(".home-stat-grid .home-stat-card")).toHaveCount(2);
  await expect(page.locator(".home-stat-grid")).toContainText("文稿");
  await expect(page.locator(".home-stat-grid")).toContainText("条目");
  await expect(page.locator(".home-social-row .home-social-button")).toHaveCount(3);
  await expect(page.locator('.home-social-row a[title="邮箱"]')).toHaveAttribute("href", /^mailto:/);

  const socialButtonMetrics = await page.locator(".home-social-row .home-social-button").first().evaluate((node) => {
    const styles = window.getComputedStyle(node);
    return {
      width: Number.parseFloat(styles.width),
      height: Number.parseFloat(styles.height),
    };
  });
  const profileRadius = await page.locator("[data-home-profile-card]").evaluate((node) =>
    Number.parseFloat(window.getComputedStyle(node).borderTopLeftRadius),
  );
  const [profileBox, musicBox] = await Promise.all([
    page.locator("[data-home-profile-card]").boundingBox(),
    page.locator("[data-home-music-card]").boundingBox(),
  ]);
  const musicTitleMetrics = await page.locator(".home-player-copy h2").evaluate((node) => {
    const styles = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    const height = node.getBoundingClientRect().height;

    return {
      height,
      lineHeight,
    };
  });

  expect(profileBox).not.toBeNull();
  expect(musicBox).not.toBeNull();
  expect((profileBox?.width ?? 0)).toBeGreaterThan((musicBox?.width ?? 0));
  expect(Math.abs((profileBox?.height ?? 0) - (musicBox?.height ?? 0))).toBeLessThanOrEqual(2);
  expect(profileRadius).toBeGreaterThanOrEqual(22);
  expect(socialButtonMetrics.width).toBeGreaterThanOrEqual(46);
  expect(socialButtonMetrics.width).toBeLessThanOrEqual(50);
  expect(socialButtonMetrics.height).toBeGreaterThanOrEqual(46);
  expect(socialButtonMetrics.height).toBeLessThanOrEqual(50);
  expect(musicTitleMetrics.height).toBeGreaterThan(0);
  expect(musicTitleMetrics.lineHeight).toBeGreaterThan(0);
  expect(musicTitleMetrics.height / musicTitleMetrics.lineHeight).toBeLessThanOrEqual(2.2);
});

test("homepage search and lower collage follow the reference shell without the old status strip", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const searchInput = page.locator("[data-home-search] input");
  const searchMetrics = await searchInput.evaluate((node) => {
    const styles = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height,
      radius: Number.parseFloat(styles.borderTopLeftRadius),
      background: styles.backgroundImage,
    };
  });

  expect(searchMetrics.width).toBeGreaterThanOrEqual(600);
  expect(searchMetrics.width).toBeLessThanOrEqual(700);
  expect(searchMetrics.height).toBeGreaterThanOrEqual(54);
  expect(searchMetrics.height).toBeLessThanOrEqual(62);
  expect(searchMetrics.radius).toBeGreaterThanOrEqual(26);
  expect(searchMetrics.background).toContain("linear-gradient");
  await expect(page.locator(".home-status-strip")).toHaveCount(0);
  await expect(page.locator("[data-home-reference-card]")).toBeVisible();
  await expect(page.locator("[data-home-reference-card]")).toContainText("运行回廊");
});

test("homepage head uses the current avatar as site icon", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  await expect(page.locator('head link[rel="icon"]')).toHaveAttribute(
    "href",
    "https://s1.ax1x.com/2023/07/28/pCx6j3R.jpg",
  );
  await expect(page.locator('head link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "https://s1.ax1x.com/2023/07/28/pCx6j3R.jpg",
  );
});

test("Chronicle home entry is one accessible archive save slot", async ({ page }) => {
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const entry = page.locator("[data-home-history-entry]");
  await expect(entry).toBeVisible();
  await expect(entry).toHaveAttribute("href", "/galgame-history/");
  await expect(entry).toContainText("GALGAME CHRONICLE");
  await expect(entry).toContainText("美少女游戏编年档案");
  await expect(entry).toContainText("1979-1999");
  await expect(entry).toContainText("100 FILES");
  await expect(entry).toContainText("59 STORY");
  await expect(entry).toContainText("41 BRANCH");
  await expect(entry.locator(".home-history-entry__eras > span")).toHaveCount(5);
  await expect(entry.locator(".home-history-entry__mini-track")).toHaveCount(3);
  await expect(entry.locator("a, button, input, select, textarea")).toHaveCount(0);
  await expect(entry.locator(".home-history-entry__mini-map")).toHaveAttribute("aria-hidden", "true");

  await entry.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(entry).toBeFocused();
  const outline = await entry.evaluate((node) => window.getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe("none");

  const focusedAnimations = await entry.locator(".home-history-entry__mini-track").evaluateAll((nodes) =>
    nodes.map((node) => window.getComputedStyle(node).animationName),
  );
  expect(focusedAnimations).toEqual(Array(3).fill("chronicle-entry-route-load"));

  await entry.evaluate((node) => (node as HTMLElement).blur());
  await entry.hover();
  const hoverAnimations = await entry.locator(".home-history-entry__mini-track").evaluateAll((nodes) =>
    nodes.map((node) => window.getComputedStyle(node).animationName),
  );
  expect(hoverAnimations).toEqual(focusedAnimations);
});

test("Chronicle save slot fits mobile with a three-plus-two era grid and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await dismissSplashIfVisible(page);

  const entry = page.locator("[data-home-history-entry]");
  await entry.focus();
  const eras = entry.locator(".home-history-entry__eras > span");
  await expect(eras).toHaveCount(5);
  const entryOverflow = await entry.evaluate((node) => ({
    fitsViewport: node.getBoundingClientRect().right <= window.innerWidth,
    hasInternalOverflow: node.scrollWidth > node.clientWidth,
  }));
  expect(entryOverflow).toEqual({ fitsViewport: true, hasInternalOverflow: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const positions = await eras.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
  expect(new Set(positions.slice(0, 3).map((position) => Math.round(position.top))).size).toBe(1);
  expect(new Set(positions.slice(3).map((position) => Math.round(position.top))).size).toBe(1);
  expect(positions[3]?.top ?? 0).toBeGreaterThan(positions[0]?.top ?? 0);

  const animations = await entry.locator(".home-history-entry__mini-track").evaluateAll((nodes) =>
    nodes.map((node) => window.getComputedStyle(node).animationName),
  );
  expect(animations.every((name) => name === "none")).toBe(true);
});

test("homepage splash appears once per session and stays dismissed after reload", async ({ page }) => {
  await page.goto("/");

  const splash = page.locator("[data-splash-screen]");
  await expect(splash).toBeVisible();

  await page.getByRole("button", { name: "YES はい" }).click();
  await expect(splash).toBeHidden();

  await page.reload();
  await expect(splash).toBeHidden();
});
