import { expect, test } from "@playwright/test";

test("reference detail page shows localized side panels", async ({ page }) => {
  await page.goto("/references/example-public-reference/");
  await expect(page.getByText("参考资料", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "资料详情" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "关联内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "引用此页" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "站内摘录" })).toBeVisible();
  await expect(page.getByText("当前没有可展示的站内摘录")).toBeVisible();
  await expect(page.getByText("Example Public Source")).toBeVisible();

  const topicBacklink = page.getByRole("link", { name: "Example Topic Reference" });
  await expect(topicBacklink).toBeVisible();
  await expect(topicBacklink).toHaveAttribute("href", "/references/example-topic-reference/");

  const collisionBacklink = page.getByRole("link", { name: "Welcome Reference" });
  await expect(collisionBacklink).toBeVisible();
  await expect(collisionBacklink).toHaveAttribute("href", "/references/welcome/");
});

test("pc-9801 reference detail shows curated reading with bilingual body text", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("PC-9801は，1982年10月に日本電気が発表した16ビットパソコン")).toBeVisible();
  await expect(page.getByText("PC-9801 是日本电气在 1982 年 10 月发布的 16 位个人电脑")).toBeVisible();
});

test("to-heart reference detail shows a real focus badge from curated reading blocks", async ({ page }) => {
  await page.goto("/references/to-heart-wikipedia/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();

  const focusBlock = page.locator(".reading-block", {
    has: page.getByText("Leaf 转向更大市场"),
  });

  await expect(focusBlock).toContainText("视频重点");
  await expect(focusBlock).toContainText("本作は、サウンドノベルの手法を取り入れた");
  await expect(focusBlock).toContainText("这部作品是 Leaf 推出的第三部系列作");
});
