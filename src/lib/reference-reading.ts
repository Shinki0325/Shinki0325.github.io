import { getTextExtractFromAttachments } from "./reference-extract";
import type { ReferenceReadingDocument } from "./reference-publication";

type ReadingBlock = {
  label?: string;
  original: string;
  translation?: string;
  note?: string;
  focus?: boolean;
};

export type ReadingSection = { title: string; anchor?: string; summary: string };

type ReadingInput = {
  readingMode?: "curated" | "extract";
  readingBlocks?: ReadingBlock[];
  attachments?: string[];
  overview?: string;
  sections?: ReadingSection[];
  sourceBlocks?: ReadingBlock[];
  publicationBoundary?: Record<string, unknown>;
  readingDocument?: ReferenceReadingDocument;
};

type CuratedReadingState = {
  mode: "curated";
  blocks: ReadingBlock[];
  extract: string | null;
  overview: string;
  sections: ReadingSection[];
  document?: ReferenceReadingDocument;
};

type ExtractReadingState = {
  mode: "extract";
  blocks: [];
  extract: string | null;
  overview: string;
  sections: ReadingSection[];
  document?: ReferenceReadingDocument;
};

export const buildReferenceReadingState = (
  entry: ReadingInput
): CuratedReadingState | ExtractReadingState => {
  const boundary = entry.publicationBoundary ?? {};
  const canRead = boundary.publicReadingPage === true &&
    boundary.ownerPublicationDecision === "blog-manager-p0-correction-2026-07-25";
  const blocks = canRead
    ? (entry.sourceBlocks ?? entry.readingBlocks ?? []).filter((block) => block.original.trim().length > 0)
    : [];
  const extract = canRead ? getTextExtractFromAttachments(entry.attachments ?? []) : null;
  const overview = entry.overview ?? "";
  const sections = entry.sections ?? [];
  const document = entry.readingDocument;
  const documentBlocks = document?.publicBodyAllowed ? document.sourceBlocks : [];

  if (document && entry.readingMode === "curated") {
    return {
      mode: documentBlocks.length > 0 ? "curated" : "extract",
      blocks: [],
      extract: null,
      overview: document.overviewZh.join("\n\n"),
      sections: document.chapters.map((chapter) => ({
        title: chapter.titleZh,
        anchor: chapter.id,
        summary: chapter.summaryZh ?? "",
      })),
      document,
    };
  }

  if (blocks.length > 0 && entry.readingMode === "curated") {
    return {
      mode: "curated",
      blocks,
      extract,
      overview,
      sections,
      document,
    };
  }

  return {
    mode: "extract",
    blocks: [],
    extract,
    overview,
    sections,
    document,
  };
};
