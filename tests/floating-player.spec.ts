import { expect, test } from "@playwright/test";

async function stubCloudMusic(page: Parameters<typeof test>[0]["page"]) {
  await page.route("https://api.injahow.cn/meting/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get("type");

    if (type === "lrc") {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "[00:00.00]暁の祈り\n[00:00.00]晓愿\n[00:05.00]second line",
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify([
        {
          id: requestUrl.searchParams.get("id") ?? "1809646618",
          name: "Test Track",
          artist: "Test Artist",
          url: `https://cdn.example.com/song-${requestUrl.searchParams.get("id") ?? "1809646618"}.mp3`,
          pic: "https://cdn.example.com/cover.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1809646618",
        },
      ]),
    });
  });
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
  await stubCloudMusic(page);

  await page.goto("/");
  await dismissSplash(page);

  await expect(page.locator("[data-floating-player]")).toBeHidden();
  await expect(page.locator("[data-home-music-card]")).toContainText("Test Track");
  await expect(page.locator("[data-next-music-audio]")).toHaveAttribute("preload", "auto");
  await expect(page.locator("[data-next-music-audio]")).toHaveAttribute("src", /song-683914\.mp3$/);

  await page.locator("[data-home-music-card]").getByRole("button", { name: /play|播放/i }).click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await page.locator('a[href="/references/"]').first().click();
  await expect(page).toHaveURL(/\/references\/$/);

  const floatingPlayer = page.locator("[data-floating-player]");
  await expect(floatingPlayer).toBeVisible();
  await expect(floatingPlayer).toHaveClass(/is-playing/);
  await expect(floatingPlayer).toContainText("Test Track");
  await expect(floatingPlayer).toContainText("暁の祈り");
  await expect(floatingPlayer).not.toContainText("晓愿");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await floatingPlayer.getByRole("button", { name: "下一首" }).click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
});
