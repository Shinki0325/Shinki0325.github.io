export type ReferenceSourceBlock = {
  id: string;
  kind: "heading" | "paragraph";
  sourceHeading?: string | null;
  text: string;
};

export type ReferenceChapter = {
  id: string;
  number: number;
  titleZh: string;
  summaryZh?: string;
  startBlockId: string;
  sourceBlocks: ReferenceSourceBlock[];
};

export type ReferenceReadingDocument = {
  overviewZh: string[];
  prefaceBlocks: ReferenceSourceBlock[];
  chapters: ReferenceChapter[];
  sourceBlocks: ReferenceSourceBlock[];
  sourceLanguage?: string;
  publicBodyAllowed: boolean;
};

export type OwnerPublicationDecision = {
  decision: string;
  decidedAt: string;
  entrance: boolean;
  overview: boolean;
  chapterSummaries: boolean;
  sourceBody: boolean;
  attachments: boolean;
};

type ReadingPackage = {
  overviewZh?: string[];
  sourceLanguage?: string;
  sections?: Array<{ id: string; titleZh: string; summaryZh?: string; startBlockId: string }>;
  body?: { paragraphs?: ReferenceSourceBlock[] };
};

export const buildReferenceReadingDocument = (
  pkg: ReadingPackage,
  ownerPublication: OwnerPublicationDecision,
): ReferenceReadingDocument => {
  const sourceBlocks = ownerPublication.sourceBody ? [...(pkg.body?.paragraphs ?? [])] : [];
  const sections = pkg.sections ?? [];
  const blockIndex = new Map(sourceBlocks.map((block, index) => [block.id, index]));
  const chapterIds = new Set<string>();
  let lastStart = -1;

  const starts = sections.map((section) => {
    if (!section.id || chapterIds.has(section.id)) throw new Error(`Duplicate chapter id: ${section.id}`);
    chapterIds.add(section.id);
    const index = blockIndex.get(section.startBlockId);
    if (index === undefined) throw new Error(`Missing chapter anchor: ${section.startBlockId}`);
    if (index <= lastStart) throw new Error(`Chapter anchors out of order: ${section.startBlockId}`);
    lastStart = index;
    return index;
  });

  const chapters = sections.map((section, index) => ({
    id: section.id,
    number: index + 1,
    titleZh: section.titleZh,
    summaryZh: ownerPublication.chapterSummaries ? section.summaryZh : undefined,
    startBlockId: section.startBlockId,
    sourceBlocks: sourceBlocks.slice(starts[index], starts[index + 1]),
  }));

  return {
    overviewZh: ownerPublication.overview ? [...(pkg.overviewZh ?? [])] : [],
    prefaceBlocks: starts.length > 0 ? sourceBlocks.slice(0, starts[0]) : [],
    chapters,
    sourceBlocks,
    sourceLanguage: pkg.sourceLanguage,
    publicBodyAllowed: ownerPublication.sourceBody,
  };
};
