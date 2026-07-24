import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const curatedPath = "/references/pc-9801-computer-museum/";
const topicPath = "/references/galgame-90s-web-archive-package/";
const reviewOutput = process.env.REVIEW_OUTPUT;
const desktopViewports = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 1000 },
  { name: "1024", width: 1024, height: 1000 }
] as const;

const prepare = async (page: Page, path: string, width = 1440, height = 1000) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("blog-shell-splash-dismissed", "true");
    localStorage.setItem("blog-shell-character-rail-open", "true");
  });
  await page.setViewportSize({ width, height });
  return page.goto(path, { waitUntil: "domcontentloaded" });
};

const box = async (locator: ReturnType<Page["locator"]>) => {
  const rect = await locator.boundingBox();
  expect(rect).not.toBeNull();
  return rect!;
};

const intersects = (left: Awaited<ReturnType<typeof box>>, right: Awaited<ReturnType<typeof box>>) =>
  left.x < right.x + right.width &&
  left.x + left.width > right.x &&
  left.y < right.y + right.height &&
  left.y + left.height > right.y;

test("source route contract uses Focus Reading while topic keeps its existing composition", async ({ page }) => {
  const response = await prepare(page, curatedPath);
  expect(response?.status()).toBe(200);

  await expect(page.locator("[data-reference-source-page]")).toHaveCount(1);
  await expect(page.locator("[data-reference-index-trigger]")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("dialog[data-reference-index]")).toHaveCount(1);
  expect(await page.locator("[data-reference-route-prev], [data-reference-route-next]").count()).toBeGreaterThan(0);

  await page.goto(topicPath, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-reference-source-page]")).toHaveCount(0);
  await expect(page.locator("article.entry-shell h1")).toContainText("90年代 galgame 网页归档资料包");
});

test("drawer close paths restore focus and preserve reading geometry", async ({ page }) => {
  await prepare(page, curatedPath);
  const trigger = page.locator("[data-reference-index-trigger]");
  const dialog = page.locator("dialog[data-reference-index]");
  const reading = page.locator(".reference-source__reading-plane");

  await page.evaluate(() => window.scrollTo({ top: 420, behavior: "instant" }));
  const initialScroll = await page.evaluate(() => window.scrollY);
  const initialBox = await box(reading);

  await trigger.click();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(Math.abs((await box(reading)).x - initialBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs((await box(reading)).width - initialBox.width)).toBeLessThanOrEqual(1);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialScroll)).toBeLessThanOrEqual(1);

  await dialog.locator("[data-reference-index-close]").click();
  await expect(dialog).not.toHaveJSProperty("open", true);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveJSProperty("open", true);
  await expect(trigger).toBeFocused();

  await trigger.click();
  const dialogBox = await box(dialog);
  await page.mouse.click(dialogBox.x + 20, dialogBox.y + 200);
  await expect(dialog).not.toHaveJSProperty("open", true);
  await expect(trigger).toBeFocused();
});

test("progress and ClientRouter re-entry stay idempotent", async ({ page }) => {
  await prepare(page, curatedPath);
  const progress = page.locator("[data-reference-progress-value]");
  await expect(progress).toHaveText("0%");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => Number((await progress.textContent())?.replace("%", ""))).toBeGreaterThan(50);

  const next = page.locator("[data-reference-route-next]");
  const nextHref = await next.getAttribute("href");
  expect(nextHref).toBeTruthy();
  await next.click();
  await page.waitForURL((url) => url.pathname === nextHref);
  await expect(page.locator("[data-reference-source-page]")).toHaveCount(1);

  const trigger = page.locator("[data-reference-index-trigger]");
  const dialog = page.locator("dialog[data-reference-index]");
  await trigger.click();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(page.locator("dialog[data-reference-index]:modal")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveJSProperty("open", true);
  await expect(trigger).toBeFocused();
});

for (const viewport of desktopViewports) {
  test(`${viewport.name}px Focus Reading geometry, overlay, and shell stay stable`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    const failedImages: string[] = [];
    const requests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    page.on("response", (response) => {
      if (response.request().resourceType() === "image" && response.status() >= 400) failedImages.push(response.url());
    });

    const response = await prepare(page, curatedPath, viewport.width, viewport.height);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("load");

    const root = page.locator("[data-reference-source-page]");
    const dossier = root.locator(".reference-source__dossier");
    const reading = root.locator(".reference-source__reading-plane");
    const bodyCopy = root.locator(".reference-source__intro > p:last-child");
    const trigger = root.locator("[data-reference-index-trigger]");
    const dialog = root.locator("dialog[data-reference-index]");
    const rootBox = await box(root);
    const readingBox = await box(reading);
    const dossierBox = await box(dossier);

    expect(readingBox.y).toBeLessThan(viewport.height);
    expect(readingBox.width / rootBox.width).toBeGreaterThanOrEqual(0.78);
    if (viewport.width === 1024) expect(readingBox.width).toBeGreaterThanOrEqual(759);
    expect(dossierBox.height).toBeLessThanOrEqual(180);

    const typography = await bodyCopy.evaluate((node) => {
      const style = getComputedStyle(node);
      return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight) };
    });
    expect(typography.fontSize).toBeGreaterThanOrEqual(16);
    expect(typography.lineHeight / typography.fontSize).toBeGreaterThanOrEqual(1.75);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(await reading.locator("p, h2, strong").evaluateAll((nodes) =>
      nodes.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).length
    )).toBe(0);

    if (reviewOutput) {
      await mkdir(reviewOutput, { recursive: true });
      await page.screenshot({ fullPage: true, path: `${reviewOutput}/reference-source-curated-closed-${viewport.name}.png` });
    }

    const attachmentRequestsBeforeOpen = requests.filter((url) => url.includes("/uploads/galgame-90s-web-archive/") && /\.(png|jpe?g|webp)$/i.test(url)).length;
    const beforeOpen = await box(reading);
    await trigger.click();
    await expect(dialog).toHaveJSProperty("open", true);
    const afterOpen = await box(reading);
    expect(Math.abs(afterOpen.x - beforeOpen.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(afterOpen.width - beforeOpen.width)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    const player = page.locator("[data-floating-player]");
    if (await player.isVisible()) {
      expect(intersects(await box(player), await box(dialog.locator("[data-reference-index-close]")))).toBe(false);
    }
    if (reviewOutput) await page.screenshot({ path: `${reviewOutput}/reference-source-curated-open-${viewport.name}.png` });
    await dialog.locator("[data-reference-index-close]").click();
    await expect(trigger).toBeFocused();

    const route = root.locator(".reference-source__route-strip");
    await route.scrollIntoViewIfNeeded();
    if (await player.isVisible()) expect(intersects(await box(player), await box(route))).toBe(false);
    if (reviewOutput) await page.screenshot({ path: `${reviewOutput}/reference-source-bottom-${viewport.name}.png` });

    await page.goto(topicPath, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-reference-source-page]")).toHaveCount(0);
    await expect(page.locator("article.entry-shell h1")).toBeVisible();
    if (reviewOutput) await page.screenshot({ fullPage: true, path: `${reviewOutput}/reference-topic-boundary-${viewport.name}.png` });

    expect(runtimeErrors).toEqual([]);
    expect(failedImages).toEqual([]);
    if (viewport.width === 1440) {
      const origins = [...new Set(requests.map((url) => new URL(url).origin))].sort();
      const attachmentRequestsAfterOpen = requests.filter((url) => url.includes("/uploads/galgame-90s-web-archive/") && /\.(png|jpe?g|webp)$/i.test(url)).length;
      console.log("NETWORK reference source " + JSON.stringify({ origins, requests: requests.length, attachmentRequestsBeforeOpen, attachmentRequestsAfterOpen }));
    }
  });
}
