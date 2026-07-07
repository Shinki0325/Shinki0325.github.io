import { describe, expect, it, vi } from "vitest";
import { referenceSchema } from "../packages/content-core/src/index";

vi.mock("@maki/content-core", async () => import("../packages/content-core/src/index.ts"));
vi.mock("astro:content", async () => {
  const { z } = await import("zod");

  return {
    defineCollection: (config: unknown) => config,
    z
  };
});

describe("content collections", () => {
  it("exposes article and reference collections", async () => {
    const { collections } = await import("../src/content/config");

    expect(collections).toHaveProperty("articles");
    expect(collections).toHaveProperty("references");
  });

  it("treats related reference metadata as optional", () => {
    const parsed = referenceSchema.parse({
      title: "Example Reference",
      kind: "topic",
      date: "2026-07-07",
      summary: "Optional metadata should be omittable."
    });

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
          focus: true
        }
      ]
    });

    expect(parsed.readingMode).toBe("curated");
    expect(parsed.readingBlocks[0]?.translation).toBe("中文译文");
    expect(parsed.readingBlocks[0]?.focus).toBe(true);
  });
});
