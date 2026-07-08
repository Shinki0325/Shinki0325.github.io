import { expect, test } from "@playwright/test";

test("reference detail page shows localized side panels", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByText("归档条目", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "基本信息" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "归档文件" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "关联内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "引用此页" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("PC-9801-コンピュータ博物館")).toBeVisible();

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
  await expect(relatedReference).toBeVisible();
  await expect(relatedReference).toHaveAttribute("href", "/references/pc-9800-15-million/");

  const relatedScript = page.getByRole("link", { name: "为什么90年代是galgame真正意义上的黄金年代" });
  await expect(relatedScript).toBeVisible();
  await expect(relatedScript).toHaveAttribute("href", "/articles/galgame-90s-golden-age/");
});

test("pc-9801 reference detail shows curated reading with bilingual body text", async ({ page }) => {
  await page.goto("/references/pc-9801-computer-museum/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();

  const firstReadingBlock = page.locator(".reading-block").filter({
    has: page.getByRole("heading", { name: "机种定位" }),
  });

  await expect(firstReadingBlock).toContainText("PC-9801は，1982年10月に日本電気が発表した16ビットパソコン");
  await expect(firstReadingBlock).toContainText("PC-9801 是日本电气在 1982 年 10 月发布的 16 位个人电脑");
});

test("to-heart reference detail shows a real focus badge from curated reading blocks", async ({ page }) => {
  await page.goto("/references/to-heart-entry/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();

  const focusBlock = page.locator(".reading-block", {
    has: page.getByText("Leaf 转向更大市场"),
  });

  await expect(focusBlock).toContainText("视频重点");
  await expect(focusBlock).toContainText("本作は、サウンドノベルの手法を取り入れた");
  await expect(focusBlock).toContainText("这部作品是 Leaf 推出的第三部系列作");
});
