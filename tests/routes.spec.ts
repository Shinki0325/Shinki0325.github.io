import { expect, test } from "@playwright/test";

test("homepage exposes the three core sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Latest Articles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
});
