import { describe, expect, it } from "vitest";
import { createReferenceIndex } from "../src/lib/reference-index";

describe("createReferenceIndex", () => {
  it("treats frontmatter-only collection entries as having an empty body", () => {
    const graph = createReferenceIndex(
      [{ slug: "reference", data: { title: "Reference", visibility: "public" } }],
      [{ slug: "article", data: { title: "Article", visibility: "public" } }]
    );

    expect(graph.referencesBySlug.get("reference")?.body).toBe("");
    expect(graph.links).toEqual([]);
  });
});
