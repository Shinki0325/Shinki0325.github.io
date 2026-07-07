import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
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

export const parseContentFile = (source) => {
  const parsed = matter(source);

  return {
    metadata: {
      title: typeof parsed.data.title === "string" ? parsed.data.title : undefined,
      aliases: Array.isArray(parsed.data.aliases)
        ? parsed.data.aliases.filter((value) => typeof value === "string")
        : [],
      visibility: parsed.data.visibility === "private" ? "private" : "public",
      draft: parsed.data.draft === true
    },
    body: parsed.content.trim()
  };
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
    const parsed = parseContentFile(source);

    if (parsed.metadata.draft) {
      continue;
    }

    references.push({
      slug: toSlug(collectionRoot, filePath),
      title: parsed.metadata.title ?? toSlug(collectionRoot, filePath),
      aliases: parsed.metadata.aliases,
      visibility: parsed.metadata.visibility,
      body: parsed.body
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
    const parsed = parseContentFile(source);

    if (parsed.metadata.draft) {
      continue;
    }

    entries.push({
      slug: toSlug(collectionRoot, filePath),
      title: parsed.metadata.title,
      visibility: "public",
      body: parsed.body
    });
  }

  return entries;
};

export const runPublicContentAssertions = async () => {
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
      const source = await readFile(filePath, "utf8");
      const parsed = parseContentFile(source);

      if (!parsed.metadata.draft) {
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
    return;
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
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runPublicContentAssertions();
}
