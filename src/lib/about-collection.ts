import {
  buildBangumiCollectionViewModel,
  type BangumiCollectionItem,
  type BangumiCollectionSnapshot,
  type BangumiStatusKey,
} from "./bangumi-collections";

export const ABOUT_COLLECTION_CATEGORIES = ["anime", "game"] as const;
export const ABOUT_COLLECTION_PAGE_SIZE = 14;

export type AboutCollectionCategory = (typeof ABOUT_COLLECTION_CATEGORIES)[number];
export type AboutCollectionStatus = "all" | BangumiStatusKey;
export type AboutCollectionSort = "default" | "rating";
export type AboutCollectionItem = Omit<BangumiCollectionItem, "category"> & {
  category: AboutCollectionCategory;
  sourceIndex: number;
};

export type AboutCollectionPayload = {
  total: number;
  categories: Array<{ key: AboutCollectionCategory; label: string; count: number }>;
  statuses: Array<{ key: AboutCollectionStatus; label: string; count: number }>;
  showcase: AboutCollectionItem[];
  items: AboutCollectionItem[];
};

export type AboutCollectionState = {
  category: AboutCollectionCategory;
  status: AboutCollectionStatus;
  sort: AboutCollectionSort;
  page: number;
};

const isAboutCollectionCategory = (
  category: BangumiCollectionItem["category"],
): category is AboutCollectionCategory =>
  ABOUT_COLLECTION_CATEGORIES.some((candidate) => candidate === category);

export const buildAboutCollectionPayload = (
  snapshot: BangumiCollectionSnapshot,
): AboutCollectionPayload => {
  const view = buildBangumiCollectionViewModel(snapshot);
  const items = view.items
    .map((item, sourceIndex) => ({ ...item, sourceIndex }))
    .filter((item): item is AboutCollectionItem => isAboutCollectionCategory(item.category));
  const categories = view.categories
    .filter(
      (category): category is typeof category & { key: AboutCollectionCategory } =>
        isAboutCollectionCategory(category.key),
    )
    .map((category) => ({
      key: category.key,
      label: category.label,
      count: items.filter((item) => item.category === category.key).length,
    }));
  const statuses = view.statuses.map((status) => ({
    key: status.key,
    label: status.label,
    count:
      status.key === "all"
        ? items.length
        : items.filter((item) => item.status === status.key).length,
  }));
  const showcase = ABOUT_COLLECTION_CATEGORIES.flatMap((category) =>
    items
      .filter((item) => item.category === category)
      .sort((left, right) => right.userRate - left.userRate || left.sourceIndex - right.sourceIndex)
      .slice(0, 3),
  );

  return { total: items.length, categories, statuses, showcase, items };
};

export const getAboutCollectionPage = (
  payload: AboutCollectionPayload,
  state: AboutCollectionState,
) => {
  const matched = payload.items.filter(
    (item) =>
      item.category === state.category &&
      (state.status === "all" || item.status === state.status),
  );
  const ordered = [...matched].sort((left, right) =>
    state.sort === "rating"
      ? right.userRate - left.userRate || left.sourceIndex - right.sourceIndex
      : left.sourceIndex - right.sourceIndex,
  );
  const pageCount = Math.max(1, Math.ceil(ordered.length / ABOUT_COLLECTION_PAGE_SIZE));
  const requestedPage = Number.isFinite(state.page) ? Math.trunc(state.page) : 1;
  const page = Math.min(Math.max(requestedPage, 1), pageCount);
  const start = (page - 1) * ABOUT_COLLECTION_PAGE_SIZE;

  return {
    items: ordered.slice(start, start + ABOUT_COLLECTION_PAGE_SIZE),
    page,
    pageCount,
    total: ordered.length,
  };
};
