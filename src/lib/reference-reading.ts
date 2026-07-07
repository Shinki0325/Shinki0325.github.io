import { getTextExtractFromAttachments } from "./reference-extract";

type ReadingBlock = {
  label?: string;
  original: string;
  translation?: string;
  note?: string;
  focus?: boolean;
};

type ReadingInput = {
  readingMode?: "curated" | "extract";
  readingBlocks?: ReadingBlock[];
  attachments?: string[];
};

type CuratedReadingState = {
  mode: "curated";
  blocks: ReadingBlock[];
  extract: string | null;
};

type ExtractReadingState = {
  mode: "extract";
  blocks: [];
  extract: string | null;
};

export const buildReferenceReadingState = (
  entry: ReadingInput
): CuratedReadingState | ExtractReadingState => {
  const blocks = (entry.readingBlocks ?? []).filter((block) => block.original.trim().length > 0);
  const extract = getTextExtractFromAttachments(entry.attachments ?? []);

  if (blocks.length > 0 && entry.readingMode === "curated") {
    return {
      mode: "curated",
      blocks,
      extract
    };
  }

  return {
    mode: "extract",
    blocks: [],
    extract
  };
};
