type ReferenceLike = {
  slug: string;
  data: {
    date: Date;
    sourceUrl?: string;
    title?: string;
    summary?: string;
    note?: string;
    readingMode?: "curated" | "extract";
    aliases?: string[];
  };
};

const ARCHIVE_MARKER_PATTERN = /原始归档|原文归档|站内归档|网页归档|archive/i;

const referencePriorityScore = (entry: ReferenceLike) => {
  let score = 0;

  if (entry.data.readingMode === "curated") {
    score += 100;
  }

  const archiveSignals = [entry.data.title, entry.data.summary, entry.data.note]
    .filter(Boolean)
    .join(" ");

  if (!ARCHIVE_MARKER_PATTERN.test(archiveSignals)) {
    score += 10;
  }

  score += Math.min(entry.data.aliases?.length ?? 0, 5);

  return score;
};

const isHigherPriorityReference = (candidate: ReferenceLike, current: ReferenceLike) => {
  const candidateScore = referencePriorityScore(candidate);
  const currentScore = referencePriorityScore(current);

  if (candidateScore !== currentScore) {
    return candidateScore > currentScore;
  }

  if (candidate.data.date.getTime() !== current.data.date.getTime()) {
    return candidate.data.date.getTime() > current.data.date.getTime();
  }

  if (candidate.slug.length !== current.slug.length) {
    return candidate.slug.length < current.slug.length;
  }

  return candidate.slug.localeCompare(current.slug) < 0;
};

export const dedupeReferencesBySourceUrl = <T extends ReferenceLike>(entries: T[]) => {
  const result: T[] = [];
  const resultIndexBySourceUrl = new Map<string, number>();

  for (const entry of entries) {
    const sourceUrl = entry.data.sourceUrl?.trim();

    if (!sourceUrl) {
      result.push(entry);
      continue;
    }

    const existingIndex = resultIndexBySourceUrl.get(sourceUrl);

    if (existingIndex == null) {
      resultIndexBySourceUrl.set(sourceUrl, result.length);
      result.push(entry);
      continue;
    }

    const existing = result[existingIndex];

    if (isHigherPriorityReference(entry, existing)) {
      result[existingIndex] = entry;
    }
  }

  return result;
};
