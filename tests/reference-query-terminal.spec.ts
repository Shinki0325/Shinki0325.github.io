import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const reviewOutput = process.env.REVIEW_OUTPUT;
const desktopViewports = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 1000 },
  { name: "1024", width: 1024, height: 1000 },
] as const;

const prepare = async (page: Page, width = 1440, height = 1000) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("blog-shell-splash-dismissed", "true");
    localStorage.setItem("blog-shell-character-rail-open", "true");
  });
  await page.setViewportSize({ width, height });
  return page.goto("/references/", { waitUntil: "domcontentloaded" });
};

const box = async (locator: ReturnType<Page["locator"]>) => {
  const rect = await locator.boundingBox();
  expect(rect).not.toBeNull();
  return rect!;
};

for (const viewport of desktopViewports) {
  test(viewport.name + "px real reference query terminal keeps shell and page geometry", async ({ page }) => {
    const runtimeErrors: string[] = [];
    const failedImages: string[] = [];
    const requests: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    page.on("response", (response) => {
      if (response.request().resourceType() === "image" && !response.ok()) failedImages.push(response.url());
    });

    const response = await prepare(page, viewport.width, viewport.height);
    expect(response?.status()).toBe(200);
    const root = page.locator("[data-reference-query-terminal]");
    const cards = root.locator("[data-archive-card]");
    await expect(root).toBeVisible();
    await expect(cards).toHaveCount(36);
    await expect(root.locator("[data-reference-visible-count]")).toHaveText("36");
    await page.waitForLoadState("load");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const clippedStatus = await root.locator(".reference-query-terminal__status small, .reference-query-terminal__status strong").evaluateAll((nodes) =>
      nodes.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).length
    );
    expect(clippedStatus).toBe(0);
    const statusTextOverflow = await root.locator(".reference-query-terminal__status small, .reference-query-terminal__status strong").evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).textOverflow)
    );
    expect(statusTextOverflow).not.toContain("ellipsis");

    const identity = root.locator(".reference-query-terminal__identity");
    const identityCopyBox = await box(identity.locator(".reference-query-terminal__identity-copy"));
    const statusBox = await box(identity.locator(".reference-query-terminal__status"));
    if (viewport.width === 1024) {
      expect(statusBox.y).toBeGreaterThanOrEqual(identityCopyBox.y + identityCopyBox.height - 1);
      expect(statusBox.width).toBeCloseTo(identityCopyBox.width, 0);
    } else {
      expect(statusBox.x).toBeGreaterThanOrEqual(identityCopyBox.x + identityCopyBox.width - 1);
      expect(statusBox.y).toBeCloseTo(identityCopyBox.y, 0);
    }

    const resultsHead = root.locator(".reference-query-terminal__results-head");
    const resultsTitle = resultsHead.locator("h2");
    await expect(resultsTitle).toHaveText("检索结果");
    const resultsTitleBox = await box(resultsTitle);
    expect(resultsTitleBox.width).toBeLessThanOrEqual(1);
    expect(resultsTitleBox.height).toBeLessThanOrEqual(1);
    expect((await box(resultsHead)).height).toBeLessThanOrEqual(42);

    const rail = page.locator("[data-character-rail]");
    const railBox = await box(rail);
    const openBox = await box(root);
    expect(openBox.x - (railBox.x + railBox.width)).toBeGreaterThanOrEqual(13);
    await page.locator("[data-character-rail-toggle]").click();
    await expect(rail).toHaveAttribute("data-open", "false");
    const closedBox = await box(root);
    expect(closedBox.width).toBeCloseTo(openBox.width, 0);
    expect(closedBox.height).toBeCloseTo(openBox.height, 0);

    if (reviewOutput) {
      await mkdir(reviewOutput, { recursive: true });
      if (viewport.width === 1440) {
        await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-rail-closed-1440.png" });
      }
      await page.locator("[data-character-rail-toggle]").click();
      await expect(rail).toHaveAttribute("data-open", "true");
      await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-terminal-" + viewport.name + ".png" });
      await identity.screenshot({ path: reviewOutput + "/reference-query-identity-" + viewport.name + ".png" });
      await resultsHead.screenshot({ path: reviewOutput + "/reference-query-count-strip-" + viewport.name + ".png" });
    }

    expect(runtimeErrors).toEqual([]);
    expect(failedImages).toEqual([]);
    if (viewport.width === 1440) {
      const origins = [...new Set(requests.map((url) => new URL(url).origin))].sort();
      const localReferenceImages = new Set(
        requests
          .map((url) => new URL(url))
          .filter((url) => url.pathname.startsWith("/uploads/generated/archive-thumbs/"))
          .map((url) => url.pathname),
      );
      console.log("NETWORK references " + JSON.stringify({ origins, referenceImages: localReferenceImages.size, requests: requests.length }));
    }
  });
}

test("query controls synchronize category, tag, search, clear, and empty states", async ({ page }) => {
  await prepare(page);
  const root = page.locator("[data-reference-query-terminal]");
  const cards = root.locator("[data-archive-card]");
  const count = root.locator("[data-reference-visible-count]");
  const allCategory = root.locator('[data-archive-category="all"]');
  const allTag = root.locator('[data-archive-tag="all"]');
  await expect(cards).toHaveCount(36);
  await expect(count).toHaveText("36");

  const category = root.locator("[data-archive-category]:not([data-archive-category='all'])").first();
  const categoryValue = await category.getAttribute("data-archive-category");
  const categoryExpected = await cards.evaluateAll(
    (nodes, value) => nodes.filter((node) => node.getAttribute("data-archive-card-category") === value).length,
    categoryValue,
  );
  await category.click();
  await expect(category).toHaveAttribute("aria-pressed", "true");
  await expect(allCategory).toHaveAttribute("aria-pressed", "false");
  await expect(count).toHaveText(String(categoryExpected).padStart(2, "0"));
  if (reviewOutput) await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-category-1440.png" });

  const details = root.locator("[data-reference-tag-details]");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(root.locator("[data-reference-tag-symbol]")).toHaveText("−");
  const drawer = details.locator(".reference-query-terminal__tag-drawer");
  await expect(drawer).toBeVisible();
  const drawerBounds = await box(drawer);
  expect(drawerBounds.x).toBeGreaterThanOrEqual(0);
  expect(drawerBounds.x + drawerBounds.width).toBeLessThanOrEqual(1440);
  expect(drawerBounds.y + drawerBounds.height).toBeLessThanOrEqual(1000);
  const hitTestable = await drawer.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return Boolean(target && node.contains(target));
  });
  expect(hitTestable).toBe(true);
  if (reviewOutput) await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-tags-open-1440.png" });

  const tag = root.locator("[data-archive-tag]:not([data-archive-tag='all']):visible").first();
  const tagValue = await tag.getAttribute("data-archive-tag");
  const tagExpected = await cards.evaluateAll(
    (nodes, state) => nodes.filter((node) => {
      const tags = JSON.parse(node.getAttribute("data-archive-tags") || "[]");
      return node.getAttribute("data-archive-card-category") === state.category && tags.includes(state.tag);
    }).length,
    { category: categoryValue, tag: tagValue },
  );
  await tag.click();
  await expect(tag).toHaveAttribute("aria-pressed", "true");
  await expect(allTag).toHaveAttribute("aria-pressed", "false");
  await expect(count).toHaveText(String(tagExpected).padStart(2, "0"));
  if (reviewOutput) await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-tag-filter-1440.png" });

  await page.mouse.click(8, 500);
  await expect(details).not.toHaveAttribute("open", "");
  await expect(root.locator("[data-reference-tag-symbol]")).toHaveText("+");
  const clear = root.locator(".reference-query-terminal__search [data-reference-clear]");
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(allCategory).toHaveAttribute("aria-pressed", "true");
  await expect(allTag).toHaveAttribute("aria-pressed", "true");
  await expect(count).toHaveText("36");

  const search = root.locator("[data-archive-search]");
  const pc98Expected = await cards.evaluateAll((nodes) =>
    nodes.filter((node) => (node.getAttribute("data-archive-search-text") || "").toLocaleLowerCase().includes("pc98")).length
  );
  await search.fill("PC98");
  await expect(count).toHaveText(String(pc98Expected).padStart(2, "0"));
  await expect(clear).toBeVisible();
  if (reviewOutput) await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-search-1440.png" });

  await search.fill("__NO_MATCHING_REFERENCE__");
  await expect(count).toHaveText("00");
  await expect(root.locator("[data-reference-empty]")).toBeVisible();
  if (reviewOutput) await page.screenshot({ fullPage: true, path: reviewOutput + "/reference-query-empty-1440.png" });
  await root.locator("[data-reference-empty] [data-reference-clear]").click();
  await expect(root.locator("[data-reference-empty]")).toBeHidden();
  await expect(count).toHaveText("36");
});

test("topic and source interactions change treatment without moving geometry", async ({ page }) => {
  await prepare(page);
  const root = page.locator("[data-reference-query-terminal]");
  const topic = root.locator("[data-reference-entry-kind='topic']").first();
  const record = root.locator("[data-reference-entry-kind='source']").first();
  const recordImage = record.locator("[data-archive-card-image]");
  const topicBefore = await box(topic);
  const recordBefore = await box(record);
  const restingTopicAnimation = await topic.evaluate((node) => getComputedStyle(node, "::after").animationName);
  const restingRecordBackground = await record.evaluate((node) => getComputedStyle(node).backgroundColor);
  const restingImageFilter = await recordImage.evaluate((node) => getComputedStyle(node).filter);

  await record.hover();
  expect(await box(record)).toEqual(recordBefore);
  await expect.poll(() => record.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(restingRecordBackground);
  await expect.poll(() => recordImage.evaluate((node) => getComputedStyle(node).filter)).not.toBe(restingImageFilter);
  if (reviewOutput) await record.screenshot({ path: reviewOutput + "/reference-query-record-hover-1440.png" });

  await record.focus();
  expect(await box(record)).toEqual(recordBefore);
  await expect(record).toHaveCSS("outline-style", "solid");
  if (reviewOutput) await record.screenshot({ path: reviewOutput + "/reference-query-record-focus-1440.png" });

  await topic.hover();
  expect(await box(topic)).toEqual(topicBefore);
  expect(restingTopicAnimation).toBe("none");
  await expect.poll(() => topic.evaluate((node) => getComputedStyle(node, "::after").animationName)).not.toBe("none");
  expect(await topic.evaluate((node) => getComputedStyle(node, "::after").animationIterationCount)).toBe("1");
  if (reviewOutput) await topic.screenshot({ path: reviewOutput + "/reference-query-topic-hover-1440.png" });
  await topic.focus();
  expect(await box(topic)).toEqual(topicBefore);
});

test("reduced motion removes scan travel and image zoom while compact fallback stays usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page, 768, 1000);
  const root = page.locator("[data-reference-query-terminal]");
  const topic = root.locator("[data-reference-entry-kind='topic']").first();
  const records = root.locator("[data-reference-entry-kind='source']");
  const record = records.first();
  const image = record.locator("[data-archive-card-image]");
  await topic.hover();
  await record.hover();
  expect(await topic.evaluate((node) => getComputedStyle(node, "::after").animationName)).toBe("none");
  await expect(image).toHaveCSS("transform", "none");
  await expect(image).toHaveCSS("transition-duration", "0s");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const first = await box(records.nth(0));
  const second = await box(records.nth(1));
  expect(second.y).toBeGreaterThan(first.y + first.height - 1);
});

test("ClientRouter re-entry stays idempotent and reference links navigate normally", async ({ page }) => {
  await prepare(page);
  await page.locator('[data-character-rail] a[href="/notes/"]').click();
  await expect(page).toHaveURL(/\/notes\/$/);
  await page.locator('[data-character-rail] a[href="/references/"]').click();
  await expect(page).toHaveURL(/\/references\/$/);
  const root = page.locator("[data-reference-query-terminal]");
  await expect(root).toHaveCount(1);
  const images = root.locator("[data-archive-card-image]");
  await expect(images.first()).toHaveAttribute("data-archive-assigned-cover", /\S/);
  const assignedCount = await images.evaluateAll((nodes) =>
    nodes.filter((node) => Boolean((node as HTMLElement).dataset.archiveAssignedCover)).length
  );
  expect(assignedCount).toBe(await images.count());

  const category = root.locator("[data-archive-category]:not([data-archive-category='all'])").first();
  await category.click();
  await expect(category).toHaveAttribute("aria-pressed", "true");
  const source = root.locator("[data-reference-entry-kind='source']:visible").first();
  const href = await source.getAttribute("href");
  await source.click();
  await expect(page).toHaveURL(new RegExp((href || "").replaceAll("/", "\\/") + "$"));
});
