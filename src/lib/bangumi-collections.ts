export type BangumiCategoryKey = "anime" | "book" | "music" | "game";
export type BangumiStatusKey = "wish" | "done" | "doing" | "on_hold" | "dropped";

type BangumiApiImageSet = {
  common?: string | null;
  large?: string | null;
  medium?: string | null;
  small?: string | null;
  grid?: string | null;
};

type BangumiApiTag = {
  name?: string;
};

export type BangumiApiCollectionItem = {
  updated_at?: string;
  comment?: string | null;
  tags?: string[];
  subject_id?: number;
  subject_type?: number;
  type?: number;
  rate?: number;
  subject?: {
    id?: number;
    type?: number;
    date?: string | null;
    name?: string;
    name_cn?: string;
    score?: number;
    rating?: {
      score?: number;
    };
    images?: BangumiApiImageSet;
    tags?: BangumiApiTag[];
  };
};

export type BangumiCollectionItem = {
  id: number;
  category: BangumiCategoryKey;
  categoryLabel: string;
  status: BangumiStatusKey;
  statusLabel: string;
  title: string;
  originalTitle: string;
  year: string;
  cover: string;
  score: number;
  userRate: number;
  comment: string;
  tags: string[];
  url: string;
  updatedAt: string;
};

export type BangumiCollectionSnapshot = {
  username: string;
  updatedAt: string;
  items: Array<BangumiApiCollectionItem | BangumiCollectionItem>;
};

export const BANGUMI_CATEGORIES: Array<{
  key: BangumiCategoryKey;
  label: string;
  subjectType: number;
}> = [
  { key: "anime", label: "动画", subjectType: 2 },
  { key: "book", label: "书籍", subjectType: 1 },
  { key: "music", label: "音乐", subjectType: 3 },
  { key: "game", label: "游戏", subjectType: 4 },
];

export const BANGUMI_STATUSES: Array<{
  key: "all" | BangumiStatusKey;
  label: string;
}> = [
  { key: "all", label: "全部" },
  { key: "wish", label: "想看" },
  { key: "done", label: "看过" },
  { key: "doing", label: "在看" },
  { key: "on_hold", label: "搁置" },
  { key: "dropped", label: "抛弃" },
];

const categoryBySubjectType = new Map(BANGUMI_CATEGORIES.map((category) => [category.subjectType, category]));

const statusByCollectionType = new Map<number, { key: BangumiStatusKey; label: string }>([
  [1, { key: "wish", label: "想看" }],
  [2, { key: "done", label: "看过" }],
  [3, { key: "doing", label: "在看" }],
  [4, { key: "on_hold", label: "搁置" }],
  [5, { key: "dropped", label: "抛弃" }],
]);

const uniqueNonEmpty = (values: Array<string | undefined>) => {
  const seen = new Set<string>();

  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
};

const isNormalizedItem = (item: BangumiApiCollectionItem | BangumiCollectionItem): item is BangumiCollectionItem =>
  "category" in item && "status" in item && "url" in item;

export const normalizeBangumiCollectionItem = (
  item: BangumiApiCollectionItem | BangumiCollectionItem,
): BangumiCollectionItem => {
  if (isNormalizedItem(item)) {
    return item;
  }

  const subject = item.subject ?? {};
  const subjectType = item.subject_type ?? subject.type ?? 2;
  const category = categoryBySubjectType.get(subjectType) ?? BANGUMI_CATEGORIES[0];
  const status = statusByCollectionType.get(item.type ?? 1) ?? statusByCollectionType.get(1)!;
  const id = item.subject_id ?? subject.id ?? 0;
  const title = subject.name_cn?.trim() || subject.name?.trim() || `Bangumi #${id}`;
  const originalTitle = subject.name?.trim() || title;
  const cover =
    subject.images?.common ??
    subject.images?.large ??
    subject.images?.medium ??
    subject.images?.small ??
    subject.images?.grid ??
    "";

  return {
    id,
    category: category.key,
    categoryLabel: category.label,
    status: status.key,
    statusLabel: status.label,
    title,
    originalTitle,
    year: subject.date?.slice(0, 4) ?? "未知",
    cover: cover ?? "",
    score: subject.score ?? subject.rating?.score ?? 0,
    userRate: item.rate ?? 0,
    comment: item.comment?.trim() ?? "",
    tags: uniqueNonEmpty([
      ...(item.tags ?? []),
      ...((subject.tags ?? []).map((tag) => tag.name)),
    ]).slice(0, 3),
    url: `https://bangumi.tv/subject/${id}`,
    updatedAt: item.updated_at ?? "",
  };
};

export const buildBangumiCollectionViewModel = (snapshot: BangumiCollectionSnapshot) => {
  const items = snapshot.items
    .map((item) => normalizeBangumiCollectionItem(item))
    .filter((item) => item.id > 0);
  const countByCategory = new Map<BangumiCategoryKey, number>();
  const countByStatus = new Map<BangumiStatusKey, number>();

  for (const item of items) {
    countByCategory.set(item.category, (countByCategory.get(item.category) ?? 0) + 1);
    countByStatus.set(item.status, (countByStatus.get(item.status) ?? 0) + 1);
  }

  return {
    username: snapshot.username,
    updatedAt: snapshot.updatedAt,
    total: items.length,
    items,
    categories: BANGUMI_CATEGORIES.map((category) => ({
      ...category,
      count: countByCategory.get(category.key) ?? 0,
    })),
    statuses: BANGUMI_STATUSES.map((status) => ({
      ...status,
      count: status.key === "all" ? items.length : countByStatus.get(status.key) ?? 0,
    })),
  };
};
