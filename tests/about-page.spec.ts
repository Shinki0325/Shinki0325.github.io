import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("blog-shell-splash-dismissed", "true");
  });
});

test("about page presents the approved project console", async ({ page }) => {
  await page.goto("/about/");

  await expect(page.locator("[data-about-project]")).toBeVisible();
  await expect(page.locator("[data-about-hero]")).toContainText("美妙故事的瞬间");
  await expect(page.locator("[data-about-guide] img")).toHaveAttribute(
    "src",
    "/uploads/about/about-guide-character.webp",
  );
  await expect(page.locator("[data-about-modules] a")).toHaveCount(4);
  await expect(page.locator("[data-about-collection-showcase] a")).toHaveCount(6);
  await expect(page.locator("[data-about-collection-panel]")).toBeHidden();
  await expect(page.locator("[data-about-tabs], [data-about-cover]")).toHaveCount(0);
});

test("About birthday and height entries activate the requested archive view", async ({ page }) => {
  await page.goto("/about/");
  await page.locator('a[href="/?archive=height#character-archive"]').click();
  await expect(page).toHaveURL(/archive=height#character-archive$/);
  await expect(page.locator("#character-archive").getByRole("tab").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.goto("/about/");
  await page.locator('a[href="/?archive=birthday#character-archive"]').click();
  await expect(page).toHaveURL(/archive=birthday#character-archive$/);
  await expect(page.locator("#character-archive").getByRole("tab").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("About music entry reaches the homepage music console", async ({ page }) => {
  await page.goto("/about/");
  await page.locator('a[href="/#home-music-card"]').click();
  await expect(page).toHaveURL(/#home-music-card$/);
  await expect(page.locator("#home-music-card")).toBeVisible();
});

test("collection loads once, preserves state, and restores focus", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/data/about-collection.json") {
      payloadRequests += 1;
    }
  });

  await page.goto("/about/");
  const toggle = page.locator("[data-about-collection-toggle]");
  const panel = page.locator("[data-about-collection-panel]");

  expect(payloadRequests).toBe(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  await panel.locator('[data-about-collection-category="game"]').click();
  await panel.locator("[data-about-collection-page-next]").click();
  await expect(panel.locator("[data-about-collection-page-info]")).toContainText("2 /");
  await toggle.click();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await expect(panel.locator('[data-about-collection-category="game"]')).toHaveClass(
    /is-active/,
  );
  await expect(panel.locator("[data-about-collection-page-info]")).toContainText("2 /");
  expect(payloadRequests).toBe(1);
  expect(pageErrors).toHaveLength(0);
});

test("concurrent retry activation shares one request and then succeeds", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    if (payloadRequests === 1) {
      await route.fulfill({ status: 503, body: "Unavailable" });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.continue();
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await expect(retry).toBeVisible();

  const disabledAfterFirstActivation = await retry.evaluate((node) => {
    const button = node as HTMLButtonElement;
    button.click();
    const disabled = button.disabled;
    button.click();
    return disabled;
  });

  expect(disabledAfterFirstActivation).toBe(true);
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  await expect(panel.locator('[data-about-collection-category="anime"]')).toBeFocused();
  expect(payloadRequests).toBe(2);
  expect(pageErrors).toHaveLength(0);
});

test("malformed payload shows an inline error and remains retryable", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    if (payloadRequests === 1) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }
    await route.continue();
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  await expect(panel).toContainText("完整收藏暂时无法加载。");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await expect(retry).toBeVisible();
  expect(pageErrors).toHaveLength(0);

  await retry.click();
  await expect(panel.locator("[data-about-collection-card]")).toHaveCount(14);
  expect(payloadRequests).toBe(2);
  expect(pageErrors).toHaveLength(0);
});

test("a repeated request failure focuses the replacement retry", async ({ page }) => {
  const pageErrors: Error[] = [];
  let payloadRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/data/about-collection.json", async (route) => {
    payloadRequests += 1;
    await route.fulfill({ status: 503, body: "Unavailable" });
  });

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  const retry = panel.getByRole("button", { name: "重新加载" });
  await retry.click();

  await expect.poll(() => payloadRequests).toBe(2);
  await expect(retry).toBeFocused();
  expect(await retry.getAttribute("aria-pressed")).toBeNull();
  expect(pageErrors).toHaveLength(0);
});

test("collection filters expose grouped pressed state without marking commands", async ({
  page,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/about/");
  await page.locator("[data-about-collection-toggle]").click();
  const panel = page.locator("[data-about-collection-panel]");
  await expect(panel.getByRole("group", { name: "番组分类" })).toBeVisible();
  await expect(panel.getByRole("group", { name: "收藏状态" })).toBeVisible();
  await expect(panel.getByRole("group", { name: "排序方式" })).toBeVisible();

  await expect(panel.locator('[data-about-collection-category="anime"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-category="game"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(panel.locator('[data-about-collection-status="all"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-status="wish"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(panel.locator('[data-about-collection-sort="default"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(panel.locator('[data-about-collection-sort="rating"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(
    await panel.locator("[data-about-collection-page-prev]").getAttribute("aria-pressed"),
  ).toBeNull();
  expect(
    await panel.locator("[data-about-collection-page-next]").getAttribute("aria-pressed"),
  ).toBeNull();
  expect(pageErrors).toHaveLength(0);
});

const responsiveCases = [
  { width: 1440, projectWidth: 1016, moduleColumns: 4, routeColumns: 3 },
  { width: 1024, projectWidth: 760, moduleColumns: 2, routeColumns: 3 },
  { width: 768, projectWidth: 724, moduleColumns: 2, routeColumns: 1 },
  { width: 390, projectWidth: 366, moduleColumns: 1, routeColumns: 1 },
] as const;

for (const { width, projectWidth, moduleColumns, routeColumns } of responsiveCases) {
  test(`${width}px About page preserves project geometry and visual hierarchy`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/about/");

    const project = page.locator("[data-about-project]");
    const hero = page.locator("[data-about-hero]");
    const guide = page.locator("[data-about-guide]");
    const guideImage = guide.locator("img");
    const heroCopy = hero.locator(".about-project__hero-copy");
    const heading = hero.getByRole("heading", { level: 2 }).first();
    const modules = page.locator("[data-about-modules] .about-project__module");
    const routes = page.locator("[data-about-route] article");
    const characterRail = page.locator("[data-character-rail]");
    const railToggle = page.locator("[data-character-rail-toggle]");
    const mobileTrigger = page.locator("[data-mobile-nav-trigger]");

    await expect(project).toBeVisible();
    await expect(guideImage).toBeVisible();
    await expect(modules).toHaveCount(4);
    await expect(routes).toHaveCount(3);

    const [projectBox, heroBox, guideBox, headingBox, railBox] = await Promise.all([
      project.boundingBox(),
      hero.boundingBox(),
      guideImage.boundingBox(),
      heading.boundingBox(),
      characterRail.boundingBox(),
    ]);
    expect(projectBox?.width).toBeCloseTo(projectWidth, 0);
    expect((guideBox?.y ?? 0) + 1).toBeGreaterThanOrEqual(heroBox?.y ?? 0);
    expect(headingBox?.x ?? -1).toBeGreaterThanOrEqual(heroBox?.x ?? 0);
    expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(
      (heroBox?.x ?? 0) + (heroBox?.width ?? 0) + 1,
    );
    expect(headingBox?.y ?? -1).toBeGreaterThanOrEqual(heroBox?.y ?? 0);
    expect((headingBox?.y ?? 0) + (headingBox?.height ?? 0)).toBeLessThanOrEqual(
      (heroBox?.y ?? 0) + (heroBox?.height ?? 0) + 1,
    );
    if (width > 900) {
      await expect(characterRail).toBeVisible();
      await expect(railToggle).toBeVisible();
      await expect(mobileTrigger).toBeHidden();
      expect((railBox?.x ?? 0) + (railBox?.width ?? 0)).toBeLessThanOrEqual(
        (projectBox?.x ?? 0) + 1,
      );
    } else {
      await expect(characterRail).toBeHidden();
      await expect(railToggle).toBeHidden();
      await expect(mobileTrigger).toBeVisible();
    }

    const [copyZIndex, guideZIndex, actualModuleColumns, actualRouteColumns, overflow] =
      await Promise.all([
        heroCopy.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10)),
        guide.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10)),
        modules.evaluateAll((elements) => new Set(elements.map((element) => element.getBoundingClientRect().x)).size),
        routes.evaluateAll((elements) => new Set(elements.map((element) => element.getBoundingClientRect().x)).size),
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ]);
    expect(copyZIndex).toBeGreaterThan(guideZIndex);
    expect(actualModuleColumns).toBe(moduleColumns);
    expect(actualRouteColumns).toBe(routeColumns);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("About motion respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about/");

  const guide = page.locator("[data-about-guide]");
  const module = page.locator(".about-project__module").first();
  const showcaseCard = page.locator("[data-about-collection-showcase] a").first();

  await expect(guide).toHaveCSS("transition-duration", "0s");
  await expect(module).toHaveCSS("transition-duration", "0s");
  await expect(showcaseCard).toHaveCSS("transition-duration", "0s");

  await page.locator("[data-about-hero]").hover();
  await expect(guide).toHaveCSS("transform", "none");
  await module.hover();
  await expect(module).toHaveCSS("transform", "none");
  await showcaseCard.hover();
  await expect(showcaseCard).toHaveCSS("transform", "none");
});

test("1024px About keeps a centered plane and reachable desktop navigation after scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto("/about/");

  const project = page.locator("[data-about-project]");
  const topNav = page.locator("[data-top-nav]");
  const rail = page.locator("[data-character-rail]");
  const railToggle = page.locator("[data-character-rail-toggle]");

  await expect(rail).toBeVisible();
  await expect(railToggle).toBeVisible();
  await expect(page.locator("[data-mobile-nav-trigger]")).toBeHidden();

  const geometry = await project.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: window.innerWidth - rect.right,
      width: rect.width,
    };
  });
  expect(geometry.width).toBeCloseTo(760, 0);
  expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(2);

  await page.mouse.wheel(0, 1000);
  await expect(topNav).toHaveClass(/is-hidden/);
  await expect(topNav).toHaveCSS("transform", "none");
  expect((await topNav.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);

  await railToggle.focus();
  await expect(railToggle).toBeFocused();
  await expect(railToggle).toHaveAttribute("aria-expanded", "true");
  await railToggle.press("Enter");
  await expect(rail).toHaveAttribute("data-open", "false");
  await expect(railToggle).toHaveAttribute("aria-expanded", "false");
  await expect(railToggle).toBeFocused();
  await expect(railToggle).toBeVisible();
  await expect(topNav).toHaveCSS("transform", "none");
  const topNavBox = await topNav.boundingBox();
  const viewportHeight = page.viewportSize()?.height ?? 0;
  expect(topNavBox?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((topNavBox?.y ?? 0) + (topNavBox?.height ?? 0)).toBeLessThanOrEqual(
    viewportHeight,
  );

  await railToggle.press("Enter");
  await expect(rail).toHaveAttribute("data-open", "true");
  await expect(railToggle).toHaveAttribute("aria-expanded", "true");
  await expect(railToggle).toBeFocused();
});

test("About lower panels use the approved readable card treatment", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto("/about/");

  const module = page.locator(".about-project__module").first();
  await expect(module).toHaveCSS("background-color", "rgba(20, 28, 49, 0.86)");
  await expect(module).toHaveCSS("border-color", "rgba(177, 139, 183, 0.68)");
  await expect(module.locator("strong")).toHaveCSS("font-size", "15px");
  await expect(module.locator("p")).toHaveCSS("font-size", "12px");
  await expect(module.locator("p")).toHaveCSS("color", "rgb(215, 224, 237)");
  await expect(page.locator(".about-project__research-grid h3").first()).toHaveCSS(
    "font-size",
    "15px",
  );
  await expect(page.locator(".about-project__research-grid p").first()).toHaveCSS(
    "font-size",
    "12px",
  );
  await expect(page.locator(".about-project__route h3").first()).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(page.locator(".about-project__route p").first()).toHaveCSS(
    "font-size",
    "12px",
  );
  await expect(page.locator(".about-project__collection-head p")).toHaveCSS(
    "font-size",
    "12px",
  );
  await expect(page.locator(".about-project__collection-action")).toHaveCSS(
    "font-size",
    "11px",
  );
});

test("901px About lower cards contain their copy without resizing on interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 901, height: 1000 });
  await page.goto("/about/");

  const cardGroups = [
    {
      cards: page.locator(".about-project__module"),
      label: "module",
      textSelector: "small, strong, p",
    },
    {
      cards: page.locator(".about-project__research-grid article"),
      label: "research",
      textSelector: "small, h3, p",
    },
    {
      cards: page.locator(".about-project__route article"),
      label: "route",
      textSelector: "small, h3, p",
    },
  ] as const;

  for (const { cards, label, textSelector } of cardGroups) {
    const measurements = await cards.evaluateAll((elements, selector) =>
      elements.map((element, cardIndex) => {
        const cardRect = element.getBoundingClientRect();
        return {
          cardIndex,
          cardRect: { bottom: cardRect.bottom, right: cardRect.right },
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          textRects: Array.from(element.querySelectorAll(selector)).map((text, textIndex) => {
            const rect = text.getBoundingClientRect();
            return { bottom: rect.bottom, right: rect.right, textIndex };
          }),
        };
      }),
    textSelector);

    expect(measurements.length, `${label} cards must exist`).toBeGreaterThan(0);
    for (const measurement of measurements) {
      expect(
        measurement.scrollHeight,
        `${label} card ${measurement.cardIndex} must not clip vertically`,
      ).toBeLessThanOrEqual(measurement.clientHeight + 1);
      expect(
        measurement.textRects.length,
        `${label} card ${measurement.cardIndex} must expose key copy`,
      ).toBeGreaterThan(0);
      for (const textRect of measurement.textRects) {
        expect(
          textRect.bottom,
          `${label} card ${measurement.cardIndex} text ${textRect.textIndex} must stay above the card bottom`,
        ).toBeLessThanOrEqual(measurement.cardRect.bottom + 1);
        expect(
          textRect.right,
          `${label} card ${measurement.cardIndex} text ${textRect.textIndex} must stay inside the card right edge`,
        ).toBeLessThanOrEqual(measurement.cardRect.right + 1);
      }
    }
  }

  const firstModule = page.locator(".about-project__module").first();
  const readModuleTranslateY = () =>
    firstModule.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    });
  const initialBox = await firstModule.boundingBox();
  expect(initialBox, "module must have initial geometry").not.toBeNull();
  await firstModule.hover();
  await expect.poll(readModuleTranslateY).toBeCloseTo(-3, 1);
  const hoverBox = await firstModule.boundingBox();
  expect(hoverBox, "module must have hover geometry").not.toBeNull();
  await page.mouse.move(0, 0);
  await firstModule.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(firstModule).toBeFocused();
  await expect.poll(readModuleTranslateY).toBeCloseTo(-3, 1);
  const focusBox = await firstModule.boundingBox();
  expect(focusBox, "module must have keyboard-focus geometry").not.toBeNull();

  if (!initialBox || !hoverBox || !focusBox) {
    throw new Error("module geometry must remain measurable across interaction states");
  }

  for (const [state, box] of [
    ["hover", hoverBox],
    ["keyboard focus", focusBox],
  ] as const) {
    expect(
      Math.abs(box.width - initialBox.width),
      `module width must remain stable on ${state}`,
    ).toBeLessThanOrEqual(0.5);
    expect(
      Math.abs(box.height - initialBox.height),
      `module height must remain stable on ${state}`,
    ).toBeLessThanOrEqual(0.5);
  }
});
