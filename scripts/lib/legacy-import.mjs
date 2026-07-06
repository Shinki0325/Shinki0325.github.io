const decodeHtmlEntities = (value) =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

const stripTags = (value) => decodeHtmlEntities(value.replace(/<[^>]+>/g, ""));

const renderImage = (src, alt = "") => {
  const cleanAlt = decodeHtmlEntities(alt) || "Legacy image";

  if (src.startsWith("file:///")) {
    return `\n> Legacy local image not recoverable: ${src}\n`;
  }

  return `\n![${cleanAlt}](${src})\n`;
};

export const extractMeta = (html) => {
  const title =
    html.match(/<h1 class="post-title">([\s\S]*?)<\/h1>/)?.[1].trim() ?? "";
  const isoDate =
    html.match(/<time class="post-meta-date-created" datetime="([^"]+)"/)?.[1] ?? "";
  const tags = [
    ...html.matchAll(/<a class="post-meta__tags" href="[^"]+">([\s\S]*?)<\/a>/g)
  ].map((match) => stripTags(match[1]));

  return { title: stripTags(title), isoDate, tags };
};

export const extractBody = (html) => {
  const match = html.match(
    /<article class="post-content" id="article-container">([\s\S]*?)<\/article>/
  );

  if (!match) {
    throw new Error("Could not find article body");
  }

  return match[1]
    .replace(
      /<a[^>]*>\s*<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>\s*<\/a>/g,
      (_match, src, alt) => renderImage(src, alt)
    )
    .replace(
      /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/g,
      (_match, src, alt) => renderImage(src, alt)
    )
    .replace(
      /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
      (_match, href, content) => `[${stripTags(content) || href}](${href})`
    )
    .replace(
      /<h([1-6]) id="([^"]*)">([\s\S]*?)<\/h\1>/g,
      (_match, level, _id, content) => `\n${"#".repeat(Number(level))} ${stripTags(content)}\n`
    )
    .replace(/<p[^>]*>/g, "\n")
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
