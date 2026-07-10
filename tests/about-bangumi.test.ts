import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("about Bangumi panel", () => {
  it("renders a local Bangumi collection panel with client-side filters", async () => {
    const [aboutSource, styleSource] = await Promise.all([
      readFile("src/pages/about.astro", "utf8"),
      readFile("src/styles/global.css", "utf8"),
    ]);

    expect(aboutSource).toContain("../data/bangumi-collections.json");
    expect(aboutSource).toContain("buildBangumiCollectionViewModel");
    expect(aboutSource).toContain("data-bangumi-panel");
    expect(aboutSource).toContain("data-bangumi-category-filter");
    expect(aboutSource).toContain("data-bangumi-status-filter");
    expect(aboutSource).toContain("data-bangumi-sort");
    expect(aboutSource).toContain("data-bangumi-card");
    expect(aboutSource).toContain("data-bangumi-page-info");
    expect(aboutSource).toContain("data-bangumi-page-next");
    expect(aboutSource).toContain("data-bangumi-page-prev");
    expect(aboutSource).toContain("data-bangumi-score");
    expect(aboutSource).toContain('["anime", "game"]');
    expect(aboutSource).toContain("displayedBangumiItems");
    expect(aboutSource).toContain("item.userRate");
    expect(aboutSource).toContain("个评");
    expect(aboutSource).toContain("const pageSize = 14");
    expect(aboutSource).toContain('grid.querySelectorAll("[data-bangumi-card]")');
    expect(aboutSource).toContain("getOrderedBangumiCards");
    expect(aboutSource).toContain("sortBangumiCards");
    expect(aboutSource).toContain("applyBangumiFilters");
    expect(aboutSource).toContain("updateBangumiPagination");
    expect(aboutSource).not.toContain("about-bangumi__profile");
    expect(aboutSource).not.toContain("@{bangumi.username}");
    expect(styleSource).toContain(".about-bangumi");
    expect(styleSource).toContain(".about-bangumi__pager");
    expect(styleSource).toContain(".about-bangumi__toolbar");
    expect(styleSource).toContain(".about-bangumi__sort");
    expect(styleSource).toContain(".about-bangumi-card");
    expect(styleSource).toContain(".about-bangumi-card__score");
    expect(styleSource).toContain("font-size: clamp(1.55rem, 3.6vw, 3.1rem)");
    expect(styleSource).toContain("width: 42px");
    expect(styleSource).toContain("min-height: 38px");
    expect(styleSource).toContain("min-height: 28px");
    expect(styleSource).toContain("grid-template-columns: repeat(7, minmax(0, 1fr))");
    expect(styleSource).toContain("min-height: clamp(154px, 13.4vw, 211px)");
  });
});
