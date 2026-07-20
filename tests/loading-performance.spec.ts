import { expect, test, type Page } from "@playwright/test";

const BACKGROUND_PATHS = [
  "/uploads/backgrounds/nonhome/background-01.webp",
  "/uploads/backgrounds/nonhome/background-02.webp",
  "/uploads/backgrounds/nonhome/background-03.webp",
  "/uploads/backgrounds/nonhome/background-04.webp",
  "/uploads/backgrounds/nonhome/background-05.webp",
  "/uploads/backgrounds/nonhome/background-06.webp",
] as const;

const LOCAL_BACKGROUND_PREFIX = "/uploads/backgrounds/nonhome/";
const BACKGROUND_STATE_KEY = "blog:nonhome-background-state:v1";

const ORIGINAL_PHOTO_PATHS = [
  "/uploads/albums/hidden-cg/cover.png",
  "/uploads/albums/hidden-cg/hidden-cg-02.jpg",
] as const;

const dismissSplash = async (page: Page) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
};

const requestedPath = (url: string, path: string) => {
  try {
    return new URL(url).pathname === path;
  } catch {
    return false;
  }
};

test("photowall stages its background and requests originals only for the lightbox", async ({ page }) => {
  await dismissSplash(page);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  await page.goto("/photowall/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-photowall-shell]")).toBeVisible();
  await page.waitForTimeout(10_000);

  expect(
    new Set(
      requests.filter((url) => BACKGROUND_PATHS.some((path) => requestedPath(url, path))),
    ).size,
  ).toBe(1);
  for (const path of ORIGINAL_PHOTO_PATHS) {
    expect(requests.some((url) => requestedPath(url, path))).toBe(false);
  }

  await page.locator('[data-album-slug="隐藏cg"]').click();
  await expect(page.locator("[data-album-detail]")).toBeVisible();
  for (const path of ORIGINAL_PHOTO_PATHS) {
    expect(requests.some((url) => requestedPath(url, path))).toBe(false);
  }

  const originalRequest = page.waitForRequest((request) =>
    requestedPath(request.url(), ORIGINAL_PHOTO_PATHS[0]),
  );
  await page.locator("[data-photo-tile]").first().click();
  await originalRequest;
  await expect(page.locator("[data-lightbox-image]")).toHaveAttribute(
    "src",
    ORIGINAL_PHOTO_PATHS[0],
  );
});

test("homepage carousel stops requesting covers after a ClientRouter transition", async ({ page }) => {
  await dismissSplash(page);
  const scriptCoverRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/uploads/articles/script-covers/")) {
      scriptCoverRequests.push(request.url());
    }
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-home-script-carousel]")).toBeVisible();
  await page.evaluate(() => {
    (window as Window & { __loadingPerformanceRouteMarker?: string }).__loadingPerformanceRouteMarker =
      "client-router-alive";
  });

  await page.locator('a[href="/photowall/"]').first().click();
  await expect(page.locator("[data-photowall-shell]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __loadingPerformanceRouteMarker?: string })
          .__loadingPerformanceRouteMarker,
    ),
  ).toBe("client-router-alive");

  const requestsAfterTransition = scriptCoverRequests.length;
  await page.waitForTimeout(7_000);
  expect(scriptCoverRequests).toHaveLength(requestsAfterTransition);
});

test("non-home background state survives five ClientRouter routes", async ({ context, page }) => {
  await dismissSplash(page);
  await page.addInitScript(() => {
    (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads = 0;
    document.addEventListener("astro:page-load", () => {
      const state = window as Window & { __backgroundPageLoads?: number };
      state.__backgroundPageLoads = (state.__backgroundPageLoads ?? 0) + 1;
    });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

  const consoleErrors: string[] = [];
  const localBackgroundRequests: string[] = [];
  const remoteBackgroundRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes(LOCAL_BACKGROUND_PREFIX)) localBackgroundRequests.push(url);
    if (url.includes("pic.imgdd.cc")) remoteBackgroundRequests.push(url);
  });

  await page.goto("/articles/", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect(page.locator("[data-background-slide].is-active")).toHaveCount(1);
  const initialState = await page.evaluate((key) => sessionStorage.getItem(key), BACKGROUND_STATE_KEY);
  expect(initialState).not.toBeNull();
  const initialIndex = JSON.parse(initialState ?? "null").activeIndex;

  for (const path of ["/references/", "/notes/", "/photowall/", "/about/"]) {
    const pageLoadCount = await page.evaluate(
      () => (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads ?? 0,
    );
    await page.locator(`[data-character-rail] a[href="${path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}$`));
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads ?? 0,
        ),
      )
      .toBeGreaterThan(pageLoadCount);
    await expect(page.locator("[data-top-nav]")).toBeVisible();
    await expect(page.locator("[data-background-slide].is-active")).toHaveCount(1);
    const state = await page.evaluate((key) => sessionStorage.getItem(key), BACKGROUND_STATE_KEY);
    expect(JSON.parse(state ?? "null").activeIndex).toBe(initialIndex);
  }

  expect(localBackgroundRequests).toHaveLength(1);
  expect(remoteBackgroundRequests).toHaveLength(0);

  await page.evaluate((key) => sessionStorage.setItem(key, "{not-valid-json"), BACKGROUND_STATE_KEY);
  const pageLoadCount = await page.evaluate(
    () => (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads ?? 0,
  );
  await page.locator('[data-character-rail] a[href="/articles/"]').click();
  await expect(page).toHaveURL(/\/articles\/$/);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __backgroundPageLoads?: number }).__backgroundPageLoads ?? 0,
      ),
    )
    .toBeGreaterThan(pageLoadCount);
  await expect(page.locator("[data-background-slide].is-active")).toHaveCount(1);
  expect(consoleErrors).toHaveLength(0);
});

test("non-home background preloads and rotates against the persisted deadline", async ({ page }) => {
  const now = new Date("2026-07-16T12:00:00+08:00").getTime();
  await page.clock.install({ time: now });
  await page.addInitScript(
    ({ key, nextRotationAt }) => {
      sessionStorage.setItem("blog-shell-splash-dismissed", "true");
      sessionStorage.setItem(key, JSON.stringify({ activeIndex: 1, nextRotationAt }));
    },
    { key: BACKGROUND_STATE_KEY, nextRotationAt: now + 60_000 },
  );

  const backgroundRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(LOCAL_BACKGROUND_PREFIX)) backgroundRequests.push(request.url());
  });

  await page.goto("/articles/", { waitUntil: "domcontentloaded" });
  const slider = page.locator("[data-background-slider]");
  await expect(slider).toHaveAttribute("data-background-active-index", "1");
  await expect.poll(() => backgroundRequests.length).toBe(1);

  await page.clock.fastForward(55_001);
  await expect.poll(() => backgroundRequests.length).toBe(2);
  await expect(slider).toHaveAttribute("data-background-active-index", "1");

  await page.clock.fastForward(5_000);
  await expect(slider).toHaveAttribute("data-background-active-index", "2");
  const state = await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? "null"), BACKGROUND_STATE_KEY);
  expect(state).toEqual({ activeIndex: 2, nextRotationAt: now + 120_000 });
  expect(backgroundRequests).toHaveLength(2);

  await page.clock.fastForward(55_000);
  await expect.poll(() => backgroundRequests.length).toBe(3);
});

test("non-home background survives blocked session storage", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("blog-shell-splash-dismissed", "true");
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      runtimeErrors.push(message.text());
    }
  });

  await page.goto("/articles/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-background-slide].is-active")).toHaveCount(1);
  await expect(page.locator("[data-background-slide].is-active")).toHaveAttribute(
    "data-background-loaded",
    "true",
  );
  expect(runtimeErrors).toHaveLength(0);
});

test("character archive SSR stays compact and height intent meets the throttled budget", async ({
  context,
  page,
  request,
}) => {
  await dismissSplash(page);
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const htmlBytes = Buffer.byteLength(html);
  expect(html).toContain("data-character-archive");
  expect(html).toContain("data-birthday-node");

  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|hydrating|did not match|server html|client render/i.test(message.text())
    ) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydration|hydrating|did not match|server html|client render/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });

  const birthdayRequests = new Set<string>();
  const heightRequests: string[] = [];
  page.on("request", (networkRequest) => {
    const url = networkRequest.url();
    if (url.includes("/uploads/character-birthdays/")) birthdayRequests.add(url);
    if (url.includes("/uploads/character-heights/")) heightRequests.push(url);
  });

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    connectionType: "cellular4g",
    downloadThroughput: (5 * 1024 * 1024) / 8,
    latency: 100,
    offline: false,
    uploadThroughput: (5 * 1024 * 1024) / 8,
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const archive = page.locator("[data-character-archive]");
  await expect(archive.locator("[data-birthday-node]").first()).toBeVisible();
  const island = page.locator('astro-island[component-url*="CharacterArchiveTerminal"]');
  await expect(island).toHaveAttribute("client", "load");
  const propsLength = (await island.getAttribute("props"))?.length ?? Number.POSITIVE_INFINITY;
  expect(propsLength).toBeLessThan(2_000);
  await expect
    .poll(() => island.evaluate((element) => !element.hasAttribute("ssr")), { timeout: 15_000 })
    .toBe(true);
  await page.waitForTimeout(1_000);
  expect(hydrationErrors).toHaveLength(0);
  expect(heightRequests).toHaveLength(0);

  const heightTab = archive.getByRole("tab", { name: "身高图鉴", exact: true });
  const firstHeightResponse = page.waitForResponse(
    (heightResponse) =>
      heightResponse.url().includes("/uploads/character-heights/") && heightResponse.ok(),
  );
  await heightTab.focus();
  await expect.poll(() => new Set(heightRequests).size).toBeGreaterThan(0);
  expect(new Set(heightRequests).size).toBeLessThanOrEqual(8);
  await firstHeightResponse;

  const activationStarted = Date.now();
  await heightTab.click();
  const firstHeightImage = archive.locator("[data-height-character] img").first();
  await expect(firstHeightImage).toBeVisible();
  await expect
    .poll(() => firstHeightImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  const firstHeightImageMs = Date.now() - activationStarted;
  expect(firstHeightImageMs).toBeLessThan(900);

  console.log(
    `PERF archive ${JSON.stringify({
      birthdayRequests: birthdayRequests.size,
      firstHeightImageMs,
      heightPreloadRequests: new Set(heightRequests).size,
      htmlBytes,
      hydrationErrors: hydrationErrors.length,
      propsLength,
    })}`,
  );
});

test("about loads six showcase covers before intent and fourteen covers per expanded page", async ({ page }) => {
  await dismissSplash(page);
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64",
  );
  const coverRequests: string[] = [];
  const payloadRequests: string[] = [];
  await page.route("https://lain.bgm.tv/**", async (route) => {
    await route.fulfill({
      body: onePixelPng,
      contentType: "image/png",
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      status: 200,
    });
  });
  page.on("request", (request) => {
    try {
      const url = new URL(request.url());
      if (url.hostname === "lain.bgm.tv") coverRequests.push(url.href);
      if (url.pathname === "/data/about-collection.json") payloadRequests.push(url.href);
    } catch {
      // Ignore browser-internal request URLs.
    }
  });

  await page.goto("/about/", { waitUntil: "domcontentloaded" });
  const showcaseImages = page.locator("[data-about-collection-showcase] img");
  await expect(showcaseImages).toHaveCount(6);
  const showcaseSources = await showcaseImages.evaluateAll((images: HTMLImageElement[]) =>
    images.map((image) => image.currentSrc || image.src),
  );
  expect(new Set(showcaseSources).size).toBe(6);
  await page.locator("[data-about-collection-showcase]").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      showcaseImages.evaluateAll((images: HTMLImageElement[]) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
  expect(new Set(coverRequests).size).toBe(6);
  expect(payloadRequests).toHaveLength(0);

  const beforeExpansion = new Set(coverRequests);
  await page.locator("[data-about-collection-toggle]").click();
  await expect(page.locator("[data-about-collection-card]")).toHaveCount(14);
  await expect
    .poll(() =>
      page
        .locator("[data-about-collection-card] img")
        .evaluateAll((images: HTMLImageElement[]) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true);
  expect(payloadRequests).toHaveLength(1);
  const firstPageNewCovers = new Set(
    coverRequests.filter((url) => !beforeExpansion.has(url)),
  );
  expect(firstPageNewCovers.size).toBeLessThanOrEqual(14);

  const beforeSecondPage = new Set(coverRequests);
  await page.locator("[data-about-collection-page-next]").click();
  await expect(page.locator("[data-about-collection-card]")).toHaveCount(14);
  await expect(page.locator("[data-about-collection-page-info]")).toContainText("2 /");
  await expect
    .poll(() =>
      page
        .locator("[data-about-collection-card] img")
        .evaluateAll((images: HTMLImageElement[]) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true);
  const secondPageNewCovers = new Set(
    coverRequests.filter((url) => !beforeSecondPage.has(url)),
  );
  expect(secondPageNewCovers.size).toBeLessThanOrEqual(14);

  await page.locator("[data-about-collection-toggle]").click();
  await page.locator("[data-about-collection-toggle]").click();
  await expect(page.locator("[data-about-collection-card]")).toHaveCount(14);
  expect(payloadRequests).toHaveLength(1);

  console.log(
    `PERF about ${JSON.stringify({
      firstPageNewCovers: firstPageNewCovers.size,
      initialCoverRequests: beforeExpansion.size,
      payloadRequests: payloadRequests.length,
      secondPageNewCovers: secondPageNewCovers.size,
    })}`,
  );
});
