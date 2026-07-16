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

  it("persists non-home rotation state while preserving the gentle drift", async () => {
    const [componentSource, styleSource] = await Promise.all([
      import("node:fs/promises").then((fs) => fs.readFile("src/components/chrome/SiteBackground.astro", "utf8")),
      import("node:fs/promises").then((fs) => fs.readFile("src/styles/global.css", "utf8")),
    ]);

    expect(componentSource).toContain("Math.floor(Math.random() * slides.length)");
    expect(componentSource).toContain('const BACKGROUND_STATE_KEY = "blog:nonhome-background-state:v1"');
    expect(componentSource).toContain("readBackgroundState");
    expect(componentSource).toContain("writeBackgroundState");
    expect(componentSource).toContain("Number.isInteger(parsed.activeIndex)");
    expect(componentSource).toContain("Number.isFinite(parsed.nextRotationAt)");
    expect(componentSource).toContain("while (nextRotationAt <= now)");
    expect(componentSource).toContain("nextRotationAt - Date.now()");
    expect(componentSource).toContain("data-background-slide");
    expect(componentSource).toContain("data-background-src={src}");
    expect(componentSource).not.toContain("style={`--bg-url: url('");
    expect(componentSource).toContain("const BACKGROUND_PRELOAD_DELAY_MS = 55_000");
    expect(componentSource).toContain('document.addEventListener("astro:before-swap"');
    expect(componentSource).not.toContain("setInterval");
    expect(componentSource).toContain("clearTimeout(rotationTimer)");
    expect(componentSource).toContain("clearTimeout(preloadTimer)");
    const normalizedStyleSource = styleSource.replace(/\r\n/g, "\n");

    expect(normalizedStyleSource).toContain("animation: drift-pan 96s ease-in-out infinite alternate");
    expect(normalizedStyleSource).toContain("translate3d(-1.15%, -0.58%, 0)");
    expect(normalizedStyleSource).toContain("translate3d(1.15%, 0.58%, 0)");
    expect(normalizedStyleSource).toContain(".site-backdrop__image.is-active");
    expect(normalizedStyleSource).toContain(".site-backdrop__image.is-active {\n    animation: none;");
  });
});
