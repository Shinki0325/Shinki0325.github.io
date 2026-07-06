import fs from "node:fs";

const input = process.argv[2];

if (!input) {
  console.error("Usage: node scripts/extract-legacy.mjs <html-file>");
  process.exit(1);
}

const html = fs.readFileSync(input, "utf8");
const match =
  html.match(
    /<article class="post-content" id="article-container">([\s\S]*?)<\/article>/
  ) ??
  html.match(/<div id="article-container">([\s\S]*?)<\/div><hr class="custom-hr"/);

if (!match) {
  console.error("Could not find article body");
  process.exit(1);
}

const text = match[1]
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

console.log(text);
