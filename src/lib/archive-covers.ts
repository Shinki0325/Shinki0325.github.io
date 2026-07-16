import fs from "node:fs";
import path from "node:path";

export const SCRIPT_OVERVIEW_COVERS = Array.from(
  { length: 11 },
  (_, index) =>
    `/uploads/articles/script-covers/script-cover-${String(index + 1).padStart(2, "0")}.webp`,
);

const webArchiveDir = path.join(process.cwd(), "public", "uploads", "galgame-90s-web-archive");
const archiveThumbPublicDir = "/uploads/generated/archive-thumbs";

const normalizeCoverList = (cover?: string, covers: string[] = []) =>
  [...covers, cover].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

const sourceUrlToFilenamePrefix = (sourceUrl: string) => {
  try {
    const url = new URL(sourceUrl);
    const pathname = decodeURIComponent(url.pathname)
      .replace(/^\/+|\/+$/g, "")
      .replaceAll("/", "_");
    const query = decodeURIComponent(url.search)
      .replace(/^\?/, "")
      .replace(/[=&?/#]+/g, "_");

    return [url.hostname, pathname, query].filter(Boolean).join("_");
  } catch {
    return "";
  }
};

const findScrapedScreenshot = (sourceUrl?: string) => {
  if (!sourceUrl || !fs.existsSync(webArchiveDir)) {
    return undefined;
  }

  const prefix = sourceUrlToFilenamePrefix(sourceUrl);
  if (!prefix) {
    return undefined;
  }

  const files = fs.readdirSync(webArchiveDir);
  const exactMatch = files.find((file) => file.endsWith(".png") && file.startsWith(`${prefix}__`));
  const looseMatch = files.find((file) => file.endsWith(".png") && file.startsWith(prefix));
  const match = exactMatch ?? looseMatch;

  return match ? getArchiveThumbnailPublicPath(match) : undefined;
};

export const getArchiveThumbnailPublicPath = (filename: string) =>
  `${archiveThumbPublicDir}/${path.basename(filename, path.extname(filename))}.webp`;

export const getArticleOverviewCovers = (data: {
  cover?: string;
  covers?: string[];
  type?: string;
}) => {
  const explicitCovers = normalizeCoverList(data.cover, data.covers);
  if (explicitCovers.length > 0) {
    return explicitCovers;
  }

  return SCRIPT_OVERVIEW_COVERS;
};

export const getReferenceOverviewCovers = (data: {
  cover?: string;
  covers?: string[];
  sourceUrl?: string;
}) => {
  const explicitCovers = normalizeCoverList(data.cover, data.covers);
  if (explicitCovers.length > 0) {
    return explicitCovers;
  }

  return normalizeCoverList(findScrapedScreenshot(data.sourceUrl));
};
