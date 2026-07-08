import { expect, test } from "@playwright/test";

async function trackCloudMusicRequests(page: Parameters<typeof test>[0]["page"]) {
  let requestCount = 0;

  await page.route("https://api.injahow.cn/meting/**", async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ message: "cloud api should not be called" }),
    });
  });

  return () => requestCount;
}

async function stubMediaPlayback(page: Parameters<typeof test>[0]["page"]) {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value() {
        Object.defineProperty(this, "duration", {
          configurable: true,
          get: () => 180,
        });
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("pause"));
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value() {
        Object.defineProperty(this, "paused", {
          configurable: true,
          get: () => false,
        });
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value() {
        Object.defineProperty(this, "paused", {
          configurable: true,
          get: () => true,
        });
        this.dispatchEvent(new Event("pause"));
      },
    });
  });
}

async function dismissSplash(page: Parameters<typeof test>[0]["page"]) {
  const splash = page.locator("[data-splash-screen]");

  if (await splash.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /进入|开始|Enter/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("global player keeps playback across navigation and appears on inner pages", async ({ page }) => {
  await stubMediaPlayback(page);
  const getCloudMusicRequestCount = await trackCloudMusicRequests(page);

  await page.goto("/");
  await dismissSplash(page);

  await expect(page.locator("[data-floating-player]")).toBeHidden();
  await expect(page.locator("[data-home-music-card]")).toContainText("网易云歌曲 4931896");
  await expect(page.locator("[data-next-music-audio]")).toHaveAttribute("preload", "auto");
  await expect(page.locator("[data-next-music-audio]")).toHaveAttribute("src", /id=683914\.mp3$/);
  expect(getCloudMusicRequestCount()).toBe(0);

  await page.locator("[data-home-music-card]").getByRole("button", { name: /play|播放/i }).click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await page.locator('a[href="/references/"]').first().click();
  await expect(page).toHaveURL(/\/references\/$/);

  const floatingPlayer = page.locator("[data-floating-player]");
  await expect(floatingPlayer).toBeVisible();
  await expect(floatingPlayer).toHaveClass(/is-playing/);
  await expect(floatingPlayer).toContainText("网易云歌曲 4931896");
  await expect(floatingPlayer).toContainText("Ciallo");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await floatingPlayer.getByRole("button", { name: "下一首" }).click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
});
