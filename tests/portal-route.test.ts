import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("mystery portal routes", () => {
  it("renders a focused portal from the shared project registry", async () => {
    const source = await readFile("src/pages/portal/index.astro", "utf8");

    expect(source).toContain('import { projects } from "../../data/projects"');
    expect(source).toContain("<BaseLayout");
    expect(source).toContain('title="神秘入口"');
    expect(source).toContain("project.href");
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noreferrer"');
    expect(source).toContain("aria-label");
    expect(source).not.toContain("placeholder");
    expect(source).not.toContain("倒计时");
  });

  it("keeps only the legacy notes redirect and removes every note detail source", async () => {
    const redirectSource = await readFile("src/pages/notes/index.astro", "utf8");

    expect(redirectSource).toContain('Astro.redirect("/portal/"');
    expect(existsSync("src/pages/notes/[...slug].astro")).toBe(false);
    expect(existsSync("src/content/notes")).toBe(false);
  });

  it("has no note detail route or content producers", () => {
    expect(existsSync("src/pages/notes/[...slug].astro")).toBe(false);
    expect(existsSync("src/content/notes")).toBe(false);
  });
});
