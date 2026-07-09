import fs from "node:fs";
import path from "node:path";

export const SCRIPT_OVERVIEW_COVERS = [
  "https://pic.imgdd.cc/i/033mRL5Dbjr2F3cPHJxJgt.png",
  "https://pic.imgdd.cc/i/033mRL5KWsFpcD7jCn6CRI.png",
  "https://pic.imgdd.cc/i/033mRL5PPFEy9P3PRE0Nwq.png",
  "https://pic.imgdd.cc/i/033mRL6JwOSA43mTzwGcPj.png",
  "https://pic.imgdd.cc/i/033mTHwA1AgfSkEYQOEJ1F.jpg",
  "https://pic.imgdd.cc/i/033mTHw2W2SKEYUJ99vE4N.jpg",
  "https://pic.imgdd.cc/i/033mTHw61P3qxPui2wWF1s.jpg",
  "https://pic.imgdd.cc/i/033mTHx8qX7GzlliJZrzKf.jpg",
  "https://pic.imgdd.cc/i/033mTHwmKeuq2YNHyATxvI.jpg",
  "https://pic.imgdd.cc/i/033mTHxNfStkz7uPCuMEwq.jpg",
  "https://pic.imgdd.cc/i/033mTHx5vQ0gAtk5unnD0K.jpg",
];

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
