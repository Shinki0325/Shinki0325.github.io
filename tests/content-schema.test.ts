import { describe, expect, it, vi } from "vitest";

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
});
