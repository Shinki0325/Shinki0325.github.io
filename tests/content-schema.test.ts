import { describe, expect, it } from "vitest";

describe("project baseline", () => {
  it("loads the site config module", async () => {
    await expect(import("../src/data/site")).resolves.toMatchObject({
      siteTitle: "Shinki"
    });
  });
});
