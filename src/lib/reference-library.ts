export const referenceLibrarySections = [
  "回忆、讨论与后见视角",
  "作品与人物",
  "社会背景"
] as const;

export type ReferenceLibrarySection = (typeof referenceLibrarySections)[number];

type ReferenceDataLike = {
  title: string;
  kind: "source" | "topic";
  summary: string;
  intro?: string;
  librarySection?: ReferenceLibrarySection;
  tags?: string[];
  topics?: string[];
  publisher?: string;
  sourceType?: string;
  relatedRefs?: string[];
  date?: Date;
};

export type ReferenceEntryLike = {
  slug: string;
  data: ReferenceDataLike;
};

const hindsightTypes = new Set(["博客文章", "讨论汇编", "社交媒体", "访谈"]);
const workTypes = new Set(["维基条目"]);

const sectionGuidance: Record<ReferenceLibrarySection, string> = {
  "回忆、讨论与后见视角": "适合用来补个人记忆、社群讨论和后见回望。",
  "作品与人物": "适合用来补作品条目、人物关系和创作脉络。",
  "社会背景": "适合用来补平台环境、传播条件和时代背景。"
};

const normalizeSummarySubject = (summary: string) =>
  summary
    .trim()
    .replace(/^这份资料主要(?:在讲|整理了)?/u, "")
    .replace(/^补充/u, "")
    .replace(/的站内归档资料。?$/u, "")
    .replace(/。+$/u, "")
    .trim();

const sharedCount = (left: string[] = [], right: string[] = []) => {
  const set = new Set(left);
  return right.reduce((count, item) => (set.has(item) ? count + 1 : count), 0);
};

export const inferReferenceLibrarySection = (data: ReferenceDataLike): ReferenceLibrarySection => {
  if (data.librarySection) {
    return data.librarySection;
  }

  const tags = new Set(data.tags ?? []);
  const title = data.title;
  const sourceType = data.sourceType ?? "";

  if (
    tags.has("作品条目") ||
    /to ?heart|yu-no|同級生|同级生|カウボーイビバップ|鸟之诗|鳥の詩|leaf|key/iu.test(title)
  ) {
    return "作品与人物";
  }

  if (
    tags.has("社群讨论") ||
    tags.has("个人回忆") ||
    tags.has("回顾文章") ||
    hindsightTypes.has(sourceType) ||
    /回顧|思い出|讨论|對談|対談|インタビュー|blog|x:|togetter|哔哩哔哩|bilibili/iu.test(title)
  ) {
    return "回忆、讨论与后见视角";
  }

  if (workTypes.has(sourceType) && tags.has("Wikipedia")) {
    return "社会背景";
  }

  return "社会背景";
};

export const buildReferenceIntro = (data: ReferenceDataLike) => {
  if (data.intro?.trim()) {
    return data.intro.trim();
  }

  if (data.kind === "topic") {
    const subject = normalizeSummarySubject(data.summary) || data.title;
    return `这页主要收纳${subject}。适合拿来作为站内资料入口与专题索引。`;
  }

  const section = inferReferenceLibrarySection(data);
  const subject = normalizeSummarySubject(data.summary) || data.title;
  return `这份资料主要在讲${subject}。${sectionGuidance[section]}`;
};

export const partitionReferenceLibrary = <T extends ReferenceEntryLike>(entries: T[]) => {
  const topicEntries = entries.filter((entry) => entry.data.kind === "topic");
  const sourceEntries = entries.filter((entry) => entry.data.kind === "source");

  const sourceGroups = referenceLibrarySections
    .map((section) => ({
      section,
      entries: sourceEntries.filter((entry) => inferReferenceLibrarySection(entry.data) === section)
    }))
    .filter((group) => group.entries.length > 0);

  return {
    topicEntries,
    sourceGroups
  };
};

export const buildRelatedReferenceSlugs = <T extends ReferenceEntryLike>(
  current: T,
  references: T[],
  limit = 4
) => {
  const explicit = (current.data.relatedRefs ?? []).filter((slug) => slug !== current.slug);
  const explicitSet = new Set(explicit);
  const currentSection = inferReferenceLibrarySection(current.data);

  const auto = references
    .filter((candidate) => candidate.slug !== current.slug)
    .filter((candidate) => candidate.data.kind === "source")
    .filter((candidate) => !explicitSet.has(candidate.slug))
    .map((candidate) => {
      let score = 0;

      if (inferReferenceLibrarySection(candidate.data) === currentSection) {
        score += 5;
      }

      score += sharedCount(current.data.tags, candidate.data.tags) * 2;
      score += sharedCount(current.data.topics, candidate.data.topics) * 3;

      if (current.data.publisher && current.data.publisher === candidate.data.publisher) {
        score += 1;
      }

      if (current.data.sourceType && current.data.sourceType === candidate.data.sourceType) {
        score += 1;
      }

      return { slug: candidate.slug, score, date: candidate.data.date?.valueOf?.() ?? 0 };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || right.date - left.date)
    .map((candidate) => candidate.slug);

  return [...explicit, ...auto].slice(0, limit);
};
