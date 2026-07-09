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

  it("exposes archive card category and cover fields in local editors", async () => {
    const fs = await import("node:fs/promises");
    const [editorSource, referenceEditorSource] = await Promise.all([
      fs.readFile("manager/src/pages/Editor.tsx", "utf8"),
      fs.readFile("manager/src/pages/ReferenceEditor.tsx", "utf8"),
    ]);

    expect(editorSource).toContain("setCategory");
    expect(editorSource).toContain("setCover");
    expect(editorSource).toContain("setCovers");
    expect(editorSource).toContain("归档一级分类");
    expect(editorSource).toContain("卡片头图池");
    expect(referenceEditorSource).toContain("setLibrarySection");
    expect(referenceEditorSource).toContain("setCover");
    expect(referenceEditorSource).toContain("setCovers");
    expect(referenceEditorSource).toContain("资料分区");
    expect(referenceEditorSource).toContain("卡片头图池");
  });
});
