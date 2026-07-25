import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const authorityPath = "D:/blog-kb/processed/indexing/reference-reading-alignment-v1.json";
const catalogPath = "D:/blog-kb/processed/indexing/reference-library-catalog-v1.json";
const packageRoot = "D:/blog-kb/processed/reference-reading";
const referencesRoot = path.join(root, "src/content/references");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const slugify = (value) => value
  .normalize("NFKC")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 96) || "reference-source";
const yaml = (value) => JSON.stringify(value ?? "");
const validUrl = (value) => typeof value === "string" && /^https?:\/\//u.test(value) ? value : undefined;
const date = (value) => value ? String(value).slice(0, 10) : "2026-07-25";

const authority = readJson(authorityPath);
const catalog = readJson(catalogPath);
const catalogSlugBySourceId = new Map(
  (catalog.references ?? []).flatMap((item) =>
    (item.source?.sourceIds ?? []).map((sourceId) => [sourceId, item.slug]),
  ),
);
const rows = authority.rows.filter((row) => ["publish-entry", "topic-index"].includes(row.publicationDisposition));
const packages = new Map();
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name === "reading-package.json") {
      try {
        const pkg = readJson(target);
        if (pkg.sourceId) packages.set(pkg.sourceId, { ...pkg, dir: path.dirname(target) });
      } catch (error) {
        console.warn(`PACKAGE_PARSE_FAILED ${target}: ${error.message}`);
      }
    }
  }
};
walk(packageRoot);

const existingBySourceId = new Map();
const existingFiles = new Set(fs.readdirSync(referencesRoot).filter((file) => file.endsWith(".md")));
for (const file of fs.readdirSync(referencesRoot)) {
  if (!file.endsWith(".md")) continue;
  const text = fs.readFileSync(path.join(referencesRoot, file), "utf8");
  const inline = text.match(/^sourceIds:\s*(\[[^\n]+\])/m)?.[1];
  const multiline = text.match(/^sourceIds:\s*\n((?:\s+-\s+.*\n)+)/m)?.[1];
  const sourceIds = inline ? JSON.parse(inline) : (multiline?.trim().split("\n") ?? []).map((line) => line.replace(/^\s*-\s+/, "").trim().replace(/^['"]|['"]$/g, ""));
  for (const sourceId of sourceIds) if (sourceId) existingBySourceId.set(sourceId, file);
}

const usedSlugs = new Set();
const slugFor = (row, pkg) => {
  const current = existingBySourceId.get(row.sourceIds?.[0]);
  if (current) return current.replace(/\.md$/u, "");
  const catalogSlug = row.sourceIds?.map((sourceId) => catalogSlugBySourceId.get(sourceId)).find(Boolean);
  if (catalogSlug) return catalogSlug;
  const base = slugify(pkg?.packageId ?? row.id.replace(/^.*:/, ""));
  let slug = base;
  let index = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${index++}`;
  usedSlugs.add(slug);
  return slug;
};

const section = (row, pkg) => {
  const domain = row.primaryDomain ?? pkg?.primaryDomain ?? "historical-source";
  if (/creation|industry|creator/i.test(domain)) return "\u4f5c\u54c1\u4e0e\u4eba\u7269";
  if (/market|player|place|reception|media/i.test(domain)) return "\u56de\u5fc6\u3001\u8ba8\u8bba\u4e0e\u540e\u89c1\u89c6\u89d2";
  return "\u793e\u4f1a\u80cc\u666f";
};

const bodyFor = (row, pkg) => {
  const overview = pkg?.overviewZh ?? [];
  const sections = pkg?.sections ?? [];
  const blocks = [
    ...overview.slice(0, 3).map((text, index) => ({ label: `资料总览 ${String(index + 1).padStart(2, "0")}`, original: text, focus: index === 0 })),
    ...sections.slice(0, 8).map((item) => ({ label: item.titleZh, original: item.summaryZh, focus: false })),
  ].filter((block) => block.original?.trim());
  return blocks;
};

const render = (row, pkg, slug) => {
  const source = pkg?.source ?? {};
  const boundary = {
    ...(pkg?.boundary ?? {}),
    ...(row.publicationBoundary ?? {}),
    visibility: "production-authorized",
    publicationDecision: "blog-manager-release-2026-07-25",
  };
  const tags = row.proposedTags?.length ? row.proposedTags : pkg?.tags ?? [];
  const topics = row.topic ? [row.topic] : pkg?.topic ? [pkg.topic] : [];
  const blocks = bodyFor(row, pkg);
  const attachments = [];
  const packageText = pkg?.body?.file;
  if (packageText) {
    const candidate = path.join(pkg.dir, packageText);
    if (fs.existsSync(candidate)) {
      const archiveName = `${slug}--${path.basename(candidate)}`;
      const publicTarget = path.join(root, "public/uploads/reference-reading", archiveName);
      fs.mkdirSync(path.dirname(publicTarget), { recursive: true });
      fs.copyFileSync(candidate, publicTarget);
      attachments.push(`/uploads/reference-reading/${archiveName}`);
    }
  }
  return `---\n` +
    `title: ${yaml(row.title ?? pkg?.titleZh ?? source.title)}\n` +
    `kind: ${row.publicationDisposition === "topic-index" ? "topic" : "source"}\n` +
    `visibility: public\n` +
    `librarySection: ${yaml(section(row, pkg))}\n` +
    `date: ${yaml(date(source.publishedAt ?? source.retrievedAt))}\n` +
    `summary: ${yaml((pkg?.overviewZh ?? [])[0] ?? row.title)}\n` +
    `intro: ${yaml((pkg?.overviewZh ?? [])[0] ?? row.title)}\n` +
    `tags: ${yaml(tags)}\n` +
    `topics: ${yaml(topics)}\n` +
    `attachments: ${yaml(attachments)}\n` +
    `aliases: []\n` +
    `draft: false\n` +
    `sourceIds: ${yaml(row.sourceIds ?? [pkg?.sourceId])}\n` +
    `sourceType: ${yaml(source.sourceType ?? row.sourceType)}\n` +
    `sourceTitle: ${yaml(source.title ?? pkg?.sourceTitle)}\n` +
    `${validUrl(source.url) ? `sourceUrl: ${yaml(source.url)}\n` : ""}` +
    `author: ${yaml(source.author || undefined)}\n` +
    `publishedAt: ${yaml(source.publishedAt || undefined)}\n` +
    `publisher: ${yaml(source.publisher || undefined)}\n` +
    `retrievedAt: ${yaml(source.retrievedAt ?? undefined)}\n` +
    `reliability: ${yaml(row.reliability ?? source.reliability)}\n` +
    `confidence: ${source.confidence ?? row.confidence ?? ""}\n` +
    `rightsStatus: ${yaml(row.rightsStatus ?? boundary.rightsStatus)}\n` +
    `publicationBoundary: ${yaml(boundary)}\n` +
    `readingMode: curated\n` +
    `sourceLanguage: ja\n` +
    `translationLanguage: zh-CN\n` +
    `readingBlocks: ${yaml(blocks)}\n` +
    `---\n`;
};

const unmatched = [];
const generated = [];
for (const row of rows) {
  const pkg = row.sourceIds?.map((id) => packages.get(id)).find(Boolean);
  if (!pkg && row.origin === "unpublished-historical") unmatched.push(row.id);
  const slug = slugFor(row, pkg);
  const target = path.join(referencesRoot, `${slug}.md`);
  if (!existingFiles.has(`${slug}.md`) || row.origin === "unpublished-historical") {
    fs.writeFileSync(target, render(row, pkg, slug), "utf8");
    generated.push(slug);
  }
}

console.log(JSON.stringify({ authority: rows.length, sources: rows.filter((r) => r.publicationDisposition === "publish-entry").length, topics: rows.filter((r) => r.publicationDisposition === "topic-index").length, generated: generated.length, packages: packages.size, unmatched }, null, 2));
if (unmatched.length) process.exitCode = 2;
