import { expect, test } from "@playwright/test";

test("homepage shows configured article and reference cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Welcome Back" })).toBeVisible();
  await expect(page.locator(".signal-grid a[href^='/references/']")).toHaveCount(3);
});

test("homepage exposes config blocks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-stage").getByText("Video Script Archive")).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter Reference Library" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reference Signals" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Scripts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reference Library" })).toBeVisible();
});

test("articles index shows migrated legacy content", async ({ page }) => {
  await page.goto("/articles/");
  await expect(page.getByRole("link", { name: "Internal Draft Article Sentinel" })).toHaveCount(0);
  await expect(page.locator("main")).toContainText("2022");
  await expect(
    page.getByRole("link", { name: "杂谈 为什么90年代是galgame真正意义上的黄金年代" })
  ).toBeVisible();
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
  await expect(page.locator(".library-hero").getByRole("heading", { name: "Reference Library" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Example Public Reference" })).toBeVisible();
  await expect(page.getByRole("link", { name: "90年代 galgame 网页归档资料包" })).toBeVisible();
});

test("package notes and topic pages are public", async ({ page }) => {
  await page.goto("/notes/");
  await expect(page.getByRole("link", { name: "核心参考对照表" })).toBeVisible();

  await page.goto("/topics/");
  await expect(page.getByRole("link", { name: "90年代 galgame 资料包" })).toBeVisible();

  await page.goto("/references/galgame-90s-web-archive-package/");
  await expect(page.getByText("53 条网页来源")).toBeVisible();
});

test("independent web archive references are visible from library and topic pages", async ({
  page
}) => {
  await page.goto("/references/");
  await expect(page.getByRole("link", { name: "To Heart - Wikipedia" })).toBeVisible();
  await expect(page.getByRole("link", { name: "PC-9801-コンピュータ博物館" })).toBeVisible();

  await page.goto("/topics/galgame-90s/");
  await expect(page.getByRole("link", { name: "To Heart - Wikipedia" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Leaf、Key対談" }).first()).toBeVisible();
});

test("independent web archive reference pages show archive attachments", async ({ page }) => {
  await page.goto("/references/to-heart-wikipedia/");
  await expect(page.getByRole("heading", { name: "归档文件" })).toBeVisible();
  await expect(page.getByRole("link", { name: "归档网页", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "页面截图", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "文字摘录", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "To Heart - Wikipedia 页面截图" })).toBeVisible();
});

test("reference detail page shows backlinks", async ({ page }) => {
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

test("article detail uses archive showcase framing", async ({ page }) => {
  await page.goto("/articles/welcome/");
  await expect(page.getByText("Archive Entry")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse References" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Entry Lens" })).toBeVisible();
});

test("article detail prefers internal reference pages for citations", async ({ page }) => {
  await page.goto("/articles/galgame-90s-golden-age/");
  await expect(page.getByRole("link", { name: "《YU-NO》资料页" })).toHaveAttribute(
    "href",
    "/references/yu-no-wikipedia/"
  );
  await expect(page.getByRole("link", { name: "《To Heart》资料页" })).toHaveAttribute(
    "href",
    "/references/to-heart-wikipedia/"
  );
  await expect(page.getByRole("heading", { name: "Related References" })).toBeVisible();
});

test("topic detail auto-aggregates public scripts and references", async ({ page }) => {
  await page.goto("/topics/galgame-90s/");
  await expect(page.getByRole("heading", { name: "Scripts in This Topic" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reference Nodes" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "杂谈 为什么90年代是galgame真正意义上的黄金年代" }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "核心参考对照表" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "To Heart - Wikipedia" }).first()).toBeVisible();
});

test("foreign reference detail shows reading shell and fallback extract", async ({ page }) => {
  await page.goto("/references/to-heart-wikipedia/");
  await expect(page.getByRole("heading", { name: "正文阅读" })).toBeVisible();
  await expect(page.getByText("视频重点")).toBeVisible();
  await expect(page.getByRole("heading", { name: "站内摘录" })).toBeVisible();
  await expect(page.locator(".text-extract")).toContainText("To Heart - Wikipedia");
});

test("note detail links back into internal reference pages", async ({ page }) => {
  await page.goto("/notes/核心参考对照表/");
  await expect(page.getByRole("heading", { name: "Note Context" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related References" })).toBeVisible();
  await expect(page.getByRole("link", { name: "《To Heart》资料页" })).toHaveAttribute(
    "href",
    "/references/to-heart-wikipedia/"
  );
  await expect(page.getByRole("link", { name: "To Heart - Wikipedia" }).first()).toBeVisible();
});
