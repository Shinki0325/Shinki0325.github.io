import bangumiCollections from "../src/data/bangumi-collections.json";
import {
  buildAboutCollectionPayload,
  getAboutCollectionPage,
  type AboutCollectionCategory,
  type AboutCollectionItem,
} from "../src/lib/about-collection";
import type {
  BangumiCollectionItem,
  BangumiCollectionSnapshot,
  BangumiStatusKey,
} from "../src/lib/bangumi-collections";
import { describe, expect, expectTypeOf, it } from "vitest";

const createItem = (
  id: number,
  category: BangumiCollectionItem["category"],
  status: BangumiStatusKey,
  userRate: number,
): BangumiCollectionItem => ({
  id,
  category,
  categoryLabel: category,
  status,
  statusLabel: status,
  title: `Title ${id}`,
  originalTitle: `Title ${id}`,
  year: "2026",
  cover: `https://example.com/${id}.webp`,
  score: userRate,
  userRate,
  comment: "",
  tags: [],
  url: `https://bangumi.tv/subject/${id}`,
  updatedAt: "2026-07-19T00:00:00.000Z",
});

const syntheticSnapshot: BangumiCollectionSnapshot = {
  username: "test-user",
  updatedAt: "2026-07-19T00:00:00.000Z",
  items: [
    createItem(101, "anime", "done", 10),
    createItem(102, "game", "wish", 8),
    createItem(103, "anime", "wish", 10),
    createItem(104, "game", "done", 10),
    createItem(105, "anime", "doing", 9),
    createItem(106, "game", "wish", 10),
    createItem(107, "anime", "done", 9),
    createItem(108, "game", "dropped", 7),
    createItem(109, "anime", "done", 8),
    createItem(110, "anime", "wish", 7),
    createItem(111, "anime", "done", 6),
    createItem(112, "anime", "dropped", 5),
    createItem(113, "anime", "done", 4),
    createItem(114, "anime", "wish", 3),
    createItem(115, "anime", "done", 2),
    createItem(116, "anime", "doing", 1),
    createItem(117, "anime", "done", 0),
    createItem(118, "anime", "wish", 6),
    createItem(119, "anime", "on_hold", 0),
    createItem(301, "book", "done", 10),
  ],
};

describe("About collection model", () => {
  const payload = buildAboutCollectionPayload(syntheticSnapshot);

  it("builds retained counts and a deterministic tied-rating showcase", () => {
    expectTypeOf<AboutCollectionItem["category"]>().toEqualTypeOf<AboutCollectionCategory>();
    expect(payload.total).toBe(19);
    expect(payload.categories.map((category) => [category.key, category.count])).toEqual([
      ["anime", 15],
      ["game", 4],
    ]);
    expect(payload.statuses.map((status) => [status.key, status.count])).toEqual([
      ["all", 19],
      ["wish", 6],
      ["done", 8],
      ["doing", 2],
      ["on_hold", 1],
      ["dropped", 2],
    ]);
    expect(payload.showcase.map((item) => item.id)).toEqual([101, 103, 105, 104, 106, 102]);
    expect(payload.showcase.map((item) => item.sourceIndex)).toEqual([0, 2, 4, 3, 5, 1]);
  });

  it("filters statuses and keeps source order with a fourteen-item first page", () => {
    const firstPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "default",
      page: 1,
    });
    const lowerClampedPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "default",
      page: 0,
    });
    const secondPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "default",
      page: 2,
    });
    const upperClampedPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "default",
      page: 999,
    });
    const donePage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "done",
      sort: "default",
      page: 1,
    });

    expect(firstPage.items).toHaveLength(14);
    expect(firstPage.items.map((item) => item.id)).toEqual([
      101, 103, 105, 107, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
    ]);
    expect(firstPage).toMatchObject({ page: 1, pageCount: 2, total: 15 });
    expect(lowerClampedPage.items.map((item) => item.id)).toEqual(
      firstPage.items.map((item) => item.id),
    );
    expect(lowerClampedPage.page).toBe(1);
    expect(secondPage.items.map((item) => item.id)).toEqual([119]);
    expect(secondPage).toMatchObject({ page: 2, pageCount: 2, total: 15 });
    expect(upperClampedPage.items.map((item) => item.id)).toEqual([119]);
    expect(upperClampedPage).toMatchObject({ page: 2, pageCount: 2, total: 15 });
    expect(donePage.items.map((item) => item.id)).toEqual([101, 107, 109, 111, 113, 115, 117]);
    expect(donePage.total).toBe(7);
  });

  it("sorts ratings by source index on ties without mutating payload order", () => {
    const originalOrder = payload.items.map((item) => item.id);
    const ratingPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "rating",
      page: 1,
    });

    expect(ratingPage.items.map((item) => item.id)).toEqual([
      101, 103, 105, 107, 109, 110, 111, 118, 112, 113, 114, 115, 116, 117,
    ]);
    expect(payload.items.map((item) => item.id)).toEqual(originalOrder);
  });

  it("normalizes fractional and non-finite pages before clamping and slicing", () => {
    const fractionalPage = getAboutCollectionPage(payload, {
      category: "anime",
      status: "all",
      sort: "default",
      page: 1.9,
    });

    expect(fractionalPage.page).toBe(1);
    expect(fractionalPage.items).toHaveLength(14);

    for (const page of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const normalizedPage = getAboutCollectionPage(payload, {
        category: "anime",
        status: "all",
        sort: "default",
        page,
      });

      expect(normalizedPage.page).toBe(1);
      expect(normalizedPage.items).toHaveLength(14);
    }
  });

  it("returns a stable first empty page when no items match", () => {
    const emptyPage = getAboutCollectionPage(payload, {
      category: "game",
      status: "on_hold",
      sort: "rating",
      page: 999,
    });

    expect(emptyPage).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});

describe("About collection real snapshot integration", () => {
  it("retains the current anime and game totals", () => {
    const payload = buildAboutCollectionPayload(bangumiCollections);

    expect(payload.total).toBe(330);
    expect(payload.categories.map((category) => [category.key, category.count])).toEqual([
      ["anime", 235],
      ["game", 95],
    ]);
    expect(payload.showcase).toHaveLength(6);
  });
});
