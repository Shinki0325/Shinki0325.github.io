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
});
