import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import bangumiCollections from "../src/data/bangumi-collections.json";
import { buildAboutCollectionPayload } from "../src/lib/about-collection";
import { GET, prerender } from "../src/pages/data/about-collection.json";

const extractSection = (source: string, attribute: string) => {
  const section = source.match(
    new RegExp(`<section\\b(?=[^>]*\\b${attribute}\\b)[^>]*>([\\s\\S]*?)<\\/section>`),
  );

  expect(section, `expected section with ${attribute}`).not.toBeNull();
  return section?.[1] ?? "";
};

describe("About project overview production assets", () => {
  it("uses the BaseLayout main landmark without nesting another main", async () => {
    const aboutSource = await readFile("src/pages/about.astro", "utf8");

    expect(aboutSource).toContain('<div class="about-project" data-about-project>');
    expect(aboutSource).not.toContain('<main class="about-project" data-about-project>');
  });

  it("wraps the identity heading in a valid flow container", async () => {
    const aboutSource = await readFile("src/pages/about.astro", "utf8");

    expect(aboutSource).toMatch(
      /<div>\s*<small>ABOUT THIS PROJECT<\/small>\s*<h1>美少女游戏生态档案<\/h1>\s*<\/div>/,
    );
    expect(aboutSource).not.toMatch(
      /<span>\s*<small>ABOUT THIS PROJECT<\/small>\s*<h1>美少女游戏生态档案<\/h1>\s*<\/span>/,
    );
  });

  it("locks the approved hierarchy, copy, links, and deferred collection shell", async () => {
    const aboutSource = await readFile("src/pages/about.astro", "utf8");
    const moduleBlock = aboutSource.match(/const modules = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
    const moduleHrefs = [...moduleBlock.matchAll(/href: "([^"]+)"/g)].map((match) => match[1]);
    const researchSection = extractSection(aboutSource, "data-about-research");
    const routeSection = extractSection(aboutSource, "data-about-route");
    const tags = aboutSource.match(
      /\{\[([^\]]+)\]\.map\(\(tag\) => <span>\{tag\}<\/span>\)\}/,
    )?.[1] ?? "";
    const panel = aboutSource.match(
      /<div\s+class="about-project__collection-panel"([^>]*)>([\s\S]*?)<\/div>/,
    );
    const payload = buildAboutCollectionPayload(bangumiCollections);

    expect(moduleHrefs).toEqual([
      "/?archive=birthday#character-archive",
      "/?archive=height#character-archive",
      "/galgame-history/",
      "/#home-music-card",
    ]);
    expect(moduleBlock.match(/index: "\d{2}"/g)).toHaveLength(4);
    for (const [title, copy] of [
      ["角色生日星图", "按日期阅读角色、作品和相邻生日关系。"],
      ["角色身高图鉴", "用立绘比例查看角色视觉设定。"],
      ["GALGAME CHRONICLE", "按时间和分支路线阅读历史词条。"],
      ["首页音乐盒", "品鉴旮旯game主理人的音乐品位。"],
    ]) {
      expect(moduleBlock).toContain(`title: "${title}"`);
      expect(moduleBlock).toContain(`copy: "${copy}"`);
    }

    expect(aboutSource).toContain(
      "<h2>并非追忆往昔的荣光，<br /><strong>而是重现诞生这些美妙故事的瞬间</strong></h2>",
    );
    expect(aboutSource).toContain(
      "这里记录的不只是作品本身，也追寻它们诞生时的制作现场、玩家记忆与时代空气。希望当我们再次回望那些故事时，看到的不仅是屏幕中的角色，也能重新靠近那些创造它、等待它，并曾为它心动的人们。",
    );
    for (const approvedCopy of [
      "PROJECT OVERVIEW",
      "SYSTEM / PROJECT OVERVIEW",
      "已经完成的入口",
      "ONLINE MODULES / 04",
      "正在推进的内容",
      "RESEARCH IN PROGRESS",
      "项目路线",
      "PROJECT ROUTE",
      "PERSONAL COLLECTION",
      "番组收藏档案",
      "个人观看、游玩与评分记录，放在项目主线之后。",
      "默认展示六项个人收藏；完整筛选仅在展开后加载。",
      "展开完整收藏",
      "</strong>动画",
      "</strong>游戏",
    ]) {
      expect(aboutSource).toContain(approvedCopy);
    }
    expect([...tags.matchAll(/"([^"]+)"/g)].map((match) => match[1])).toEqual([
      "作品",
      "制作方",
      "玩家",
      "社会背景",
      "互动游戏",
    ]);

    expect(researchSection.match(/<article>/g)).toHaveLength(4);
    for (const [label, title, copy] of [
      ["DATA<br />BUILDING", "作品与歌手分析", "整理 ErogameScape、VNDB、Bangumi 中的作品、歌曲、歌手、制作方与评价关系。"],
      ["GAME<br />DESIGN", "资料驱动问答游戏", "把已经核实的知识库内容转化成可以游玩的提问与反馈。"],
      ["TEXT<br />EDITING", "Chronicle 词条整理", "继续整理具体历史词条，并补充来源、时间与相互关系。"],
      ["SOURCE<br />REVIEW", "分析资料扩展", "保留来源、版本和不确定性，再逐步开放比较与分析视图。"],
    ]) {
      expect(researchSection).toContain(`<small>${label}</small>`);
      expect(researchSection).toContain(`<h3>${title}</h3>`);
      expect(researchSection).toContain(`<p>${copy}</p>`);
    }

    expect(routeSection.match(/<article(?:\s+class="is-future")?>/g)).toHaveLength(3);
    for (const [label, title, copy] of [
      ["01 / ARCHIVE", "资料档案", "完善资料入口、角色图鉴和历史编年结构。"],
      ["02 / PLAY", "问答游戏", "以核实后的知识库为基础开发网页问答。"],
      ["03 / ECOLOGY", "互动世界", "以 80-90 年代业界生态为背景制作网页互动游戏。"],
    ]) {
      expect(routeSection).toContain(`<small>${label}</small>`);
      expect(routeSection).toContain(`<h3>${title}</h3>`);
      expect(routeSection).toContain(`<p>${copy}</p>`);
    }

    expect(aboutSource.match(/collection\.showcase\.map/g)).toHaveLength(1);
    expect(aboutSource).not.toMatch(/collection\.items\.map|displayedBangumiItems\.map/);
    expect(payload.showcase).toHaveLength(6);
    expect(panel).not.toBeNull();
    expect(panel?.[1]).toMatch(/\bdata-about-collection-panel\b/);
    expect(panel?.[1]).toMatch(/\bhidden\b/);
    expect(panel?.[1]).toMatch(/\bid="about-collection-panel"/);
    expect(panel?.[2].trim()).toBe("");
    expect(aboutSource).toContain("data-about-collection-toggle");
    expect(aboutSource).toContain('/data/about-collection.json');
    expect(aboutSource).not.toContain('class="about-cover"');
    expect(aboutSource).not.toContain("data-about-tabs");
  });

  it("defines a prerendered deferred collection endpoint", async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(prerender).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    await expect(response.json()).resolves.toEqual(
      buildAboutCollectionPayload(bangumiCollections),
    );
  });

  it("ships the approved bounded transparent guide WebP", async () => {
    const filePath = path.join(
      process.cwd(),
      "public/uploads/about/about-guide-character.webp",
    );
    const [file, bytes, metadata] = await Promise.all([
      stat(filePath),
      readFile(filePath),
      sharp(filePath).metadata(),
    ]);
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(696);
    expect(metadata.height).toBe(1773);
    expect(metadata.hasAlpha).toBe(true);
    expect(file.size).toBeLessThan(180_000);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "afaa50f82b55fcf44befca82a39a7e98510025e03e0cb62b4229eb630fbd4f79",
    );
  });
});
