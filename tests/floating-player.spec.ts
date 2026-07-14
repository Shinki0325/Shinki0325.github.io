import { expect, test } from "@playwright/test";

const FLOATING_PLAYER_COLLAPSED_KEY = "blog:floating-player-collapsed";

async function clearCollapsedPreference(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/");
  await page.evaluate((key) => window.localStorage.removeItem(key), FLOATING_PLAYER_COLLAPSED_KEY);
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
    await page.getByRole("button", { name: /YES|はい/i }).click();
    await expect(splash).toBeHidden();
  }
}

test("global player keeps playback across navigation and appears on inner pages", async ({ page }) => {
  await stubMediaPlayback(page);
  await page.addInitScript((key) => {
    Math.random = () => 0;
    window.localStorage.setItem(
      key,
      JSON.stringify({ volume: 0.42, muted: false, playbackMode: "shuffle" }),
    );
  }, "blog:music-preferences:v1");

  await page.goto("/");
  await dismissSplash(page);

  await expect(page.locator("[data-floating-player]")).toBeHidden();
  const homeTrackTitle = (await page.locator("[data-home-music-card] h2").textContent())?.trim() ?? "";
  const homeTrackArtist = (await page.locator("[data-home-music-card] p").textContent())?.trim() ?? "";
  expect(homeTrackTitle).not.toBe("");
  expect(homeTrackArtist).not.toBe("");

  await page.locator("[data-home-music-toggle]").click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await page.locator('a[href="/references/"]').first().click();
  await expect(page).toHaveURL(/\/references\/$/);

  const floatingPlayer = page.locator("[data-floating-player]");
  await expect(floatingPlayer).toBeVisible();
  await expect(floatingPlayer).toHaveClass(/is-playing/);
  await expect(floatingPlayer).toContainText(homeTrackTitle);
  await expect(floatingPlayer).toContainText(homeTrackArtist);
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute(
    "data-playback-mode",
    "shuffle",
  );
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-volume", "0.42");
  expect(await floatingPlayer.locator("[data-home-music-mode]").count()).toBe(0);
  expect(await floatingPlayer.locator("[data-home-music-volume-trigger]").count()).toBe(0);

  await floatingPlayer.locator(".floating-player__controls > button").last().click();
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");
  await expect(floatingPlayer.locator("[data-floating-player-title]")).toHaveText("get the regret over");

  await floatingPlayer.locator("[data-floating-player-collapse]").click();
  await expect(floatingPlayer).toHaveAttribute("data-floating-player-collapsed", "true");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await page.locator('a[href="/notes/"]').first().click();
  await expect(page).toHaveURL(/\/notes\/$/);
  await expect(floatingPlayer).toHaveAttribute("data-floating-player-collapsed", "true");
  await expect(page.locator("[data-global-music-audio]")).toHaveAttribute("data-playing", "true");

  await page.locator('a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(floatingPlayer).toBeHidden();
  await page.locator('a[href="/references/"]').first().click();
  await expect(page).toHaveURL(/\/references\/$/);
  await expect(floatingPlayer).toHaveAttribute("data-floating-player-collapsed", "true");
});

test("floating player collapses into the right edge and persists without exposing offscreen controls", async ({ page }) => {
  await clearCollapsedPreference(page);
  await page.evaluate((key) => window.localStorage.setItem(key, "invalid"), FLOATING_PLAYER_COLLAPSED_KEY);
  await page.goto("/references/");
  await dismissSplash(page);

  const shell = page.locator("[data-floating-player]");
  const body = page.locator("[data-floating-player-body]");
  const cover = page.locator(".floating-player__cover");
  const collapse = page.locator("[data-floating-player-collapse]");
  const restore = page.locator("[data-floating-player-restore]");

  await expect(shell).toHaveAttribute("data-floating-player-collapsed", "false");
  await expect(collapse).toBeVisible();

  await collapse.focus();
  await page.keyboard.press("Enter");
  await expect(shell).toHaveAttribute("data-floating-player-collapsed", "true");
  await expect(restore).toBeFocused();
  await expect(body).toHaveAttribute("aria-hidden", "true");
  expect(await body.evaluate((node) => (node as HTMLElement).inert)).toBe(true);
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), FLOATING_PLAYER_COLLAPSED_KEY))
    .toBe("true");

  await expect
    .poll(async () => {
      const viewportWidth = page.viewportSize()?.width ?? 0;
      const coverBox = await cover.boundingBox();
      if (!coverBox) return 0;
      return Math.min(viewportWidth, coverBox.x + coverBox.width) - Math.max(0, coverBox.x);
    })
    .toBeGreaterThanOrEqual(40);
  await expect
    .poll(async () => {
      const viewportWidth = page.viewportSize()?.width ?? 0;
      const coverBox = await cover.boundingBox();
      if (!coverBox) return Number.POSITIVE_INFINITY;
      return Math.min(viewportWidth, coverBox.x + coverBox.width) - Math.max(0, coverBox.x);
    })
    .toBeLessThanOrEqual(48);

  await page.reload();
  await expect(shell).toHaveAttribute("data-floating-player-collapsed", "true");
  await restore.focus();
  await page.keyboard.press("Enter");
  await expect(shell).toHaveAttribute("data-floating-player-collapsed", "false");
  await expect(collapse).toBeFocused();
  await expect(body).toHaveAttribute("aria-hidden", "false");
  expect(await body.evaluate((node) => (node as HTMLElement).inert)).toBe(false);
});

test("floating player collapse respects reduced motion and mobile viewport bounds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await clearCollapsedPreference(page);
  await page.goto("/references/");
  await dismissSplash(page);

  const shell = page.locator("[data-floating-player]");
  await shell.locator("[data-floating-player-collapse]").click();

  const transitionDuration = await shell.evaluate((node) => window.getComputedStyle(node).transitionDuration);
  expect(transitionDuration).toBe("0s");
  await expect(shell.locator("[data-floating-player-restore]")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const restoreBox = await shell.locator("[data-floating-player-restore]").boundingBox();
  expect(restoreBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(restoreBox?.height ?? 0).toBeGreaterThanOrEqual(44);
});
