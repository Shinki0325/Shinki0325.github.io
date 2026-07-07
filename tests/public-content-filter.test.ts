import { describe, expect, it } from "vitest";
import {
  collectTags,
  filterPublishedEntries,
  isPublicCollection,
  isPublishedEntry,
  publicContentGlob,
  sortByDateDesc
} from "../src/lib/content";

const createEntry = (slug: string, date: string, draft = false, tags: string[] = []) => ({
  slug,
  data: {
    date: new Date(date),
    draft,
    tags
  }
});

describe("public content helpers", () => {
  it("allows only public content collections", () => {
    expect(isPublicCollection("articles")).toBe(true);
    expect(isPublicCollection("notes")).toBe(true);
    expect(isPublicCollection("references")).toBe(true);
    expect(isPublicCollection("topics")).toBe(true);
    expect(isPublicCollection("drafts")).toBe(false);
    expect(isPublicCollection("vault")).toBe(false);
  });

  it("builds only from public content roots", () => {
    expect(publicContentGlob).toContain("src/content/articles/**/*");
    expect(publicContentGlob).toContain("src/content/notes/**/*");
    expect(publicContentGlob).toContain("src/content/topics/**/*");
    expect(publicContentGlob).toContain("src/content/references/**/*");
  });

  it("treats draft-flagged entries as unpublished", () => {
    expect(isPublishedEntry(createEntry("published", "2024-01-01"))).toBe(true);
    expect(isPublishedEntry(createEntry("drafted", "2024-01-02", true))).toBe(false);
  });

  it("filters drafts out of public listings", () => {
    const entries = [
      createEntry("published", "2024-01-01"),
      createEntry("drafted", "2024-01-02", true),
      createEntry("published-2", "2024-01-03")
    ];

    expect(filterPublishedEntries(entries).map((entry) => entry.slug)).toEqual([
      "published",
      "published-2"
    ]);
  });

  it("sorts entries by most recent first", () => {
    const entries = [
      createEntry("oldest", "2024-01-01"),
      createEntry("newest", "2024-01-03"),
      createEntry("middle", "2024-01-02")
    ];

    expect(sortByDateDesc(entries).map((entry) => entry.slug)).toEqual([
      "newest",
      "middle",
      "oldest"
    ]);
  });

  it("collects unique tags from published content only", () => {
    const tags = collectTags([
      createEntry("published", "2024-01-01", false, ["astro", "notes"]),
      createEntry("drafted", "2024-01-02", true, ["private"]),
      createEntry("published-2", "2024-01-03", false, ["astro", "writing"])
    ]);

    expect(tags).toEqual(["astro", "notes", "writing"]);
  });
});
