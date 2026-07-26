import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const curatedPath = "/references/jpnic-pccomm-internet-interconnect/";
const legacyPath = "/references/player-games-1990-2003/";
const chapteredPath = "/references/baba-visualarts-interview/";
const singleChapterPath = "/references/takeru-official-history/";
const topicPath = "/references/galgame-90s-web-archive-package/";
const reviewOutput = process.env.REVIEW_OUTPUT;
const chapterSoakMs = Number(process.env.REFERENCE_CHAPTER_SOAK_MS ?? 0);
const desktopViewports = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 1000 },
  { name: "1024", width: 1024, height: 1000 },
  { name: "901", width: 901, height: 1000 }
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

const documentBox = async (locator: ReturnType<Page["locator"]>) => {
  const rect = await box(locator);
  const scroll = await locator.page().evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  return { ...rect, x: rect.x + scroll.x, y: rect.y + scroll.y };
};

const intersects = (left: Awaited<ReturnType<typeof box>>, right: Awaited<ReturnType<typeof box>>) =>
  left.x < right.x + right.width &&
  left.x + left.width > right.x &&
  left.y < right.y + right.height &&
  left.y + left.height > right.y;

const waitForScrollSettled = (page: Page) => page.evaluate(() => new Promise<number>((resolve) => {
  let previous = window.scrollY;
  let stableFrames = 0;
  let frames = 0;
  const sample = () => {
    const current = window.scrollY;
    stableFrames = Math.abs(current - previous) <= 1 ? stableFrames + 1 : 0;
    previous = current;
    frames += 1;
    if (stableFrames >= 4 || frames >= 20) resolve(current);
    else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}));

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

test("legacy package route remains contextual without impersonating an authorized main entrance", async ({ page }) => {
  const response = await prepare(page, legacyPath);
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-reference-source-page]")).toHaveCount(0);
  await expect(page.locator("article.entry-shell h1")).toContainText("1990 到 2003 年的游戏回忆");
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
  const nextPath = new URL(nextHref!, page.url()).pathname;
  await next.click();
  await page.waitForURL((url) => url.pathname === nextPath);
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

test("static chapter directory and shared dual-entry panel follow active chapter state", async ({ page }) => {
  await prepare(page, chapteredPath);
  const directory = page.locator("[data-reference-chapter-directory]");
  const links = directory.locator("[data-reference-chapter-link]");
  const chapters = page.locator("[data-reference-chapter]");
  const marker = page.locator("[data-reference-chapter-hud-marker]");
  const manualToggle = page.locator("[data-reference-chapter-manual-toggle]");
  const hud = page.locator("[data-reference-chapter-hud]");
  const hudToggle = page.locator("[data-reference-chapter-hud-toggle]");
  const panel = page.locator("#reference-chapter-panel");

  await expect(directory).toHaveAttribute("aria-label", "本文目录");
  expect(await links.count()).toBeGreaterThan(1);
  expect(await marker.evaluate((node) => Boolean(node.closest("[data-reference-chapter-directory]")))).toBe(false);
  await expect(marker).toHaveCSS("position", "static");
  await expect(directory.locator('[data-reference-chapter-link][aria-current="location"]')).toHaveCount(0);
  await expect(page.locator("[data-reference-progress-section]")).toHaveText("00");
  await expect(page.locator("[data-reference-progress-total]")).toHaveText(
    String(await chapters.count()).padStart(2, "0")
  );
  await expect(manualToggle).toBeVisible();
  await expect(hud).toBeHidden();
  await expect(manualToggle).toHaveAttribute("aria-controls", "reference-chapter-panel");
  await expect(hudToggle).toHaveAttribute("aria-controls", "reference-chapter-panel");
  await manualToggle.click();
  await expect(panel).toBeVisible();
  await expect(manualToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(manualToggle).toBeFocused();

  const target = links.nth(1);
  const targetId = await target.getAttribute("data-chapter-id");
  expect(targetId).toBeTruthy();
  await target.click();
  await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
  await expect(page.locator(`#${targetId} h2`)).toBeFocused();
  await expect(target).toHaveAttribute("aria-current", "location");
  await expect(page.locator("[data-reference-progress-section]")).toHaveText("02");
  await expect(hud).toBeVisible();
  await expect(manualToggle).toBeHidden();
  await hudToggle.click();
  await expect(panel).toBeVisible();
  await expect(hudToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(hudToggle).toBeFocused();
});

test("one-chapter source keeps real progress without a collapsible compact menu", async ({ page }) => {
  await prepare(page, singleChapterPath);
  await expect(page.locator("[data-reference-chapter-link]")).toHaveCount(1);
  await expect(page.locator("[data-reference-progress-total]")).toHaveText("01");
  await expect(page.locator("[data-reference-chapter-manual-toggle], [data-reference-chapter-hud-toggle]")).toHaveCount(0);
});

test("INDEX overlay preserves chapter route geometry and state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page, chapteredPath);
  const reading = page.locator(".reference-source__reading-plane");
  const directory = page.locator("[data-reference-chapter-directory]");
  const secondLink = directory.locator("[data-reference-chapter-link]").nth(1);
  const secondId = await secondLink.getAttribute("data-chapter-id");
  expect(secondId).toBeTruthy();
  await secondLink.click();
  await expect(secondLink).toHaveAttribute("aria-current", "location");
  await expect(page.locator("[data-reference-chapter-hud]")).toBeVisible();
  await waitForScrollSettled(page);

  const before = await box(reading);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const trigger = page.locator("[data-reference-index-trigger]");
  const dialog = page.locator("dialog[data-reference-index]");
  const triggerBox = await box(trigger);
  await page.mouse.click(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
  await expect(dialog).toHaveJSProperty("open", true);
  await waitForScrollSettled(page);
  const after = await box(reading);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore)).toBeLessThanOrEqual(1);
  await expect(secondLink).toHaveAttribute("aria-current", "location");
  await expect(page).toHaveURL(new RegExp(`#${secondId}$`));
});

for (const viewport of desktopViewports) {
  test(`${viewport.name}px independent chapter HUD preserves directory geometry and clears hash targets`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page, chapteredPath, viewport.width, viewport.height);
    const topNav = page.locator("[data-top-nav]");
    const directory = page.locator("[data-reference-chapter-directory]");
    const marker = page.locator("[data-reference-chapter-hud-marker]");
    const links = directory.locator("[data-reference-chapter-link]");
    const manualToggle = page.locator("[data-reference-chapter-manual-toggle]");
    const hud = page.locator("[data-reference-chapter-hud]");
    const hudToggle = page.locator("[data-reference-chapter-hud-toggle]");
    const panel = page.locator("#reference-chapter-panel");
    const directoryBefore = await documentBox(directory);

    expect(await marker.evaluate((node) => Boolean(node.closest("[data-reference-chapter-directory]")))).toBe(false);
    await expect(marker).toHaveCSS("position", "static");
    await expect(manualToggle).toBeVisible();
    await expect(hud).toBeHidden();
    await manualToggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");

    await links.nth(1).click();
    await waitForScrollSettled(page);
    await expect(hud).toBeVisible();
    await expect(manualToggle).toBeHidden();
    const navBox = await box(topNav);
    const hudBox = await box(hud);
    expect(hudBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height);
    expect(hudBox.height).toBeCloseTo(44, 0);
    const directoryAfter = await documentBox(directory);
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(directoryAfter[key] - directoryBefore[key])).toBeLessThanOrEqual(1);
    }

    await hudToggle.click();
    await expect(panel).toBeVisible();
    const target = panel.locator("[data-reference-chapter-link]").nth(2);
    const targetId = await target.getAttribute("data-chapter-id");
    expect(targetId).toBeTruthy();
    await target.click();
    await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
    await waitForScrollSettled(page);

    const targetHeading = page.locator(`#${targetId} h2`);
    await expect(targetHeading).toBeFocused();
    const headingBox = await box(targetHeading);
    const currentHudBox = await box(hud);
    expect(headingBox.y).toBeGreaterThanOrEqual(currentHudBox.y + currentHudBox.height + 10);
    const finalDirectory = await documentBox(directory);
    expect(Math.abs(finalDirectory.height - directoryBefore.height)).toBeLessThanOrEqual(1);

    if (reviewOutput) {
      await mkdir(reviewOutput, { recursive: true });
      await page.screenshot({ path: `${reviewOutput}/reference-source-hud-shell-${viewport.name}.png` });
      await page.screenshot({ path: `${reviewOutput}/reference-source-hash-clearance-${viewport.name}.png` });
    }
  });
}

test("repeated marker crossings and shared-panel chapter selections remain stable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page, chapteredPath);
  const marker = page.locator("[data-reference-chapter-hud-marker]");
  const manualToggle = page.locator("[data-reference-chapter-manual-toggle]");
  const hud = page.locator("[data-reference-chapter-hud]");
  const hudToggle = page.locator("[data-reference-chapter-hud-toggle]");
  const panel = page.locator("#reference-chapter-panel");

  for (let iteration = 0; iteration < 6; iteration += 1) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(manualToggle).toBeVisible();
    await expect(hud).toBeHidden();
    await manualToggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await marker.evaluate((node) => node.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.evaluate(() => window.scrollBy({ top: 80, behavior: "instant" }));
    await expect(hud).toBeVisible();
    await expect(manualToggle).toBeHidden();
    await hudToggle.click();
    await expect(panel).toBeVisible();
    const links = panel.locator("[data-reference-chapter-link]");
    const targetIndex = (iteration % Math.max(1, await links.count() - 1)) + 1;
    await links.nth(targetIndex).click();
    await expect(panel).toBeHidden();
  }
});

test("release soak keeps chapter controls responsive without runtime or geometry drift", async ({ page }) => {
  test.skip(chapterSoakMs < 60_000, "Set REFERENCE_CHAPTER_SOAK_MS=60000 for the release soak.");
  test.setTimeout(chapterSoakMs + 45_000);
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page, chapteredPath);

  const directory = page.locator("[data-reference-chapter-directory]");
  const marker = page.locator("[data-reference-chapter-hud-marker]");
  const manualToggle = page.locator("[data-reference-chapter-manual-toggle]");
  const hud = page.locator("[data-reference-chapter-hud]");
  const hudToggle = page.locator("[data-reference-chapter-hud-toggle]");
  const panel = page.locator("#reference-chapter-panel");
  const directoryBefore = await documentBox(directory);

  await marker.evaluate((node) => node.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.evaluate(() => window.scrollBy({ top: 80, behavior: "instant" }));
  await expect(hud).toBeVisible();
  await hudToggle.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(manualToggle).toBeVisible();
  await manualToggle.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.evaluate(() => {
    type LongTaskRecord = { duration: number; name: string; startTime: number };
    const state = window as Window & { __referenceLongTasks?: LongTaskRecord[] };
    state.__referenceLongTasks = [];
    new PerformanceObserver((list) => {
      state.__referenceLongTasks?.push(...list.getEntries().map((entry) => ({
        duration: entry.duration,
        name: entry.name,
        startTime: entry.startTime,
      })));
    }).observe({ entryTypes: ["longtask"] });
  });

  const startedAt = Date.now();
  let iterations = 0;

  while (Date.now() - startedAt < chapterSoakMs) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(manualToggle).toBeVisible();
    await manualToggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await marker.evaluate((node) => node.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.evaluate(() => window.scrollBy({ top: 80, behavior: "instant" }));
    await expect(hud).toBeVisible();
    await hudToggle.click();
    await expect(panel).toBeVisible();
    const links = panel.locator("[data-reference-chapter-link]");
    const targetIndex = (iterations % Math.max(1, await links.count() - 1)) + 1;
    await links.nth(targetIndex).click();
    await expect(panel).toBeHidden();
    iterations += 1;
    await page.waitForTimeout(250);
  }

  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(chapterSoakMs);
  expect(iterations).toBeGreaterThan(10);
  const directoryAfter = await documentBox(directory);
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(directoryAfter[key] - directoryBefore[key])).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const longTasks = await page.evaluate(() =>
    (window as Window & { __referenceLongTasks?: Array<{ duration: number; name: string; startTime: number }> }).__referenceLongTasks ?? [],
  );
  console.log("REFERENCE SOAK " + JSON.stringify({
    durationMs: Date.now() - startedAt,
    historyLength: await page.evaluate(() => history.length),
    iterations,
    longTasks,
  }));
  expect(longTasks).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
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

    const chapterDirectory = root.locator("[data-reference-chapter-directory]");
    const chapterLink = chapterDirectory.locator("[data-reference-chapter-link]").nth(1);
    await chapterLink.click();
    const chapterHud = root.locator("[data-reference-chapter-hud]");
    await expect(chapterHud).toBeVisible();
    await waitForScrollSettled(page);
    if (reviewOutput) {
      await page.screenshot({ path: `${reviewOutput}/reference-source-hud-closed-${viewport.name}.png` });
    }
    const chapterToggle = chapterHud.locator("[data-reference-chapter-hud-toggle]");
    if (await chapterToggle.count()) {
      await chapterToggle.click();
      await expect(chapterToggle).toHaveAttribute("aria-expanded", "true");
      if (reviewOutput) {
        await page.screenshot({ path: `${reviewOutput}/reference-source-hud-open-${viewport.name}.png` });
      }
      await page.keyboard.press("Escape");
      await expect(chapterToggle).toHaveAttribute("aria-expanded", "false");
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
