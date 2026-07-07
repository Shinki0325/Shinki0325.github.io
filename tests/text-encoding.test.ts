import { describe, expect, it } from "vitest";
import { ensureUtf8Bom, stripUtf8Bom } from "../src/lib/text-encoding";

describe("text-encoding helpers", () => {
  it("adds a utf-8 bom only once", () => {
    expect(ensureUtf8Bom("正文")).toBe("\uFEFF正文");
    expect(ensureUtf8Bom("\uFEFF正文")).toBe("\uFEFF正文");
  });

  it("strips a utf-8 bom before in-site rendering", () => {
    expect(stripUtf8Bom("\uFEFF正文")).toBe("正文");
    expect(stripUtf8Bom("正文")).toBe("正文");
  });
});
