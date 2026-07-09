import { describe, expect, it } from "vitest";

describe("site background performance", () => {
  it("does not eagerly download the large homepage background video", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/chrome/SiteBackground.astro", "utf8")
    );

    expect(source).not.toContain('preload="auto"');
    expect(source).toContain('preload="none"');
    expect(source).toContain("data-src={homeBackground.videoSrc}");
    expect(source).toContain("data-home-background-source");
    expect(source).toContain("requestIdleCallback");
  });
});
