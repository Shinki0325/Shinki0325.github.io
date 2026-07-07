import { describe, expect, it } from "vitest";
import { buildReferenceReadingState } from "../src/lib/reference-reading";

describe("buildReferenceReadingState", () => {
  it("returns curated mode when usable reading blocks exist", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      readingBlocks: [
        {
          label: "empty",
          original: "   ",
          translation: "should be filtered"
        },
        {
          label: "platform",
          original: "PC-9801は1982年10月に登場した。",
          translation: "PC-9801 于 1982 年 10 月登场。",
          focus: true
        }
      ],
      attachments: ["/uploads/example.txt"]
    });

    expect(state.mode).toBe("curated");
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.original).toBe("PC-9801は1982年10月に登場した。");
    expect(state.extract).toBeNull();
  });

  it("falls back to extract mode when no usable curated blocks are available", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      readingBlocks: [
        {
          original: "   ",
          translation: "blank original should not count"
        }
      ],
      attachments: []
    });

    expect(state.mode).toBe("extract");
    expect(state.blocks).toHaveLength(0);
    expect(state.extract).toBeNull();
  });
});
