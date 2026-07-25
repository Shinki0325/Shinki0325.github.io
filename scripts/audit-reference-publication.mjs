import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const referencesRoot = path.join(root, "src/content/references");
const attachmentRoot = path.join(root, "public/uploads/reference-reading");
const files = fs.readdirSync(referencesRoot).filter((file) => file.endsWith(".md"));
const ownerEntries = [];
const visibleInternalLabels = [];
const attachmentRefs = [];
let summaryAsOriginal = 0;
let missingAnchors = 0;

for (const file of files) {
  const source = fs.readFileSync(path.join(referencesRoot, file), "utf8");
  const owner = source.match(/^ownerPublication:\s*(.+)$/mu)?.[1];
  if (!owner || !owner.includes("project-owner-authorized-all-layers")) continue;
  ownerEntries.push(file);
  const tags = JSON.parse(source.match(/^tags:\s*(.+)$/mu)?.[1] ?? "[]");
  visibleInternalLabels.push(...tags.filter((tag) => /^[a-z0-9]+(?:-[a-z0-9]+)+$/u.test(tag)));
  const attachments = JSON.parse(source.match(/^attachments:\s*(.+)$/mu)?.[1] ?? "[]");
  attachmentRefs.push(...attachments.map((attachment) => path.basename(attachment)));
  const document = JSON.parse(source.match(/^readingDocument:\s*(.+)$/mu)?.[1] ?? "null");
  if (!document) continue;
  const sourceTexts = new Set(document.sourceBlocks.map((block) => block.text));
  summaryAsOriginal += document.overviewZh.filter((text) => sourceTexts.has(text)).length;
  summaryAsOriginal += document.chapters.filter((chapter) => chapter.summaryZh && sourceTexts.has(chapter.summaryZh)).length;
  const sourceIds = new Set(document.sourceBlocks.map((block) => block.id));
  missingAnchors += document.chapters.filter((chapter) => !sourceIds.has(chapter.startBlockId)).length;
}

const diskAttachments = fs.readdirSync(attachmentRoot).filter((file) => file.endsWith("--source-original-ja.txt"));
const orphanAttachments = diskAttachments.filter((file) => !attachmentRefs.includes(file));
const missingAttachments = attachmentRefs.filter((file) => !diskAttachments.includes(file));
const duplicateAttachments = attachmentRefs.filter((file, index) => attachmentRefs.indexOf(file) !== index);
const audit = {
  entries: ownerEntries.length,
  sources: ownerEntries.filter((file) => file !== "galgame-90s-web-archive-package.md").length,
  topics: ownerEntries.filter((file) => file === "galgame-90s-web-archive-package.md").length,
  attachments: attachmentRefs.length,
  summaryAsOriginal,
  visibleInternalLabels,
  missingAnchors,
  orphanAttachments,
  missingAttachments,
  duplicateAttachments,
};

console.log(JSON.stringify(audit, null, 2));
if (audit.entries !== 59 || audit.sources !== 58 || audit.topics !== 1 || audit.attachments !== 58 ||
  summaryAsOriginal || visibleInternalLabels.length || missingAnchors || orphanAttachments.length ||
  missingAttachments.length || duplicateAttachments.length) process.exitCode = 1;
