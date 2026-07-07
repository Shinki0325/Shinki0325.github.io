import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_TOPIC = "galgame-90s";
const DEFAULT_PUBLIC_PREFIX = "/uploads/galgame-90s-web-archive";
const DEFAULT_RELATED_SCRIPTS = ["galgame-90s-golden-age", "galgame-90s-video-structure"];

const parseCsv = (text) => {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(field);
      field = "";

      if (row.some((item) => item.length > 0)) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);

    if (row.some((item) => item.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

export const parseArchiveCsv = (text) => {
  const normalized = text.replace(/^\uFEFF/, "");
  const newlineIndex = normalized.search(/\r?\n/);
  const body = newlineIndex === -1 ? "" : normalized.slice(newlineIndex + (normalized[newlineIndex] === "\r" ? 2 : 1));
  const rows = parseCsv(body);

  return rows.map((row) => ({
    title: row[0]?.trim() ?? "",
    url: row[1]?.trim() ?? "",
    finalUrl: row[2]?.trim() ?? "",
    fetchedAt: row[3]?.trim() ?? "",
    html: row[4]?.trim() ?? "",
    screenshot: row[5]?.trim() ?? "",
    text: row[6]?.trim() ?? ""
  }));
};

export const normalizeTitle = (title) =>
  title
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*\((\d+\s*ページ目|page\s*\d+)\)\s*$/iu, "")
    .replace(/\s*-\s*\d+\s*ページ目\s*$/iu, "")
    .replace(/\s+page\s+\d+\s*$/iu, "");

const quoteYaml = (value) =>
  `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

const slugify = (title, fallback) => {
  const cleaned = normalizeTitle(title)
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*]/g, " ")
    .replace(/[()（）［］【】「」『』]/g, " ")
    .replace(/&/g, " and ")
    .replace(/\.+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (cleaned || fallback).toLowerCase();
};

const inferSourceType = ({ title, url }) => {
  if (url.includes("wikipedia.org")) return "维基条目";
  if (url.includes("note.com")) return "博客文章";
  if (url.includes("togetter.com")) return "讨论汇编";
  if (url.includes("bilibili.com")) return "社区帖子";
  if (url.includes("x.com")) return "社交媒体";
  if (url.includes("denfaminicogamer.jp")) return "访谈";
  if (url.includes("famitsu.com")) return "特稿文章";
  if (url.includes("gamesdata.info")) return "数据页面";
  if (url.includes("museum.ipsj.or.jp")) return "博物馆档案";
  if (
    url.includes("soumu.go.jp") ||
    url.includes("tv-tokyo.co.jp") ||
    url.includes("sunrise-inc.co.jp") ||
    url.includes("sofmap.co.jp")
  ) {
    return "官方页面";
  }

  if (url.includes("pc.watch.impress.co.jp")) return "新闻报道";
  if (title.includes("売上") || title.includes("销量")) return "数据页面";
  return "网页资料";
};

const inferPublisher = (rawUrl) => {
  if (!rawUrl) {
    return "未知来源";
  }

  const host = new URL(rawUrl).hostname.replace(/^www\./, "");
  const map = new Map([
    ["ja.wikipedia.org", "Wikipedia"],
    ["museum.ipsj.or.jp", "信息处理学会计算机博物馆"],
    ["news.denfaminicogamer.jp", "电法米通电玩情报"],
    ["famitsu.com", "Fami通"],
    ["pc.watch.impress.co.jp", "PC Watch"],
    ["gamesdata.info", "gamesdata.info"],
    ["note.com", "note"],
    ["togetter.com", "Togetter"],
    ["bilibili.com", "哔哩哔哩"],
    ["x.com", "X"],
    ["mypage.otsuka-shokai.co.jp", "大塚商会"],
    ["nlab.itmedia.co.jp", "ITmedia nlab"],
    ["urbanlife.tokyo", "URBAN LIFE METRO"],
    ["blog.toppy.net", "TOPPY.NET"],
    ["eizo22.blog.fc2.com", "FC2 博客"],
    ["minkara.carview.co.jp", "みんカラ"],
    ["sofmap.co.jp", "Sofmap"],
    ["soumu.go.jp", "日本总务省"],
    ["sunrise-inc.co.jp", "SUNRISE"],
    ["tv-tokyo.co.jp", "东京电视台"],
    ["ameblo.jp", "Ameba 博客"],
    ["p-shirokuma.hatenadiary.com", "Hatena Diary"],
    ["setoalpha.hatenablog.com", "Hatena Blog"]
  ]);

  return map.get(host) ?? host;
};

const inferSummary = ({ title, url }) => {
  if (title.includes("PC-9800") || title.includes("PC-9801")) {
    return "补充 PC-98 平台与硬件生态背景的站内归档资料。";
  }

  if (title.includes("同級生") || title.includes("ToHeart") || title.includes("YU-NO")) {
    return "补充九十年代代表作条目与作品史背景的站内归档资料。";
  }

  if (title.includes("売上") || title.includes("销量")) {
    return "补充平台销量与市场规模判断的站内归档资料。";
  }

  if (title.includes("地方") || title.includes("放送") || title.includes("テレビ") || title.includes("地域")) {
    return "补充地域差异、传播渠道与地方收视环境的站内归档资料。";
  }

  if (title.includes("ニフティサーブ") || title.includes("パソコン通信")) {
    return "补充早期网络社群与信息传播环境的站内归档资料。";
  }

  if (url.includes("bilibili.com") || url.includes("togetter.com") || url.includes("x.com")) {
    return "补充后来的玩家讨论、二次传播与社群回看视角的站内归档资料。";
  }

  if (url.includes("note.com") || url.includes("hatena") || url.includes("blog")) {
    return "补充个人回忆、媒介经验与时代体感的站内归档资料。";
  }

  if (url.includes("famitsu.com") || url.includes("denfaminicogamer.jp")) {
    return "补充回顾访谈、行业叙述与后设评价层的站内归档资料。";
  }

  if (url.includes("wikipedia.org")) {
    return "补充基础条目、时间线与节点索引的站内归档资料。";
  }

  return "补充主稿互链所需的站内网页归档资料。";
};

const inferTags = ({ title, url }) => {
  const tags = new Set(["galgame", "90年代", "网页归档"]);

  if (url.includes("wikipedia.org")) tags.add("Wikipedia");
  if (title.includes("売上") || title.includes("销量")) tags.add("市场规模");
  if (title.includes("PC-9800") || title.includes("PC-9801")) {
    tags.add("PC-98");
    tags.add("硬件平台");
  }
  if (title.includes("同級生") || title.includes("ToHeart") || title.includes("YU-NO")) {
    tags.add("作品条目");
  }
  if (title.includes("ニフティサーブ") || title.includes("パソコン通信")) tags.add("网络史");
  if (title.includes("地方") || title.includes("放送") || title.includes("テレビ") || title.includes("地域")) {
    tags.add("地域差异");
    tags.add("传播环境");
  }
  if (url.includes("denfaminicogamer.jp")) tags.add("访谈");
  if (url.includes("famitsu.com")) tags.add("回顾文章");
  if (url.includes("bilibili.com") || url.includes("togetter.com") || url.includes("x.com")) {
    tags.add("社群讨论");
  }
  if (url.includes("note.com") || url.includes("hatena") || url.includes("blog")) tags.add("个人回忆");

  return [...tags];
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const copyIfMissing = async (fromPath, toPath) => {
  if (!(await fileExists(fromPath))) {
    return false;
  }

  if (await fileExists(toPath)) {
    return false;
  }

  await fs.copyFile(fromPath, toPath);
  return true;
};

const readExistingReferences = async (referencesRoot) => {
  const files = (await fs.readdir(referencesRoot)).filter((file) => file.endsWith(".md"));
  const titles = new Set();
  const attachments = new Set();

  for (const file of files) {
    const content = await fs.readFile(path.join(referencesRoot, file), "utf8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = match?.[1] ?? "";
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);

    if (titleMatch) {
      titles.add(normalizeTitle(titleMatch[1]));
    }

    for (const attachmentMatch of frontmatter.matchAll(
      /\/uploads\/galgame-90s-web-archive\/([^\n"]+)/g
    )) {
      attachments.add(attachmentMatch[1].trim());
    }
  }

  return { titles, attachments };
};

const groupRecords = (records) => {
  const groups = new Map();

  for (const record of records) {
    const normalizedTitle = normalizeTitle(record.title);
    const fallback = path.basename(
      record.html || record.text || record.screenshot || record.finalUrl || record.url || "reference",
      path.extname(record.html || record.text || record.screenshot || "")
    );
    const key = normalizedTitle || fallback;
    const group = groups.get(key) ?? {
      key,
      title: normalizedTitle || fallback,
      records: []
    };

    group.records.push(record);
    groups.set(key, group);
  }

  return [...groups.values()];
};

const collectAssets = async ({ group, packageRoot, publicRoot, publicAssetPrefix, existingAttachments }) => {
  const seenNames = new Set();
  const assets = [];
  let copiedAssets = 0;

  for (const record of group.records) {
    const candidates = [
      { folder: "pages", filename: record.html },
      { folder: "screenshots", filename: record.screenshot },
      { folder: "text", filename: record.text }
    ];

    for (const candidate of candidates) {
      if (!candidate.filename) {
        continue;
      }

      const basename = path.basename(candidate.filename);

      if (!basename || seenNames.has(basename)) {
        continue;
      }

      seenNames.add(basename);

      const sourcePath = path.join(packageRoot, candidate.folder, candidate.filename);
      const targetPath = path.join(publicRoot, basename);
      const assetHref = `${publicAssetPrefix}/${basename}`;

      if (await copyIfMissing(sourcePath, targetPath)) {
        copiedAssets += 1;
      }

      if ((await fileExists(sourcePath)) || existingAttachments.has(basename) || (await fileExists(targetPath))) {
        assets.push(assetHref);
      }
    }
  }

  return {
    assets,
    copiedAssets
  };
};

const buildReferenceCard = ({ group, assets, publicAssetPrefix }) => {
  const primary = group.records[0];
  const canonicalUrl = primary.finalUrl || primary.url;
  const fallback = path.basename(
    primary.html || primary.text || primary.screenshot || canonicalUrl || "reference",
    path.extname(primary.html || primary.text || primary.screenshot || "")
  );
  const slug = slugify(group.title, fallback);
  const lines = [
    "---",
    `title: ${quoteYaml(group.title)}`,
    'kind: "source"',
    'visibility: "public"',
    `date: ${quoteYaml((primary.fetchedAt || "2026-07-07").slice(0, 10))}`,
    `summary: ${quoteYaml(inferSummary({ title: group.title, url: canonicalUrl }))}`,
    `tags: [${inferTags({ title: group.title, url: canonicalUrl })
      .map((tag) => quoteYaml(tag))
      .join(", ")}]`,
    `topics: [${quoteYaml(DEFAULT_TOPIC)}]`,
    "attachments:"
  ];

  for (const asset of assets) {
    lines.push(`  - ${quoteYaml(asset)}`);
  }

  lines.push(`sourceType: ${quoteYaml(inferSourceType({ title: group.title, url: canonicalUrl }))}`);
  lines.push(`sourceTitle: ${quoteYaml(group.title)}`);
  lines.push(`sourceUrl: ${quoteYaml(canonicalUrl)}`);
  lines.push(`publisher: ${quoteYaml(inferPublisher(canonicalUrl))}`);
  lines.push(
    `note: ${quoteYaml(
      "当前先公开站内归档文本与附件入口，后续再补全文分段整理、重点标注与对照翻译。"
    )}`
  );
  lines.push(`relatedScripts: [${DEFAULT_RELATED_SCRIPTS.map((item) => quoteYaml(item)).join(", ")}]`);
  lines.push('readingMode: "extract"');
  lines.push("draft: false");
  lines.push("---");
  lines.push("");
  lines.push("这份参考资料已经接入站内归档文本与附件，可先直接在左侧阅读正文摘录。");
  lines.push("后续会继续补充逐段整理、重点标注，以及必要的对照翻译。");
  lines.push("");

  return {
    slug,
    content: `${lines.join("\n")}\n`,
    publicAssetPrefix
  };
};

export const importWebArchiveReferences = async ({
  packageRoot,
  publicRoot,
  referencesRoot,
  publicAssetPrefix = DEFAULT_PUBLIC_PREFIX
}) => {
  await ensureDir(publicRoot);
  await ensureDir(referencesRoot);

  const rawCsv = (await fs.readFile(path.join(packageRoot, "sources.csv"), "utf8")).replace(/^\uFEFF/, "");
  const records = parseArchiveCsv(rawCsv);
  const groups = groupRecords(records);
  const existing = await readExistingReferences(referencesRoot);

  let copiedAssets = 0;
  let createdCards = 0;
  let skippedExisting = 0;

  for (const group of groups) {
    const { assets, copiedAssets: copiedForGroup } = await collectAssets({
      group,
      packageRoot,
      publicRoot,
      publicAssetPrefix,
      existingAttachments: existing.attachments
    });

    copiedAssets += copiedForGroup;

    if (existing.titles.has(group.title)) {
      skippedExisting += 1;
      continue;
    }

    if (assets.length === 0) {
      continue;
    }

    const { slug, content } = buildReferenceCard({ group, assets, publicAssetPrefix });
    const filePath = path.join(referencesRoot, `${slug}.md`);

    if (await fileExists(filePath)) {
      skippedExisting += 1;
      continue;
    }

    await fs.writeFile(filePath, content, "utf8");
    existing.titles.add(group.title);

    for (const asset of assets) {
      existing.attachments.add(path.basename(asset));
    }

    createdCards += 1;
  }

  return {
    records: records.length,
    groups: groups.length,
    copiedAssets,
    createdCards,
    skippedExisting
  };
};
