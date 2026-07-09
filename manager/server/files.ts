import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { uploadOriginalToImageHost } from "./imageHost";
import type {
  AssetImageCrop,
  AssetItem,
  ContentEntry,
  ContentKind,
  ContentListItem,
  PageConfigFile,
  PageConfigName,
  SaveContentPayload
} from "../src/types";

const execFileAsync = promisify(execFile);

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(managerRoot, "..");
const contentRoot = path.join(repoRoot, "src", "content");
const pageConfigRoot = path.join(repoRoot, "src", "config", "pages");
const publicRoot = path.join(repoRoot, "public");
const uploadRoot = path.join(publicRoot, "uploads");
const convertScriptPath = path.join(repoRoot, "scripts", "convert_image_to_webp.py");
const cropRegionScriptPath = path.join(repoRoot, "scripts", "crop_image_region.py");

const CONTENT_DIRS: Record<ContentKind, string> = {
  articles: "articles",
  albums: "albums",
  references: "references",
  drafts: "drafts",
  notes: "notes",
  topics: "topics",
  vault: "vault"
};

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const PAGE_CONFIGS: PageConfigName[] = ["home", "references", "appearance"];

const walkMarkdownFiles = async (dir: string): Promise<string[]> => {
  try {
    await fs.access(dir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkMarkdownFiles(fullPath);
      }
      return MARKDOWN_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
    })
  );

  return files.flat();
};

const walkFiles = async (dir: string): Promise<string[]> => {
  try {
    await fs.access(dir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }
      return [fullPath];
    })
  );

  return files.flat();
};

const toIsoDate = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return undefined;
};

const compareEntries = (a: ContentListItem, b: ContentListItem) => {
  const aTime = a.date ? Date.parse(a.date) : 0;
  const bTime = b.date ? Date.parse(b.date) : 0;
  if (aTime !== bTime) {
    return bTime - aTime;
  }
  return a.title.localeCompare(b.title, "zh-Hans-CN");
};

export const getRepoRoot = () => repoRoot;

export const getContentRoot = () => contentRoot;

export const getContentKinds = (): ContentKind[] => Object.keys(CONTENT_DIRS) as ContentKind[];

export const getPageConfigNames = () => PAGE_CONFIGS;

export const listEntries = async (kind: ContentKind): Promise<ContentListItem[]> => {
  const dirName = CONTENT_DIRS[kind];
  const directory = path.join(contentRoot, dirName);
  const files = await walkMarkdownFiles(directory);

  const items = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(directory, filePath).replaceAll(path.sep, "/");
      const slug = relativePath.replace(/\.(md|mdx)$/i, "");
      const source = await fs.readFile(filePath, "utf8");
      const parsed = matter(source);

      return {
        kind,
        slug,
        title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
        summary: typeof parsed.data.summary === "string" ? parsed.data.summary : undefined,
        date: toIsoDate(parsed.data.date),
        draft: parsed.data.draft === true,
        visibility:
          typeof parsed.data.visibility === "string" ? parsed.data.visibility : undefined,
        path: filePath
      } satisfies ContentListItem;
    })
  );

  return items.sort(compareEntries);
};

const toRelativePosixPath = (baseDir: string, targetPath: string) =>
  path.relative(baseDir, targetPath).replaceAll(path.sep, "/");

const isWithinDirectory = (root: string, targetPath: string) => {
  const relativePath = path.relative(root, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
};

const slugifyFilename = (value: string, fallback = "image") => {
  const basename = path.basename(value, path.extname(value));
  return (
    basename
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
};

const resolveUploadTarget = (targetDir = "", filename = "image") => {
  const outputDir = path.resolve(uploadRoot, targetDir.replace(/\.\./g, "").replace(/^\/+/, ""));
  if (!isWithinDirectory(uploadRoot, outputDir)) {
    throw new Error("Invalid asset directory.");
  }

  const destinationPath = path.resolve(outputDir, `${slugifyFilename(filename)}.webp`);
  if (!isWithinDirectory(uploadRoot, destinationPath)) {
    throw new Error("Invalid asset destination.");
  }

  return destinationPath;
};

const toAssetItem = async (destinationPath: string): Promise<AssetItem> => ({
  path: toRelativePosixPath(publicRoot, destinationPath),
  url: `/${toRelativePosixPath(publicRoot, destinationPath)}`,
  size: (await fs.stat(destinationPath)).size
});

const resolveMarkdownPath = (kind: ContentKind, slug: string) => {
  const directory = path.join(contentRoot, CONTENT_DIRS[kind]);
  const normalizedSlug = slug.replaceAll("\\", "/").replace(/^\/+/, "").replace(/\.\./g, "");
  const filePath = path.resolve(directory, `${normalizedSlug}.md`);

  if (!filePath.startsWith(directory)) {
    throw new Error("Invalid slug path.");
  }

  return filePath;
};

const normalizeWindowsPath = (inputPath: string) => {
  const windowsPathMatch = inputPath.match(/^([A-Za-z]):[\\/](.*)$/);
  if (!windowsPathMatch) {
    return inputPath;
  }

  const [, drive, remainder] = windowsPathMatch;
  return `/mnt/${drive.toLowerCase()}/${remainder.replaceAll("\\", "/")}`;
};

export const readEntry = async (kind: ContentKind, slug: string): Promise<ContentEntry> => {
  const filePath = resolveMarkdownPath(kind, slug);
  const source = await fs.readFile(filePath, "utf8");
  const parsed = matter(source);

  return {
    kind,
    slug,
    frontmatter: parsed.data,
    body: parsed.content,
    path: filePath
  };
};

export const saveMarkdownEntry = async ({
  kind,
  slug,
  frontmatter,
  body
}: SaveContentPayload): Promise<ContentEntry> => {
  const filePath = resolveMarkdownPath(kind, slug);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const output = matter.stringify(body, frontmatter);
  await fs.writeFile(filePath, output, "utf8");
  return readEntry(kind, slug);
};

const getPageConfigPath = (name: PageConfigName) => path.join(pageConfigRoot, `${name}.json`);

export const readPageConfig = async (name: PageConfigName): Promise<PageConfigFile> => {
  const filePath = getPageConfigPath(name);
  return {
    name,
    path: filePath,
    json: await fs.readFile(filePath, "utf8")
  };
};

export const savePageConfig = async (name: PageConfigName, json: string) => {
  const filePath = getPageConfigPath(name);
  const parsed = JSON.parse(json);
  const normalized = `${JSON.stringify(parsed, null, 2)}\n`;
  await fs.writeFile(filePath, normalized, "utf8");
  return readPageConfig(name);
};

export const listAssets = async (): Promise<AssetItem[]> => {
  const files = await walkFiles(publicRoot);
  const items = await Promise.all(
    files.map(async (filePath) => {
      const stat = await fs.stat(filePath);
      return {
        path: toRelativePosixPath(publicRoot, filePath),
        url: `/${toRelativePosixPath(publicRoot, filePath)}`,
        size: stat.size
      } satisfies AssetItem;
    })
  );

  return items.sort((a, b) => a.path.localeCompare(b.path, "zh-Hans-CN"));
};

export const copyAsset = async (sourcePath: string, targetDir = "") => {
  const normalizedSource = normalizeWindowsPath(sourcePath.trim());
  const sourceFile = path.resolve(normalizedSource);
  const stat = await fs.stat(sourceFile);

  if (!stat.isFile()) {
    throw new Error("Source path must be a file.");
  }

  const outputDir = path.resolve(uploadRoot, targetDir.replace(/\.\./g, ""));
  if (!outputDir.startsWith(uploadRoot)) {
    throw new Error("Invalid asset directory.");
  }

  await fs.mkdir(outputDir, { recursive: true });
  const destinationPath = path.join(outputDir, path.basename(sourceFile));
  await fs.copyFile(sourceFile, destinationPath);

  return {
    path: toRelativePosixPath(publicRoot, destinationPath),
    url: `/${toRelativePosixPath(publicRoot, destinationPath)}`,
    size: (await fs.stat(destinationPath)).size
  } satisfies AssetItem;
};

export const saveUploadedAssetImage = async (
  buffer: Buffer,
  targetDir = "",
  filename = "image",
  contentType = "image/jpeg"
) => {
  const destinationPath = resolveUploadTarget(targetDir, filename);
  const originalUrl = await uploadOriginalToImageHost(buffer, targetDir, slugifyFilename(filename), contentType);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "manager-asset-image-"));
  const tempPath = path.join(tempDir, "upload-image");

  try {
    await fs.writeFile(tempPath, buffer);
    await execFileAsync("python3", [convertScriptPath, tempPath, destinationPath]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  return {
    ...(await toAssetItem(destinationPath)),
    ...(originalUrl ? { originalUrl } : {})
  };
};

export const cropAssetImage = async (
  sourceUrl: string,
  targetDir: string,
  filename: string,
  crop: AssetImageCrop,
  outputWidth: number,
  outputHeight: number
) => {
  const sourcePath = path.resolve(publicRoot, sourceUrl.replace(/^\/+/, ""));
  if (!isWithinDirectory(publicRoot, sourcePath)) {
    throw new Error("Invalid sourceUrl path.");
  }
  if (
    !Number.isFinite(crop.x) ||
    !Number.isFinite(crop.y) ||
    !Number.isFinite(crop.width) ||
    !Number.isFinite(crop.height) ||
    crop.width <= 0 ||
    crop.height <= 0
  ) {
    throw new Error("crop must include positive x, y, width, and height.");
  }
  if (!Number.isFinite(outputWidth) || !Number.isFinite(outputHeight) || outputWidth <= 0 || outputHeight <= 0) {
    throw new Error("outputWidth and outputHeight must be positive.");
  }

  const destinationPath = resolveUploadTarget(targetDir, filename);
  const cropArg = [
    Math.round(crop.x),
    Math.round(crop.y),
    Math.round(crop.width),
    Math.round(crop.height)
  ].join(",");
  const finalPath =
    path.resolve(sourcePath) === path.resolve(destinationPath)
      ? path.join(path.dirname(destinationPath), `.${path.basename(destinationPath)}.${process.pid}.tmp.webp`)
      : destinationPath;

  try {
    await execFileAsync("python3", [
      cropRegionScriptPath,
      sourcePath,
      finalPath,
      cropArg,
      "--output-width",
      String(Math.round(outputWidth)),
      "--output-height",
      String(Math.round(outputHeight))
    ]);

    if (finalPath !== destinationPath) {
      await fs.rename(finalPath, destinationPath);
    }
  } catch (error) {
    if (finalPath !== destinationPath) {
      await fs.rm(finalPath, { force: true });
    }
    throw error;
  }

  return toAssetItem(destinationPath);
};
