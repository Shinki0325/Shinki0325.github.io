import { describe, expect, it } from "vitest";

describe("manager editor modules", () => {
  it("exports the link insert dialog and reference editor", async () => {
    await expect(import("../manager/src/components/LinkInsertDialog")).resolves.toBeTruthy();
    await expect(import("../manager/src/pages/ReferenceEditor")).resolves.toBeTruthy();
  });
});
