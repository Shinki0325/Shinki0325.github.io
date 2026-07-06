import fs from "node:fs";
import path from "node:path";

const legacyPosts = [
  {
    source: "D:/blog/2021/11/30/LawPhil/index.html",
    slug: "law-philosophy",
    summary: "关于德国古典法哲学与国家观念的一篇课程整理。"
  },
  {
    source: "D:/blog/2021/12/29/vtbfans/index.html",
    slug: "vtb-fans-culture",
    summary: "对中国虚拟偶像粉丝文化变迁的一篇观察。"
  },
  {
    source: "D:/blog/2022/06/05/nichijyou/index.html",
    slug: "nichijyou",
    summary: "围绕日常系叙事、氛围感与超越性消失展开的一篇随笔。"
  },
  {
    source: "D:/blog/2022/10/30/songdaizhibi/index.html",
    slug: "song-dynasty-paper-money",
    summary: "关于宋代纸币发行、制度特征与失败原因的梳理。"
  },
  {
    source: "D:/blog/2022/12/10/agritax/index.html",
    slug: "agricultural-tax",
    summary: "对农业税沿革与税费关系的一篇整理和反思。"
  }
];

const outDir = new URL("../src/content/articles/", import.meta.url);

const extractMeta = (html) => {
  const title =
    html.match(/<h1 class="post-title">([\s\S]*?)<\/h1>/)?.[1].trim() ?? "";
  const isoDate =
    html.match(/<time class="post-meta-date-created" datetime="([^"]+)"/)?.[1] ?? "";
  const tags = [
    ...html.matchAll(/<a class="post-meta__tags" href="[^"]+">([\s\S]*?)<\/a>/g)
  ].map((match) => match[1].trim());

  return { title, isoDate, tags };
};

const extractBody = (html) => {
  const match = html.match(
    /<article class="post-content" id="article-container">([\s\S]*?)<\/article>/
  );

  if (!match) {
    throw new Error("Could not find article body");
  }

  return match[1]
    .replace(
      /<h([1-6]) id="([^"]*)">([\s\S]*?)<\/h\1>/g,
      (_m, level, _id, content) =>
        `\n${"#".repeat(Number(level))} ${content.replace(/<[^>]+>/g, "").trim()}\n`
    )
    .replace(/<p>/g, "\n")
    .replace(/<\/p>/g, "\n")
    .replace(/<blockquote>/g, "\n> ")
    .replace(/<\/blockquote>/g, "\n")
    .replace(/<li>/g, "- ")
    .replace(/<\/li>/g, "\n")
    .replace(/<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>/g, "\n")
    .replace(/<strong>/g, "**")
    .replace(/<\/strong>/g, "**")
    .replace(/<em>/g, "*")
    .replace(/<\/em>/g, "*")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

for (const post of legacyPosts) {
  const html = fs.readFileSync(post.source, "utf8");
  const { title, isoDate, tags } = extractMeta(html);
  const body = extractBody(html);
  const outPath = new URL(`${post.slug}.md`, outDir);

  if (fs.existsSync(outPath)) {
    continue;
  }

  const markdown = `---
title: "${title}"
date: ${isoDate.slice(0, 10)}
summary: "${post.summary}"
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
topics: []
draft: false
---

${body}
`;

  fs.writeFileSync(outPath, markdown);
  console.log(`Imported ${path.basename(outPath.pathname)}`);
}
