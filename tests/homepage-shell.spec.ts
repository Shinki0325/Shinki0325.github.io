import { expect, test } from "@playwright/test";

test("homepage shows the welcome shell and music modules", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-home-hero]")).toBeVisible();
  await expect(page.locator("[data-home-music-card]")).toBeVisible();
  await expect(page.locator("[data-home-lyric-bar]")).toBeVisible();
  await expect(page.locator("[data-home-feature-grid]")).toBeVisible();
});

test("homepage resolves remote lyric urls into visible lyric text", async ({ page }) => {
  await page.route("https://api.injahow.cn/meting/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get("type");

    if (type === "lrc") {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "[00:01.50]第一句\n[00:05.00]第二句",
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify([
        {
          id: requestUrl.searchParams.get("id") ?? "1809646618",
          name: "云月谣",
          artist: "兰音Reine",
          url: "https://cdn.example.com/song.mp3",
          pic: "https://cdn.example.com/cover.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1809646618",
        },
      ]),
    });
  });

  await page.goto("/");

  await expect(page.locator("[data-home-music-card]")).toContainText("云月谣");
  await expect(page.locator("[data-home-lyric-bar]")).toContainText("第一句");
});
