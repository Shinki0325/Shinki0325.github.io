import { expect, test } from "@playwright/test";

test("homepage exposes the three core sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Articles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
});

test("articles index shows migrated legacy titles", async ({ page }) => {
  await page.goto("/articles/");
  await expect(page.getByRole("link", { name: "政府与市场关系之我见" })).toBeVisible();
});
