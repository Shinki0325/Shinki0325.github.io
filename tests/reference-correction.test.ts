import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildReferenceReadingState } from "../src/lib/reference-reading";
import { publicReferenceTags } from "../src/lib/public-reference-tags";
import { buildReferenceReadingDocument } from "../src/lib/reference-publication";

describe("reference publication correction", () => {
  it("forces the Astro content store to refresh before production builds", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ) as { scripts?: Record<string, string> };

    expect(packageJson.scripts?.build).toContain("astro build --force");
  });

  it("omits source-only reading documents from the topic index", () => {
    const topic = readFileSync(
      new URL("../src/content/references/galgame-90s-web-archive-package.md", import.meta.url),
      "utf8"
    );

    expect(topic).not.toMatch(/^readingDocument:/mu);
    expect(topic).toContain('summary: "90年代 galgame 网页归档资料包"');
    expect(topic).toContain('intro: "90年代 galgame 网页归档资料包"');
  });

  it("keeps Chinese overview and section summaries out of original blocks", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      publicationBoundary: {
        publicReadingPage: true,
        ownerPublicationDecision: "blog-manager-p0-correction-2026-07-25",
      },
      overview: "中文资料总览",
      sections: [{ title: "章节", summary: "中文章节摘要" }],
      sourceBlocks: [{ label: "原文 01", original: "日本語の原文" }],
    });

    expect(state.overview).toBe("中文资料总览");
    expect(state.sections[0]?.summary).toBe("中文章节摘要");
    expect(state.blocks.map((block) => block.original)).toEqual(["日本語の原文"]);
    expect(state.blocks.map((block) => block.original)).not.toContain("中文资料总览");
  });

  it("does not expose a complete body or attachment without explicit public reading permission", () => {
    const state = buildReferenceReadingState({
      readingMode: "curated",
      publicationBoundary: {
        publicReadingPage: true,
        visibility: "local-review-package",
        ownerPublicationDecision: "blog-manager-p0-correction-2026-07-25",
      },
      overview: "中文摘要",
      sourceBlocks: [{ original: "日本語の原文" }],
      attachments: ["/uploads/reference-reading/private.txt"],
    });

    expect(state.mode).toBe("curated");
    expect(state.blocks).toHaveLength(1);
    expect(state.extract).toBeNull();
  });

  it("returns Chinese public labels and never internal kebab-case IDs", () => {
    const tags = publicReferenceTags(["creator-interview", "pc-98", "creation-production", "player-community"]);
    expect(tags).toContainEqual({ key: "creation-production", label: "创作与制作" });
    expect(tags).toContainEqual({ key: "player-community", label: "玩家与社群" });
    expect(tags.map((tag) => tag.key)).not.toContain("creator-interview");
    expect(tags.map((tag) => tag.key)).not.toContain("pc-98");
    expect(tags.every((tag) => !/^[a-z0-9]+(?:-[a-z0-9]+)+$/u.test(tag.label))).toBe(true);
  });

  it("preserves source preface before the first reviewed chapter anchor", () => {
    const document = buildReferenceReadingDocument({
      overviewZh: ["总览"],
      sourceLanguage: "ja",
      body: { paragraphs: [
        { id: "p-001", kind: "paragraph", text: "署名" },
        { id: "p-002", kind: "paragraph", text: "导语" },
        { id: "p-003", kind: "paragraph", text: "前言" },
        { id: "p-004", kind: "heading", text: "第一章" },
        { id: "p-005", kind: "paragraph", text: "正文" },
      ] },
      sections: [{ id: "chapter-one", titleZh: "第一章", summaryZh: "摘要", startBlockId: "p-004" }],
    }, {
      decision: "project-owner-authorized-all-layers",
      decidedAt: "2026-07-25",
      entrance: true,
      overview: true,
      chapterSummaries: true,
      sourceBody: true,
      attachments: true,
    });

    expect(document.prefaceBlocks.map((block) => block.id)).toEqual(["p-001", "p-002", "p-003"]);
    expect(document.chapters[0]?.startBlockId).toBe("p-004");
    expect(document.chapters[0]?.sourceBlocks.map((block) => block.id)).toEqual(["p-004", "p-005"]);
    expect(document.publicBodyAllowed).toBe(true);
  });
});
