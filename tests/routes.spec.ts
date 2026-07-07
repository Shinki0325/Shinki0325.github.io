import { expect, test } from "@playwright/test";

test("reference detail page shows localized side panels", async ({ page }) => {
  await page.goto("/references/example-public-reference/");
  await expect(page.getByText("参考资料", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "资料详情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "关联内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "引用此页" })).toBeVisible();
  await expect(page.getByText("Example Public Source")).toBeVisible();

  const topicBacklink = page.getByRole("link", { name: "Example Topic Reference" });
  await expect(topicBacklink).toBeVisible();
  await expect(topicBacklink).toHaveAttribute("href", "/references/example-topic-reference/");

  const collisionBacklink = page.getByRole("link", { name: "Welcome Reference" });
  await expect(collisionBacklink).toBeVisible();
  await expect(collisionBacklink).toHaveAttribute("href", "/references/welcome/");
});

test("foreign reference detail shows reading shell and extract fallback", async ({ page }) => {
  await page.goto("/references/to-heart-wikipedia/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("视频重点")).toBeVisible();
  await expect(page.getByRole("heading", { name: "站内摘录" })).toBeVisible();
  await expect(page.locator(".text-extract")).toContainText("To Heart - Wikipedia");
});
