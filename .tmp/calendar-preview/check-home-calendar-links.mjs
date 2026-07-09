import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
});

await page.goto("http://127.0.0.1:4321/", {
  timeout: 10_000,
  waitUntil: "domcontentloaded",
});
await page.locator(".birthday-calendar").waitFor({ state: "visible", timeout: 10_000 });

const hrefs = await page.$$eval(".birthday-calendar__avatar", (links) =>
  links.map((link) => link.getAttribute("href")).filter(Boolean),
);
const unlinkedTitles = await page.$$eval(".birthday-calendar__avatar.is-unlinked", (nodes) =>
  nodes.map((node) => node.getAttribute("title")),
);

console.log(
  JSON.stringify(
    {
      checked: hrefs.length,
      sampleHrefs: hrefs.slice(0, 20),
      unlinkedTitles,
      allBangumi: hrefs.every((href) => href?.startsWith("https://bangumi.tv/character/")),
    },
    null,
    2,
  ),
);

await browser.close();
