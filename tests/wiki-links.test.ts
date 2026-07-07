import { describe, expect, it } from "vitest";
import { parseWikiLinks } from "../packages/content-core/src/wiki-links";

describe("wiki link parser", () => {
  it("parses simple and aliased wiki links", () => {
    expect(parseWikiLinks("A [[Ref A]] and [[Ref B|shown]]")).toEqual([
      { raw: "[[Ref A]]", target: "Ref A", label: "Ref A" },
      { raw: "[[Ref B|shown]]", target: "Ref B", label: "shown" }
    ]);
  });
});
