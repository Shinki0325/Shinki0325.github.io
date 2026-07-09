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
  await enter.click({ force: true });
  await page.locator(".splash-screen__backdrop").waitFor({
    state: "hidden",
    timeout: 10_000,
  }).catch(() => undefined);
}

const overflowButton = page.locator(".birthday-calendar__more").filter({ hasText: "+2" });
await overflowButton.waitFor({ state: "visible", timeout: 10_000 });
await page.evaluate(() => {
  const button = Array.from(document.querySelectorAll(".birthday-calendar__more")).find(
    (element) => element.textContent?.trim() === "+2",
  );
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Expected +2 overflow button");
  }
  button.click();
});
await page.locator(".birthday-calendar__overflow-strip").waitFor({
  state: "visible",
  timeout: 10_000,
});

await page.screenshot({
  fullPage: true,
  path: ".tmp/calendar-preview/home-calendar-overflow-open.png",
});

const info = await page.evaluate(() => {
  const strip = document.querySelector(".birthday-calendar__overflow-strip");
  const links = Array.from(document.querySelectorAll(".birthday-calendar__overflow-strip a"));

  return {
    stripVisible: Boolean(strip),
    hiddenCharacterCount: links.length,
    hiddenCharacterHrefs: links.map((link) => link.getAttribute("href")),
    hiddenCharacterTooltips: links.map((link) => ({
      name: link.querySelector(".birthday-calendar__tooltip strong")?.textContent?.trim(),
      work: link.querySelector(".birthday-calendar__tooltip small")?.textContent?.trim(),
    })),
    allHiddenLinksUseBangumi: links.every((link) =>
      link.getAttribute("href")?.startsWith("https://bangumi.tv/character/"),
    ),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
