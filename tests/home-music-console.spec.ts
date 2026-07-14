import { expect, test } from "@playwright/test";

async function dismissSplash(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");
  if (await splash.isVisible().catch(() => false)) {
    await splash.getByRole("button", { name: /YES|はい/i }).click();
    await expect(splash).toBeHidden();
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value() {
        Object.defineProperty(this, "duration", { configurable: true, get: () => 180 });
        this.dispatchEvent(new Event("loadedmetadata"));
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value() {
        Object.defineProperty(this, "paused", { configurable: true, get: () => false });
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value() {
        Object.defineProperty(this, "paused", { configurable: true, get: () => true });
        this.dispatchEvent(new Event("pause"));
      },
    });
  });
  await page.goto("/");
  await dismissSplash(page);
});

test("home music console keeps a stable three-zone layout", async ({ page }) => {
  const card = page.locator("[data-home-music-card]");
  const playlistTrigger = card.locator("[data-home-music-playlist-trigger]");
  const previous = card.getByRole("button", { name: "上一首" });
  const play = card.locator("[data-home-music-toggle]");
  const next = card.getByRole("button", { name: "下一首" });
  const mode = card.locator("[data-home-music-mode]");
  const volume = card.locator("[data-home-music-volume-trigger]");
  const boxes = await Promise.all(
    [playlistTrigger, previous, play, next, mode, volume].map((locator) => locator.boundingBox()),
  );
  for (const box of boxes) {
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  const centers = boxes.map((box) => (box?.x ?? 0) + (box?.width ?? 0) / 2);
  expect(centers[0]).toBeLessThan(centers[1]);
  expect(centers[1]).toBeLessThan(centers[2]);
  expect(centers[2]).toBeLessThan(centers[3]);
  expect(centers[3]).toBeLessThan(centers[4]);
  expect(centers[4]).toBeLessThan(centers[5]);

  const before = await card.boundingBox();
  await playlistTrigger.click();
  await expect(card.locator("[data-home-music-playlist]")).toHaveAttribute("data-open", "true");
  await expect(card.locator("[data-home-music-track]")).toHaveCount(17);
  const afterPlaylist = await card.boundingBox();
  expect(afterPlaylist?.width).toBe(before?.width);
  expect(afterPlaylist?.height).toBe(before?.height);

  await volume.click();
  await expect(card.locator("[data-home-music-playlist]")).toHaveAttribute("data-open", "false");
  await expect(card.locator("[data-home-music-volume]")).toHaveAttribute("data-open", "true");
  const panelBox = await card.locator("[data-home-music-volume]").boundingBox();
  const volumeRangeBox = await card.getByRole("slider", { name: "音量" }).boundingBox();
  expect(volumeRangeBox?.width ?? 0).toBeGreaterThanOrEqual(80);
  expect(volumeRangeBox?.width ?? 0).toBeGreaterThan(panelBox ? panelBox.width * 0.5 : 0);
  const afterVolume = await card.boundingBox();
  expect(afterVolume?.width).toBe(before?.width);
  expect(afterVolume?.height).toBe(before?.height);

  await page.keyboard.press("Escape");
  await expect(card.locator("[data-home-music-volume]")).toHaveAttribute("data-open", "false");
  await expect(volume).toBeFocused();

  await playlistTrigger.click();
  await mode.click();
  await expect(card.locator("[data-home-music-playlist]")).toHaveAttribute("data-open", "false");
});

test("panels dismiss outside and return focus from explicit close", async ({ page }) => {
  const card = page.locator("[data-home-music-card]");
  const playlistTrigger = card.locator("[data-home-music-playlist-trigger]");
  await playlistTrigger.click();
  await card.locator("[data-home-music-playlist]").getByRole("button", { name: "关闭播放列表" }).click();
  await expect(playlistTrigger).toBeFocused();

  const volumeTrigger = card.locator("[data-home-music-volume-trigger]");
  await volumeTrigger.click();
  await page.locator("[data-home-search]").click();
  await expect(card.locator("[data-home-music-volume]")).toHaveAttribute("data-open", "false");
});

test("playlist selection starts playback and remains open", async ({ page }) => {
  const card = page.locator("[data-home-music-card]");
  await card.locator("[data-home-music-playlist-trigger]").click();
  const selected = card.locator("[data-home-music-track]").nth(8);
  await selected.click();
  await expect(selected).toHaveAttribute("aria-current", "true");
  await expect(card.locator("[data-home-music-playlist]")).toHaveAttribute("data-open", "true");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
});

test("mode and volume preferences survive reload", async ({ page }) => {
  const card = page.locator("[data-home-music-card]");
  await card.locator("[data-home-music-mode]").click();
  await card.locator("[data-home-music-volume-trigger]").click();
  await card.getByRole("slider", { name: "音量" }).fill("42");
  await card.getByRole("button", { name: "静音" }).click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("blog:music-preferences:v1"))).toContain(
    '"volume":0.42',
  );
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("blog:music-preferences:v1"))).toContain(
    '"muted":true',
  );
  await page.reload();
  await dismissSplash(page);

  const reloaded = page.locator("[data-home-music-card]");
  await expect(reloaded.locator("[data-home-music-mode]")).toHaveAttribute(
    "aria-label",
    "切换为顺序播放",
  );
  await reloaded.locator("[data-home-music-volume-trigger]").click();
  await expect(reloaded.getByRole("slider", { name: "音量" })).toHaveValue("42");
  await expect(reloaded.getByRole("button", { name: "取消静音" })).toBeVisible();
  await expect(reloaded.locator("[data-home-music-volume] output")).toHaveText("0%");
});

test("home progress seeks through the shared runtime without changing playback state", async ({ page }) => {
  const card = page.locator("[data-home-music-card]");
  await card.locator("[data-home-music-toggle]").click();

  const progress = card.getByRole("slider", { name: "播放进度" });
  await expect(progress).toBeEnabled();
  await progress.fill("90");
  await progress.press("Tab");

  await expect(card.locator("[data-home-music-current-time]")).toHaveText("01:30");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
  await expect.poll(() => page.locator("[data-global-music-audio]").evaluate(
    (audio) => (audio as HTMLAudioElement).currentTime,
  )).toBe(90);

  await progress.focus();
  await progress.press("ArrowRight");
  await expect(card.locator("[data-home-music-current-time]")).toHaveText("01:31");
});

test("unavailable storage does not disable the console", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("storage disabled"); };
    Storage.prototype.setItem = () => { throw new Error("storage disabled"); };
  });
  await page.reload();
  await dismissSplash(page);
  const card = page.locator("[data-home-music-card]");
  await expect(card.locator("[data-home-music-playlist-trigger]")).toBeEnabled({ timeout: 15_000 });
  await expect(card.locator("[data-home-music-volume-trigger]")).toBeEnabled({ timeout: 15_000 });
  await expect(card.locator("[data-home-music-mode]")).toBeEnabled({ timeout: 15_000 });
});

test("reduced motion keeps panels static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await dismissSplash(page);
  const card = page.locator("[data-home-music-card]");
  await card.locator("[data-home-music-toggle]").click();
  await card.locator("[data-home-music-playlist-trigger]").click();
  const transitionDuration = await card.locator("[data-home-music-playlist]").evaluate(
    (node) => window.getComputedStyle(node).transitionDuration,
  );
  const animationName = await card.locator(".home-music-track.is-active i").first().evaluate(
    (node) => window.getComputedStyle(node).animationName,
  );
  expect(transitionDuration).toBe("0s");
  expect(animationName).toBe("none");
});
