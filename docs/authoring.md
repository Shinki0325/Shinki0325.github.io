# Authoring Guide

## Content map

- Put public long-form posts and video scripts in `src/content/articles/`.
- Use `type: script` for video稿 and `type: article` for ordinary public essays.
- Put public references and topic pages in `src/content/references/`.
- Use `kind: source` for a single source card and `kind: topic` for a synthesis/reference hub page.
- Put short public snippets in `src/content/notes/`.
- Put unpublished work in `src/content/drafts/`.
- Put private archive material in `src/content/vault/`.

## Reference rules

- `references` supports `visibility: public | private`.
- Public pages must not wiki-link to private references.
- Use wiki links like `[[PC-9801]]` or `[[Leaf、Key 对谈]]` inside scripts and reference pages.
- Add aliases with `aliases: []` when one reference is likely to be searched under multiple names.
- Public source-style references often include `sourceTitle`, `sourceUrl`, `author`, `quote`, and `note`.

## Local manager workflow

本地后台用于维护稿件、资料库、页面配置和资源文件。

1. Start the local backend with `pnpm dev:manager:server`.
2. Start the local manager UI with `pnpm --filter @maki/manager dev`.
3. Open the manager in the browser and use:
4. `内容` to browse稿件、资料、草稿和私有库。
5. `稿件编辑` to write article/script Markdown and insert wiki links.
6. `资料编辑` to maintain source/topic references with metadata.
7. `页面配置` to edit homepage and reference hub JSON blocks.
8. `资源` to copy local images/files into `public/uploads/`.
9. `概览` to run validate/build/check commands and inspect git status.

## Photo wall workflow

- `src/content/albums/` stores public and hidden photo wall albums.
- Use `draft: true` for albums that are still being assembled.
- Use `visibility: hidden` for albums you want to keep in the local manager but not publish.
- Use `visibility: public` for albums that should appear at `/photowall/`.
- Home search may surface public albums by title and summary, but image-level matches stay inside the photo wall page itself.

Recommended album frontmatter:

```yaml
title: "Leaf / Key 访谈相册"
date: 2026-07-08
summary: "为主稿和资料页整理的一组图片线索。"
cover: "/uploads/albums/leaf-key/cover.jpg"
tags: ["Leaf", "Key", "访谈"]
draft: false
visibility: public
relatedArticles: ["galgame-90s-golden-age"]
relatedReferences: ["leaf-key-interview"]
photos:
  - url: "/uploads/albums/leaf-key/page-01.jpg"
    caption: "卷首页"
    alt: "Leaf / Key 访谈卷首页"
    credit: "原始扫描件"
```

## Manual file workflow

- You can still edit Markdown directly in the repo if that is faster.
- Keep article frontmatter at minimum:

```yaml
title: "My Script"
date: 2026-07-07
summary: "One-line summary."
type: script
tags: ["video"]
draft: false
```

- Keep reference frontmatter at minimum:

```yaml
title: "My Reference"
date: 2026-07-07
summary: "Why it matters."
kind: source
visibility: public
draft: false
```

## Curated reference reading

When a public reference should read like a wiki-style source page, add structured reading data to the frontmatter instead of relying only on the attachment extract.

- `readingMode: curated` tells the site to render curated body text on the left side of the reference page.
- `sourceLanguage` records the original language, such as `ja`, `en`, or `zh`.
- `translationLanguage` records the display translation language. For the current workflow, use `zh-CN` for Chinese translation.
- `readingBlocks` is an ordered list of body paragraphs that readers can quote and navigate inside the site.

Recommended shape:

```yaml
title: "Example Reference"
date: 2026-07-07
summary: "Why it matters."
kind: source
visibility: public
readingMode: curated
sourceLanguage: ja
translationLanguage: zh-CN
readingBlocks:
  - label: "平台定位"
    original: >-
      PC-9801は，1982年10月に日本電気が発表した16ビットパソコン...
    translation: >-
      PC-9801 是日本电气在 1982 年 10 月发布的 16 位个人电脑……
    note: "这一段适合给视频主稿补平台背景。"
    focus: true
  - label: "行业影响"
    original: >-
      PC-9801は，発表以降ビジネス市場を中心に広く受け入れられ...
    translation: >-
      PC-9801 在发布后主要于商用市场迅速普及……
```

Field meanings:

- `original`
  Write the original source paragraph here. For Chinese-language references, this is the main body text readers will see.
- `translation`
  Use this for 对照翻译. Foreign-language references should usually pair each `original` paragraph with a natural Chinese translation.
- `note`
  Use this for editor context, citation hints, or reminders about why a paragraph matters. Keep source text and translation separate from personal notes.
- `focus: true`
  Marks a paragraph as directly useful to the video script. Use it for the most quote-worthy or structure-defining material, while still aiming to整理完整全文 over time.

Authoring rules:

- Prefer complete passage coverage when possible instead of only saving isolated lines.
- If a source is not fully整理完, it can still go public with partial `readingBlocks`, but the most video-relevant paragraphs should be marked with `focus: true`.
- Keep paragraph order aligned with the original source so later expansion to full text stays maintainable.
- Public citations should prefer these internal reference pages first, then branch out to attachments or external links if needed.

## Publishing notes

- The public site remains Astro static output for GitHub Pages.
- Drafts and `vault` content stay out of public build output.
- Run `pnpm validate:public` before publishing if you edited wiki links or visibility.
