import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Crystal Terminal foundation", () => {
  it("loads after legacy global CSS and marks the interface theme", async () => {
    const layout = await readFile("src/layouts/BaseLayout.astro", "utf8");
    expect(layout.indexOf('import "../styles/global.css"')).toBeGreaterThanOrEqual(0);
    expect(layout.indexOf('import "../styles/crystal-terminal.css"')).toBeGreaterThan(layout.indexOf('import "../styles/global.css"'));
    expect(layout).toContain('data-interface-theme="crystal-terminal"');
  });
  it("publishes approved tokens and surface hierarchy", async () => {
    const styles = await readFile("src/styles/crystal-terminal.css", "utf8");
    for (const declaration of ["--crystal-field: #07111d;", "--crystal-surface-1: rgba(13, 25, 42, 0.92);", "--crystal-surface-2: rgba(25, 35, 57, 0.86);", "--crystal-surface-3: rgba(44, 36, 64, 0.9);", "--crystal-line: rgba(190, 211, 225, 0.22);", "--crystal-text: #f1f5f8;", "--crystal-muted: #b5c1cf;", "--crystal-cyan: #6bdce2;", "--crystal-pink: #f1a4cd;", "--crystal-gold: #dbb662;", "--crystal-coral: #ef7d72;", "--crystal-green: #92c9a0;", "--crystal-radius: 5px;", "--crystal-radius-tight: 3px;"]) expect(styles).toContain(declaration);
    expect(styles).toContain("--font-story:"); expect(styles).toContain("--font-ui:"); expect(styles).toContain("--font-meta:");
    expect(styles).toContain('[data-crystal-surface="s1"]'); expect(styles).toContain('[data-crystal-surface="s2"]'); expect(styles).toContain('[data-crystal-surface="s3"]');
    expect(styles).toContain('[data-crystal-state="error"]'); expect(styles).toContain('[data-crystal-state="success"]'); expect(styles).toContain('[aria-busy="true"]');
  });
  it("adds no font, image, audio, or decorative network dependency", async () => {
    const styles = await readFile("src/styles/crystal-terminal.css", "utf8");
    expect(styles).not.toMatch(/@font-face|url\s*\(/i);
  });
});
