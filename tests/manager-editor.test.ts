import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager editor modules", () => {
  it("keeps editor routes split between generic, album, and reference screens", async () => {
    const appSource = await fs.readFile("manager/src/App.tsx", "utf8");
    const editorSource = await fs.readFile("manager/src/pages/Editor.tsx", "utf8");

    expect(appSource).toContain('import AlbumEditor from "./pages/AlbumEditor"');
    expect(appSource).toContain('{ view: "album-editor", label: "相册编辑" }');
    expect(appSource).toContain('item?.kind === "albums"');
    expect(appSource).toContain('return "album-editor"');
    expect(appSource).toContain('<AlbumEditor selectedEntry={selectedEntry} />');
    expect(editorSource).toContain('selectedEntry.kind === "albums"');
  });
});
