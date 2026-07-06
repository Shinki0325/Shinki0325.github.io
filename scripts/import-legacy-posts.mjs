import fs from "node:fs";
import path from "node:path";
import { extractBody, extractMeta } from "./lib/legacy-import.mjs";

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

for (const post of legacyPosts) {
  const shouldForce = process.argv.includes("--force");
  const slugFilters = new Set(
    process.argv
      .filter((arg) => arg.startsWith("--slug="))
      .map((arg) => arg.slice("--slug=".length))
  );

  if (slugFilters.size > 0 && !slugFilters.has(post.slug)) {
    continue;
  }

  const html = fs.readFileSync(post.source, "utf8");
  const { title, isoDate, tags } = extractMeta(html);
  const body = extractBody(html);
  const outPath = new URL(`${post.slug}.md`, outDir);

  if (fs.existsSync(outPath) && !shouldForce) {
    continue;
  }

  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : null;
  const existingFrontmatter = existing?.match(/^---\r?\n[\s\S]*?\r?\n---/)?.[0];

  const markdown = `${existingFrontmatter ?? `---
title: "${title}"
date: ${isoDate.slice(0, 10)}
summary: "${post.summary}"
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
topics: []
draft: false
---`}

${body}
`;

  fs.writeFileSync(outPath, markdown);
  console.log(`Imported ${path.basename(outPath.pathname)}`);
}
