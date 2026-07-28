import { expect, test } from "@playwright/test";

test("reference detail page shows localized side panels", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByText("归档条目", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "基本信息" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "归档文件" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "关联内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "引用此页" })).toBeVisible();
  await expect(page.getByText("PC-9801-コンピュータ博物館")).toBeVisible();
  await expect(page.locator("[data-reference-source-page]")).toHaveCount(0);
  await expect(page.getByText("当前资料暂无可展示的站内正文")).toBeVisible();

  const basicInfoPanel = page.locator(".side-panel", {
    has: page.getByRole("heading", { name: "基本信息" }),
  });
  await expect(basicInfoPanel.locator("dt", { hasText: /^类型$/ })).toHaveCount(0);
  await expect(basicInfoPanel.locator("dt", { hasText: /^主题$/ })).toHaveCount(0);
  await expect(basicInfoPanel.locator("dt", { hasText: /^标签$/ })).toHaveCount(0);
  await expect(basicInfoPanel.locator("[data-reference-tags]")).toBeVisible();
  await expect(basicInfoPanel.locator("[data-reference-tags] a", { hasText: "pc-98" })).toBeVisible();
  await expect(page.getByText("文字摘录默认下载")).toHaveCount(0);

  const relatedReference = page.getByRole("link", { name: "PC-9800 累计销量报道" });
  await expect(relatedReference).toHaveCount(0);

  const relatedScript = page.getByRole("link", { name: "为什么90年代是galgame真正意义上的黄金年代" });
  await expect(relatedScript).toBeVisible();
  await expect(relatedScript).toHaveAttribute("href", "/articles/galgame-90s-golden-age/");
});

test("pc-9801 reference detail keeps unpublished reading content pending", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByText("STATUS / PENDING")).toBeVisible();
  await expect(page.getByText("当前资料暂无可展示的站内正文")).toBeVisible();
  await expect(page.locator('[data-reference-reading-state="pending"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "机种定位" })).toHaveCount(0);
});

test("to-heart reference detail keeps unpublished reading content pending", async ({ page }) => {
  await page.goto("/references/to-heart-entry/");
  await expect(page.getByText("STATUS / PENDING")).toBeVisible();
  await expect(page.getByText("当前资料暂无可展示的站内正文")).toBeVisible();
  await expect(page.locator('[data-reference-reading-state="pending"]')).toHaveCount(1);
  await expect(page.getByText("Leaf 转向更大市场")).toHaveCount(0);
});
