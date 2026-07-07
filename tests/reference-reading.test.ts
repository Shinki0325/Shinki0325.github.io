import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTextExtractFromAttachments } from "../src/lib/reference-extract";
import { buildReferenceReadingState } from "../src/lib/reference-reading";

vi.mock("../src/lib/reference-extract", () => ({
  getTextExtractFromAttachments: vi.fn(() => "mock extract body")
}));

describe("buildReferenceReadingState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns curated mode when usable reading blocks exist and mode is curated", () => {
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
          original: "PC-9801 launched in 1982.",
          translation: "PC-9801 于 1982 年推出。",
          focus: true
        }
      ],
      attachments: ["/uploads/example.txt"]
    });

    expect(state.mode).toBe("curated");
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.original).toBe("PC-9801 launched in 1982.");
    expect(state.extract).toBe("mock extract body");
    expect(getTextExtractFromAttachments).toHaveBeenCalledWith(["/uploads/example.txt"]);
  });

  it("returns extract mode when readingMode is missing even if usable blocks exist", () => {
    const state = buildReferenceReadingState({
      readingBlocks: [
        {
          original: "A usable paragraph.",
          translation: "一段可用正文。"
        }
      ],
      attachments: ["/uploads/fallback.txt"]
    });

    expect(state.mode).toBe("extract");
    expect(state.blocks).toHaveLength(0);
    expect(state.extract).toBe("mock extract body");
    expect(getTextExtractFromAttachments).toHaveBeenCalledWith(["/uploads/fallback.txt"]);
  });

  it("returns extract mode when readingMode is extract even if usable blocks exist", () => {
    const state = buildReferenceReadingState({
      readingMode: "extract",
      readingBlocks: [
        {
          original: "A usable paragraph.",
          translation: "一段可用正文。"
        }
      ],
      attachments: ["/uploads/from-extract.txt"]
    });

    expect(state.mode).toBe("extract");
    expect(state.blocks).toHaveLength(0);
    expect(state.extract).toBe("mock extract body");
    expect(getTextExtractFromAttachments).toHaveBeenCalledWith(["/uploads/from-extract.txt"]);
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
    expect(state.extract).toBe("mock extract body");
    expect(getTextExtractFromAttachments).toHaveBeenCalledWith([]);
  });
});
