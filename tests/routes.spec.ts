import { expect, test } from "@playwright/test";

test("homepage shows configured article and reference cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Welcome Back" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Example Public Reference" })).toBeVisible();
});

test("homepage exposes config blocks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Scripts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reference Library" })).toBeVisible();
});

test("articles index shows migrated legacy content", async ({ page }) => {
  await page.goto("/articles/");
  await expect(page.getByRole("link", { name: "Internal Draft Article Sentinel" })).toHaveCount(0);
  await expect(page.locator("main")).toContainText("2022");
});

test("draft entries stay off public article and note routes", async ({ page, request }) => {
  await page.goto("/articles/");
  await expect(page.getByRole("link", { name: "Internal Draft Article Sentinel" })).toHaveCount(0);

  await page.goto("/notes/");
  await expect(page.getByText("Internal Draft Note Sentinel")).toHaveCount(0);

  const articleResponse = await request.get("/articles/internal-draft-article-sentinel/");
  expect(articleResponse.status()).toBe(404);

  const noteResponse = await request.get("/notes/internal-draft-note-sentinel/");
  expect(noteResponse.status()).toBe(404);
});

test("reference index shows the public reference library", async ({ page }) => {
  await page.goto("/references/");
  await expect(page.getByRole("heading", { name: "Reference Library" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Example Public Reference" })).toBeVisible();
});

test("reference detail page shows backlinks", async ({ page }) => {
  await page.goto("/references/example-public-reference/");
  await expect(page.getByRole("heading", { name: "Reference Details" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Referenced By" })).toBeVisible();
  await expect(page.getByText("Example Public Source")).toBeVisible();

  const topicBacklink = page.getByRole("link", { name: "Example Topic Reference" });
  await expect(topicBacklink).toBeVisible();
  await expect(topicBacklink).toHaveAttribute("href", "/references/example-topic-reference/");

  const collisionBacklink = page.getByRole("link", { name: "Welcome Reference" });
  await expect(collisionBacklink).toBeVisible();
  await expect(collisionBacklink).toHaveAttribute("href", "/references/welcome/");
});
