import { describe, expect, it } from "vitest";
import { isPublicCollection } from "../src/lib/content";

describe("isPublicCollection", () => {
  it("allows only public content collections", () => {
    expect(isPublicCollection("articles")).toBe(true);
    expect(isPublicCollection("notes")).toBe(true);
    expect(isPublicCollection("topics")).toBe(true);
    expect(isPublicCollection("drafts")).toBe(false);
    expect(isPublicCollection("vault")).toBe(false);
  });
});
