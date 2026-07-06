import fs from "node:fs";

const input = process.argv[2];

if (!input) {
  console.error("Usage: node scripts/extract-legacy-meta.mjs <html-file>");
  process.exit(1);
}

const html = fs.readFileSync(input, "utf8");
const title =
  html.match(/<h1 class="post-title">([\s\S]*?)<\/h1>/)?.[1].trim() ??
  html.match(/<h1 id="site-title">([\s\S]*?)<\/h1>/)?.[1].trim() ??
  "";
const isoDate =
  html.match(/<time class="post-meta-date-created" datetime="([^"]+)"/)?.[1] ?? "";
const tags = [
  ...html.matchAll(/<a class="post-meta__tags" href="[^"]+">([\s\S]*?)<\/a>/g)
].map((match) => match[1].trim());

console.log(
  JSON.stringify(
    {
      title,
      isoDate,
      tags
    },
    null,
    2
  )
);
