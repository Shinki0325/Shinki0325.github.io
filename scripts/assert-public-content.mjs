import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentRoot = fileURLToPath(new URL("../src/content/", import.meta.url));
const distRoot = fileURLToPath(new URL("../dist/", import.meta.url));
const privateCollections = ["drafts", "vault"];
const publicCollections = ["articles", "notes"];

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

for (const collection of privateCollections) {
  console.log(`Private collection preserved locally: ${collection}`);
}

const draftEntries = [];

for (const collection of publicCollections) {
  const collectionRoot = path.join(contentRoot, collection);
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

if (!(await exists(distRoot))) {
  console.log(
    `Build output not found yet. Found ${draftEntries.length} draft entries waiting for post-build verification.`
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
