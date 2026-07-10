import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("topics merged into notes", () => {
  it("keeps former topic entries as note content and removes the standalone topic section", async () => {
    const [siteShellSource, noteDetailSource, notesIndexSource, archiveNoteSource, galgameNoteSource] = await Promise.all([
      readFile("src/config/site-shell.ts", "utf8"),
      readFile("src/pages/notes/[...slug].astro", "utf8"),
      readFile("src/pages/notes/index.astro", "utf8"),
      readFile("src/content/notes/archive.md", "utf8"),
      readFile("src/content/notes/galgame-90s.md", "utf8"),
    ]);

    expect(existsSync("src/content/notes/galgame-90s.md")).toBe(true);
    expect(existsSync("src/content/notes/archive.md")).toBe(true);
    expect(existsSync("src/content/topics")).toBe(false);
    expect(existsSync("src/content/topics/galgame-90s.md")).toBe(false);
    expect(existsSync("src/pages/topics/index.astro")).toBe(false);
    expect(existsSync("src/pages/topics/[slug].astro")).toBe(false);
    expect(siteShellSource).not.toContain('href: "/topics/"');
    expect(siteShellSource).not.toContain('label: "专题"');
    expect(noteDetailSource).toContain('href={`/notes/${topic}/`}');
    expect(noteDetailSource).not.toContain("/topics/");
    expect(notesIndexSource).toContain("getPublishedNotes");
    expect(archiveNoteSource).not.toContain("专题");
    expect(galgameNoteSource).not.toContain("专题");
  });
});
