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

  it("randomizes non-home background slides and gives active images a gentle drift", async () => {
    const [componentSource, styleSource] = await Promise.all([
      import("node:fs/promises").then((fs) => fs.readFile("src/components/chrome/SiteBackground.astro", "utf8")),
      import("node:fs/promises").then((fs) => fs.readFile("src/styles/global.css", "utf8")),
    ]);

    expect(componentSource).toContain("Math.floor(Math.random() * slides.length)");
    expect(componentSource).toContain("activateSlide(randomIndex)");
    expect(componentSource).toContain("data-background-slide");
    const normalizedStyleSource = styleSource.replace(/\r\n/g, "\n");

    expect(normalizedStyleSource).toContain("animation: drift-pan 96s ease-in-out infinite alternate");
    expect(normalizedStyleSource).toContain("translate3d(-1.15%, -0.58%, 0)");
    expect(normalizedStyleSource).toContain("translate3d(1.15%, 0.58%, 0)");
    expect(normalizedStyleSource).toContain(".site-backdrop__image.is-active");
    expect(normalizedStyleSource).toContain(".site-backdrop__image.is-active {\n    animation: none;");
  });
});
