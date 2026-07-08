import { describe, expect, it, vi } from "vitest";
import {
  PUBLIC_CONTENT_COLLECTIONS,
  collectTags,
  filterPublishedEntries,
  isPublicCollection,
  isPublishedEntry,
  publicContentGlob,
  sortByDateDesc,
} from "../src/lib/content";
import { dedupeReferencesBySourceUrl } from "../src/lib/reference-dedupe";

const createEntry = (slug: string, date: string, draft = false, tags: string[] = []) => ({
  slug,
  data: {
    date: new Date(date),
    draft,
    tags,
  },
});

describe("public content helpers", () => {
  it("derives public content helpers from one shared collection list", () => {
    expect(PUBLIC_CONTENT_COLLECTIONS).toEqual(["articles", "notes", "topics", "references"]);
  });

  it("allows only public content collections", () => {
    expect(isPublicCollection("articles")).toBe(true);
    expect(isPublicCollection("notes")).toBe(true);
    expect(isPublicCollection("references")).toBe(true);
    expect(isPublicCollection("topics")).toBe(true);
    expect(isPublicCollection("drafts")).toBe(false);
    expect(isPublicCollection("vault")).toBe(false);
  });

  it("builds only from public content roots", () => {
    expect(publicContentGlob).toEqual([
      "src/content/articles/**/*",
      "src/content/notes/**/*",
      "src/content/topics/**/*",
      "src/content/references/**/*",
    ]);
  });

  it("treats draft-flagged entries as unpublished", () => {
    expect(isPublishedEntry(createEntry("published", "2024-01-01"))).toBe(true);
    expect(isPublishedEntry(createEntry("drafted", "2024-01-02", true))).toBe(false);
  });

  it("filters drafts out of public listings", () => {
    const entries = [
      createEntry("published", "2024-01-01"),
      createEntry("drafted", "2024-01-02", true),
      createEntry("published-2", "2024-01-03"),
    ];

    expect(filterPublishedEntries(entries).map((entry) => entry.slug)).toEqual(["published", "published-2"]);
  });

  it("sorts entries by most recent first", () => {
    const entries = [
      createEntry("oldest", "2024-01-01"),
      createEntry("newest", "2024-01-03"),
      createEntry("middle", "2024-01-02"),
    ];

    expect(sortByDateDesc(entries).map((entry) => entry.slug)).toEqual(["newest", "middle", "oldest"]);
  });

  it("collects unique tags from published content only", () => {
    const tags = collectTags([
      createEntry("published", "2024-01-01", false, ["astro", "notes"]),
      createEntry("drafted", "2024-01-02", true, ["private"]),
      createEntry("published-2", "2024-01-03", false, ["astro", "writing"]),
    ]);

    expect(tags).toEqual(["astro", "notes", "writing"]);
  });

  it("deduplicates public references by source URL and keeps curated entries", () => {
    const references = [
      {
        slug: "raw-famitsu",
        data: {
          date: new Date("2026-06-28"),
          title: "Famitsu 原始归档",
          sourceUrl: "https://www.famitsu.com/news/202310/29322123.html",
          readingMode: "extract",
        },
      },
      {
        slug: "visual-novel-origins-famitsu",
        data: {
          date: new Date("2026-07-07"),
          title: "视觉小说的诞生与繁盛",
          sourceUrl: "https://www.famitsu.com/news/202310/29322123.html",
          readingMode: "curated",
        },
      },
      {
        slug: "other-reference",
        data: {
          date: new Date("2026-07-06"),
          title: "别的资料",
          sourceUrl: "https://example.com/reference",
          readingMode: "extract",
        },
      },
    ];

    expect(dedupeReferencesBySourceUrl(references).map((entry) => entry.slug)).toEqual([
      "visual-novel-origins-famitsu",
      "other-reference",
    ]);
  });

  it("prefers non-archive titles when multiple curated references share one source URL", () => {
    const references = [
      {
        slug: "leaf-key-archive",
        data: {
          date: new Date("2026-06-28"),
          title: "Leaf、Key 对谈原始归档",
          sourceUrl: "https://news.denfaminicogamer.jp/interview/250325e",
          readingMode: "curated",
        },
      },
      {
        slug: "leaf-key-interview",
        data: {
          date: new Date("2026-07-07"),
          title: "Leaf、Key 对谈",
          sourceUrl: "https://news.denfaminicogamer.jp/interview/250325e",
          readingMode: "curated",
        },
      },
    ];

    expect(dedupeReferencesBySourceUrl(references).map((entry) => entry.slug)).toEqual(["leaf-key-interview"]);
  });
});

describe("getPublishedAlbums", () => {
  it("surfaces only public, non-draft albums in reverse chronological order", async () => {
    vi.resetModules();
    vi.doMock("astro:content", () => ({
      getCollection: async (collection: string) => {
        expect(collection).toBe("albums");

        return [
          {
            slug: "hidden-album",
            data: {
              title: "隐藏相册",
              date: new Date("2026-07-05"),
              summary: "不应该公开",
              visibility: "hidden",
              draft: false,
            },
          },
          {
            slug: "draft-album",
            data: {
              title: "草稿相册",
              date: new Date("2026-07-07"),
              summary: "仍在整理",
              visibility: "public",
              draft: true,
            },
          },
          {
            slug: "public-new",
            data: {
              title: "最新公开相册",
              date: new Date("2026-07-08"),
              summary: "应该排在最前面",
              visibility: "public",
              draft: false,
            },
          },
          {
            slug: "public-old",
            data: {
              title: "较早公开相册",
              date: new Date("2026-07-01"),
              summary: "应该保留",
              visibility: "public",
              draft: false,
            },
          },
        ];
      },
    }));

    const { getPublishedAlbums } = await import("../src/lib/public-content");
    const albums = await getPublishedAlbums();

    expect(albums.map((entry) => entry.slug)).toEqual(["public-new", "public-old"]);
  });
});
