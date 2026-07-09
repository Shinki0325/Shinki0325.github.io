import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1280, height: 900 },
});

await page.goto("http://127.0.0.1:4321/", {
  timeout: 10_000,
  waitUntil: "domcontentloaded",
});
await page.locator(".birthday-calendar").waitFor({ state: "visible", timeout: 10_000 });

const enter = page.getByRole("button", { name: "进入站点" });
if ((await enter.count()) === 1) {
  await enter.click();
}

await page.waitForTimeout(500);
await page.screenshot({
  fullPage: true,
  path: ".tmp/calendar-preview/home-calendar-card-dismissed.png",
});

const info = await page.evaluate(() => {
  const calendar = document.querySelector(".birthday-calendar");
  const header = document.querySelector(".birthday-calendar__header");
  const today = document.querySelector(".birthday-calendar__day.is-today");
  const navText = Array.from(document.querySelectorAll(".top-nav-links a")).map((anchor) =>
    anchor.textContent?.trim(),
  );
  const avatarOverflow = Array.from(document.querySelectorAll(".birthday-calendar__avatar")).some(
    (avatar) => {
      const day = avatar.closest(".birthday-calendar__day");
      if (!day) {
        return false;
      }

      const avatarRect = avatar.getBoundingClientRect();
      const dayRect = day.getBoundingClientRect();
      return (
        avatarRect.left < dayRect.left - 1 ||
        avatarRect.right > dayRect.right + 1 ||
        avatarRect.top < dayRect.top - 1 ||
        avatarRect.bottom > dayRect.bottom + 1
      );
    },
  );

  return {
    navText,
    hasBirthdayNav: navText.includes("生日历"),
    calendarRect: calendar?.getBoundingClientRect().toJSON(),
    headerRect: header?.getBoundingClientRect().toJSON(),
    title: calendar?.querySelector("h1")?.textContent?.trim(),
    todayText: today?.querySelector("time")?.textContent?.trim(),
    avatarOverflow,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
