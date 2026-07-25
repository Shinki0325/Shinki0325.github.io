import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const kbRoot = "D:/blog-kb";
const authorityPath = path.join(kbRoot, "processed/indexing/reference-publication-correction-v1.json");
const referencesRoot = path.join(root, "src/content/references");
const attachmentsRoot = path.join(root, "public/uploads/reference-reading");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const readPackage = (file, entry) => {
  if (file.endsWith(".json")) return readJson(file);
  const script = fs.readFileSync(file, "utf8");
  const sectionsSource = script.match(/const sections = (\[[\s\S]*?\n\]);/u)?.[1];
  const summaries = [...script.matchAll(/const fullSummary\d* = ('(?:[^'\\]|\\.)*');/gu)]
    .map((match) => Function(`return ${match[1]}`)());
  if (!sectionsSource) throw new Error(`Cannot parse pilot sections from ${file}`);
  const sections = Function(`return ${sectionsSource}`)();
  const sourceFile = path.join(path.dirname(file), "source-original-ja.txt");
  const lines = fs.readFileSync(sourceFile, "utf8").replace(/^\uFEFF/u, "").split(/\r?\n/u);
  return {
    packageId: entry.content.packageId,
    titleZh: entry.titleZh,
    sourceLanguage: "ja",
    overviewZh: summaries,
    sections: sections.map((section) => ({
      id: section.id,
      titleZh: section.title,
      summaryZh: section.summary,
      startBlockId: `p-${String(section.start).padStart(3, "0")}`,
    })),
    body: {
      file: "source-original-ja.txt",
      paragraphs: lines.map((text, index) => ({
        id: `p-${String(index + 1).padStart(3, "0")}`,
        kind: "paragraph",
        sourceHeading: null,
        text,
      })),
    },
    source: {},
  };
};
const yaml = (value) => JSON.stringify(value ?? "");
const validUrl = (value) => typeof value === "string" && /^https?:\/\//u.test(value) ? value : undefined;
const date = (value) => value ? String(value).slice(0, 10) : "2026-07-25";
const authority = readJson(authorityPath);

if (authority.entries?.length !== 59) throw new Error(`Expected 59 authority rows, received ${authority.entries?.length}`);
if (authority.entries.filter((entry) => entry.route.kind === "source").length !== 58) throw new Error("Expected 58 source rows");
if (authority.entries.filter((entry) => entry.route.kind === "topic").length !== 1) throw new Error("Expected one topic row");

const sectionFor = (domain) => {
  if (/creation|genre|industry/iu.test(domain)) return "作品与人物";
  if (/market|player|place|reception|media/iu.test(domain)) return "回忆、讨论与后见视角";
  return "社会背景";
};

const ownerPublicationFor = (entry) => ({
  decision: entry.authorization.decision,
  decidedAt: entry.authorization.authorizedAt,
  entrance: entry.effectivePublication.entrance,
  overview: entry.effectivePublication.overviewZh,
  chapterSummaries: entry.effectivePublication.sectionSummariesZh,
  sourceBody: entry.effectivePublication.completeSourceBody,
  attachments: entry.effectivePublication.attachment,
});

const readingDocumentFor = (pkg, ownerPublication) => {
  const sourceBlocks = ownerPublication.sourceBody ? [...(pkg.body?.paragraphs ?? [])] : [];
  const blockIndex = new Map(sourceBlocks.map((block, index) => [block.id, index]));
  const sections = pkg.sections ?? [];
  const ids = new Set();
  let previousStart = -1;
  const starts = sections.map((section) => {
    if (!section.id || ids.has(section.id)) throw new Error(`Duplicate chapter id ${section.id} in ${pkg.packageId}`);
    ids.add(section.id);
    const index = blockIndex.get(section.startBlockId);
    if (index === undefined) throw new Error(`Missing chapter anchor ${section.startBlockId} in ${pkg.packageId}`);
    if (index <= previousStart) throw new Error(`Out-of-order chapter anchor ${section.startBlockId} in ${pkg.packageId}`);
    previousStart = index;
    return index;
  });
  return {
    overviewZh: ownerPublication.overview ? (pkg.overviewZh ?? []) : [],
    prefaceBlocks: starts.length ? sourceBlocks.slice(0, starts[0]) : [],
    chapters: sections.map((section, index) => ({
      id: section.id,
      number: index + 1,
      titleZh: section.titleZh,
      summaryZh: ownerPublication.chapterSummaries ? section.summaryZh : undefined,
      startBlockId: section.startBlockId,
      sourceBlocks: sourceBlocks.slice(starts[index], starts[index + 1]),
    })),
    sourceBlocks,
    sourceLanguage: pkg.sourceLanguage ?? "ja",
    publicBodyAllowed: ownerPublication.sourceBody,
  };
};

const existing = new Map();
for (const file of fs.readdirSync(referencesRoot).filter((file) => file.endsWith(".md"))) {
  existing.set(file.replace(/\.md$/u, ""), fs.readFileSync(path.join(referencesRoot, file), "utf8"));
}
const existingField = (source, name) => source.match(new RegExp(`^${name}:\\s*(.+)$`, "mu"))?.[1];

const allowedAttachments = new Set();
const generatedSlugs = new Set();
for (const entry of authority.entries) {
  const slug = entry.route.slug;
  const previous = existing.get(slug) ?? "";
  const pkg = entry.content.packagePath ? readPackage(path.join(kbRoot, entry.content.packagePath), entry) : null;
  const ownerPublication = ownerPublicationFor(entry);
  const source = pkg?.source ?? {};
  const topic = entry.route.kind === "topic";
  const readingDocument = !topic && pkg ? readingDocumentFor(pkg, ownerPublication) : undefined;
  const attachment = ownerPublication.attachments ? entry.content.attachmentPath : null;
  const attachments = attachment ? [attachment] : [];
  const tags = [entry.displayTaxonomy.primaryDomain.labelZh, ...(entry.displayTaxonomy.associationTags ?? [])];

  if (attachment && pkg?.body?.file) {
    const packagePath = path.join(kbRoot, entry.content.packagePath);
    const sourceFile = path.join(fs.statSync(packagePath).isDirectory() ? packagePath : path.dirname(packagePath), pkg.body.file);
    const publicPath = attachment.replace(/^\//u, "").replace(/^uploads\//u, "public/uploads/");
    const target = path.join(root, publicPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourceFile, target);
    allowedAttachments.add(path.basename(target));
  }

  const title = entry.titleZh ?? pkg?.titleZh ?? existingField(previous, "title") ?? slug;
  const summary = pkg?.overviewZh?.[0] ?? existingField(previous, "summary") ?? title;
  const frontmatter = [
    "---",
    `title: ${yaml(title)}`,
    `kind: ${topic ? "topic" : "source"}`,
    "visibility: public",
    `librarySection: ${yaml(sectionFor(entry.displayTaxonomy.primaryDomain.id))}`,
    `date: ${yaml(date(source.publishedAt ?? source.retrievedAt ?? entry.displayTaxonomy.facets.publishedAt))}`,
    `summary: ${yaml(summary)}`,
    `intro: ${yaml((pkg?.overviewZh ?? []).join("\n\n") || summary)}`,
    `tags: ${yaml(tags)}`,
    `topics: ${yaml(entry.displayTaxonomy.facets.topic ? [entry.displayTaxonomy.facets.topic] : [])}`,
    `attachments: ${yaml(attachments)}`,
    "aliases: []",
    "draft: false",
    `sourceIds: ${yaml(entry.sourceIds)}`,
    `sourceType: ${yaml(entry.displayTaxonomy.sourceType.labelZh)}`,
    `sourceTitle: ${yaml(source.title ?? pkg?.sourceTitle ?? title)}`,
    ...(validUrl(source.url) ? [`sourceUrl: ${yaml(source.url)}`] : []),
    `author: ${yaml(source.author || undefined)}`,
    `publishedAt: ${yaml(source.publishedAt || undefined)}`,
    `publisher: ${yaml(source.publisher || undefined)}`,
    `retrievedAt: ${yaml(source.retrievedAt ?? entry.displayTaxonomy.facets.retrievedAt ?? undefined)}`,
    `reliability: ${yaml(entry.displayTaxonomy.facets.reliability)}`,
    `rightsStatus: ${yaml(entry.originalRightsStatus)}`,
    `originalBoundary: ${yaml(entry.originalBoundary)}`,
    `publicationBoundary: ${yaml(entry.originalBoundary)}`,
    `ownerPublication: ${yaml(ownerPublication)}`,
    `readingMode: ${topic ? "extract" : "curated"}`,
    `sourceLanguage: ${yaml(pkg?.sourceLanguage ?? "ja")}`,
    `translationLanguage: "zh-CN"`,
    `readingDocument: ${yaml(readingDocument)}`,
    "readingBlocks: []",
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(referencesRoot, `${slug}.md`), frontmatter, "utf8");
  generatedSlugs.add(slug);
}

for (const file of fs.readdirSync(attachmentsRoot)) {
  if (file.endsWith("--source-original-ja.txt") && !allowedAttachments.has(file)) {
    fs.rmSync(path.join(attachmentsRoot, file));
  }
}

console.log(JSON.stringify({
  authority: authority.entries.length,
  sources: authority.entries.filter((entry) => entry.route.kind === "source").length,
  topics: authority.entries.filter((entry) => entry.route.kind === "topic").length,
  attachments: allowedAttachments.size,
  generated: generatedSlugs.size,
}, null, 2));
