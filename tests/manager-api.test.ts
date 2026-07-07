import { describe, expect, it } from "vitest";

describe("manager api contract", () => {
  it("exports a local content listing handler", async () => {
    const mod = await import("../manager/server/routes/content");
    expect(mod).toHaveProperty("registerContentRoutes");
  });
});
