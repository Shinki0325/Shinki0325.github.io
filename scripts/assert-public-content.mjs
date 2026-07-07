import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildReferenceGraph
} from "../packages/content-core/src/reference-graph.ts";
import {
  validatePublicLinks
} from "../packages/content-core/src/validation.ts";

const contentRoot = fileURLToPath(new URL("../src/content/", import.meta.url));
const distRoot = fileURLToPath(new URL("../dist/", import.meta.url));
const privateCollections = ["drafts", "vault"];
const publicCollections = ["articles", "notes", "references"];

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const collectMarkdownFiles = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const nextPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(nextPath)));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(nextPath);
    }
  }

  return files;
};

const readDraftStatus = async (filePath) => {
  const source = await readFile(filePath, "utf8");
  const draftMatch = source.match(/^---\r?\n[\s\S]*?\bdraft:\s*(true|false)\b[\s\S]*?\r?\n---/m);
  return draftMatch?.[1] === "true";
};

const splitFrontmatter = (source) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: "",
      body: source
    };
  }

  return {
    frontmatter: match[1],
    body: match[2]
  };
};

const readFrontmatterField = (frontmatter, fieldName) => {
  const match = frontmatter.match(new RegExp(`^${fieldName}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
};

const readStringField = (frontmatter, fieldName) => {
  const rawValue = readFrontmatterField(frontmatter, fieldName);

  if (!rawValue) {
    return undefined;
  }

  return rawValue.replace(/^['"]|['"]$/g, "");
};

const readBooleanField = (frontmatter, fieldName, fallback = false) => {
  const rawValue = readFrontmatterField(frontmatter, fieldName);

  if (!rawValue) {
    return fallback;
  }

  return rawValue === "true";
};

const readStringArrayField = (frontmatter, fieldName) => {
  const rawValue = readFrontmatterField(frontmatter, fieldName);

  if (!rawValue) {
    return [];
  }

  const trimmed = rawValue.trim();

  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }

  return trimmed
    .slice(1, -1)
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
};

const toSlug = (collectionRoot, filePath) =>
  path.relative(collectionRoot, filePath).replace(/\\/g, "/").replace(/\.(md|mdx)$/i, "");

const readReferenceEntries = async () => {
  const collectionRoot = path.join(contentRoot, "references");

  if (!(await exists(collectionRoot))) {
    return [];
  }

  const files = await collectMarkdownFiles(collectionRoot);
  const references = [];

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatter(source);

    if (readBooleanField(frontmatter, "draft")) {
      continue;
    }

    references.push({
      slug: toSlug(collectionRoot, filePath),
      title: readStringField(frontmatter, "title") ?? toSlug(collectionRoot, filePath),
      aliases: readStringArrayField(frontmatter, "aliases"),
      visibility: readStringField(frontmatter, "visibility") === "private" ? "private" : "public",
      body
    });
  }

  return references;
};

const readPublicEntries = async (collection) => {
  const collectionRoot = path.join(contentRoot, collection);

  if (!(await exists(collectionRoot))) {
    return [];
  }

  const files = await collectMarkdownFiles(collectionRoot);
  const entries = [];

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatter(source);

    if (readBooleanField(frontmatter, "draft")) {
      continue;
    }

    entries.push({
      slug: toSlug(collectionRoot, filePath),
      title: readStringField(frontmatter, "title"),
      visibility: "public",
      body
    });
  }

  return entries;
};

for (const collection of privateCollections) {
  console.log(`Private collection preserved locally: ${collection}`);
}

const draftEntries = [];

for (const collection of publicCollections) {
  const collectionRoot = path.join(contentRoot, collection);

  if (!(await exists(collectionRoot))) {
    continue;
  }

  const files = await collectMarkdownFiles(collectionRoot);

  for (const filePath of files) {
    if (!(await readDraftStatus(filePath))) {
      continue;
    }

    const relativePath = path.relative(collectionRoot, filePath).replace(/\\/g, "/");
    const slug = relativePath.replace(/\.(md|mdx)$/i, "");

    draftEntries.push({ collection, slug });
  }
}

const references = await readReferenceEntries();
const linkSources = [
  ...(await readPublicEntries("articles")),
  ...(await readPublicEntries("notes")),
  ...references
    .filter((entry) => entry.visibility === "public")
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      visibility: entry.visibility,
      body: entry.body
    }))
];
const validation = validatePublicLinks(buildReferenceGraph(references, linkSources));

if (validation.errors.length > 0) {
  throw new Error(validation.errors.join("\n"));
}

if (!(await exists(distRoot))) {
  console.log(
    `Build output not found yet. Verified links and found ${draftEntries.length} draft entries waiting for post-build verification.`
  );
  process.exit(0);
}

const leakedDrafts = [];

for (const entry of draftEntries) {
  const outputPath = path.join(distRoot, entry.collection, ...entry.slug.split("/"), "index.html");

  if (await exists(outputPath)) {
    leakedDrafts.push(`${entry.collection}/${entry.slug}`);
  }
}

for (const collection of privateCollections) {
  const privateOutputPath = path.join(distRoot, collection);

  if (await exists(privateOutputPath)) {
    leakedDrafts.push(`${collection}/`);
  }
}

if (leakedDrafts.length > 0) {
  throw new Error(`Private content leaked into dist: ${leakedDrafts.join(", ")}`);
}

console.log(`Verified ${draftEntries.length} draft entries are excluded from dist.`);
