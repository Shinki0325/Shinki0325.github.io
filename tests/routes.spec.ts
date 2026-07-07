import { expect, test } from "@playwright/test";

test("homepage exposes the three core sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Articles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Referenced By" })).toBeVisible();
});
