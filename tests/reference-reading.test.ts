import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { getTextExtractFromAttachments } from "../src/lib/reference-extract";
import { buildReferenceReadingState } from "../src/lib/reference-reading";

vi.mock("../src/lib/reference-extract", () => ({
  getTextExtractFromAttachments: vi.fn(() => "mock extract body")
}));

describe("buildReferenceReadingState", () => {
  const publicationBoundary = {
    publicReadingPage: true,
    ownerPublicationDecision: "blog-manager-p0-correction-2026-07-25",
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns curated mode when usable reading blocks exist and mode is curated", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      publicationBoundary,
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
      attachments: ["/uploads/fallback.txt"],
      publicationBoundary,
    });

    expect(state.mode).toBe("extract");
    expect(state.blocks).toHaveLength(0);
    expect(state.extract).toBe("mock extract body");
    expect(getTextExtractFromAttachments).toHaveBeenCalledWith(["/uploads/fallback.txt"]);
  });

  it("returns extract mode when readingMode is extract even if usable blocks exist", () => {
    const state = buildReferenceReadingState({
      readingMode: "extract",
      publicationBoundary,
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
      publicationBoundary,
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

describe("ReferenceReading source states", () => {
  it("renders explicit curated, extract, and pending state roots", async () => {
    const source = await readFile("src/components/ReferenceReading.astro", "utf8");

    expect(source).toContain('data-reference-reading-state="curated"');
    expect(source).toContain('data-reference-reading-state="extract"');
    expect(source).toContain('data-reference-reading-state="pending"');
    expect(source).not.toContain("整理完成后，会在这里");
  });

  it("keeps curated fields and renders extract text as structured paragraphs", async () => {
    const source = await readFile("src/components/ReferenceReading.astro", "utf8");

    expect(source).toContain("block.original");
    expect(source).toContain("block.translation");
    expect(source).toContain("block.note");
    expect(source).toContain("block.focus");
    expect(source).toContain("extractParagraphs.map");
    expect(source).not.toContain("<pre>{extract}</pre>");
  });

  it("uses one concise pending row instead of explanatory card stacks", async () => {
    const source = await readFile("src/components/ReferenceReading.astro", "utf8");

    expect(source).toContain('class="reference-reading__pending"');
    expect(source).toContain("当前资料暂无可展示的站内正文");
    expect(source).not.toContain("reading-empty");
  });
});
