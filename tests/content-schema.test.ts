import { describe, expect, it, vi } from "vitest";
import { albumSchema, referenceSchema } from "../packages/content-core/src/index";

vi.mock("@maki/content-core", async () => import("../packages/content-core/src/index.ts"));
vi.mock("astro:content", async () => {
  const { z } = await import("zod");

  return {
    defineCollection: (config: unknown) => config,
    z,
  };
});

describe("content collections", () => {
  it("exposes article, album, and reference collections", async () => {
    const { collections } = await import("../src/content/config");

    expect(collections).toHaveProperty("articles");
    expect(collections).toHaveProperty("albums");
    expect(collections).toHaveProperty("references");
  });

  it("parses album entries with agreed relationship fields", () => {
    const parsed = albumSchema.parse({
      title: "站点素材墙示例",
      date: "2026-07-08",
      summary: "示例照片墙内容。",
      visibility: "hidden",
      location: "本地素材库",
      relatedArticles: ["galgame-90s-golden-age"],
      relatedReferences: ["visual-novel-origins-famitsu"],
      photos: [
        {
          url: "https://images.example.com/album/scene-01.jpg",
          alt: "用于展示的视觉素材",
          caption: "局部构图",
          credit: "Example Studio",
          relatedArticles: ["galgame-90s-golden-age"],
          relatedReferences: ["visual-novel-origins-famitsu"],
        },
      ],
    });

    expect(parsed.visibility).toBe("hidden");
    expect(parsed.relatedArticles).toEqual(["galgame-90s-golden-age"]);
    expect(parsed.photos[0]?.url).toContain("/scene-01.jpg");
    expect(parsed.photos[0]?.relatedReferences).toEqual(["visual-novel-origins-famitsu"]);
  });

  it("treats related reference metadata as optional", () => {
    const parsed = referenceSchema.parse({
      title: "Example Reference",
      kind: "topic",
      librarySection: "社会背景",
      date: "2026-07-07",
      summary: "Optional metadata should be omittable.",
    });

    expect(parsed.librarySection).toBe("社会背景");
    expect(parsed.relatedRefs).toBeUndefined();
    expect(parsed.relatedScripts).toBeUndefined();
  });

  it("parses curated reading blocks with translation and focus markers", () => {
    const parsed = referenceSchema.parse({
      title: "Example Reference",
      kind: "source",
      visibility: "public",
      date: "2026-07-07",
      summary: "Structured reading data should parse.",
      readingMode: "curated",
      sourceLanguage: "ja",
      translationLanguage: "zh-CN",
      readingBlocks: [
        {
          label: "作品简介",
          original: "原文段落",
          translation: "中文译文",
          note: "编者备注",
          focus: true,
        },
      ],
    });

    expect(parsed.readingMode).toBe("curated");
    expect(parsed.readingBlocks[0]?.translation).toBe("中文译文");
    expect(parsed.readingBlocks[0]?.focus).toBe(true);
  });

  it("applies default reading values for references", () => {
    const minimalParsed = referenceSchema.parse({
      title: "Minimal Reference",
      kind: "source",
      date: "2026-07-07",
      summary: "Defaults should be applied.",
    });

    const blockParsed = referenceSchema.parse({
      title: "Reading Block Default",
      kind: "source",
      date: "2026-07-07",
      summary: "Reading block focus should default to false.",
      readingBlocks: [{ original: "Only original text" }],
    });

    expect(minimalParsed.readingMode).toBe("extract");
    expect(minimalParsed.readingBlocks).toEqual([]);
    expect(blockParsed.readingBlocks[0]?.focus).toBe(false);
  });
});
