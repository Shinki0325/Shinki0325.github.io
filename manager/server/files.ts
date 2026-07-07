import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import type {
  AssetItem,
  ContentEntry,
  ContentKind,
  ContentListItem,
  PageConfigFile,
  PageConfigName,
  SaveContentPayload
} from "../src/types";

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(managerRoot, "..");
const contentRoot = path.join(repoRoot, "src", "content");
const pageConfigRoot = path.join(repoRoot, "src", "config", "pages");
const publicRoot = path.join(repoRoot, "public");
const uploadRoot = path.join(publicRoot, "uploads");

const CONTENT_DIRS: Record<ContentKind, string> = {
  articles: "articles",
  references: "references",
  drafts: "drafts",
  notes: "notes",
  topics: "topics",
  vault: "vault"
};

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const PAGE_CONFIGS: PageConfigName[] = ["home", "references"];

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
