import { describe, expect, it } from "vitest";
import {
  buildReferenceIntro,
  buildRelatedReferenceSlugs,
  buildReferenceSourceNeighbors,
  partitionReferenceLibrary,
  selectPublishedReferenceAuthority
} from "../src/lib/reference-library";

describe("partitionReferenceLibrary", () => {
  it("preserves topic and source kinds in the overview adapter contract", async () => {
    const referencesSource = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/pages/references/index.astro", "utf8")
    );
    const entries = [
      { slug: "topic-entry", data: { kind: "topic" as const } },
      { slug: "source-entry", data: { kind: "source" as const } },
    ];
    const mapped = entries.map((entry) => ({ entryKind: entry.data.kind }));

    expect(referencesSource).toContain("entryKind: entry.data.kind");
    expect(mapped.map((item) => item.entryKind)).toEqual(["topic", "source"]);
  });

  it("separates topic pages and groups source pages by the configured section order", () => {
    const result = partitionReferenceLibrary([
      {
        slug: "topic-entry",
        data: {
          kind: "topic",
          title: "资料包索引",
          summary: "主题索引"
        }
      },
      {
        slug: "social-entry",
        data: {
          kind: "source",
          title: "PC-9801 条目",
          summary: "PC-98 平台背景。",
          librarySection: "社会背景"
        }
      },
      {
        slug: "memory-entry",
        data: {
          kind: "source",
          title: "玩家回忆",
          summary: "玩家回忆。",
          librarySection: "回忆、讨论与后见视角"
        }
      },
      {
        slug: "work-entry",
        data: {
          kind: "source",
          title: "To Heart 条目",
          summary: "作品条目。",
          librarySection: "作品与人物"
        }
      }
    ]);

    expect(result.topicEntries.map((entry) => entry.slug)).toEqual(["topic-entry"]);
    expect(result.sourceGroups.map((group) => group.section)).toEqual([
      "回忆、讨论与后见视角",
      "作品与人物",
      "社会背景"
    ]);
    expect(result.sourceGroups[0]?.entries.map((entry) => entry.slug)).toEqual(["memory-entry"]);
    expect(result.sourceGroups[1]?.entries.map((entry) => entry.slug)).toEqual(["work-entry"]);
    expect(result.sourceGroups[2]?.entries.map((entry) => entry.slug)).toEqual(["social-entry"]);
  });
});

describe("buildReferenceIntro", () => {
  it("prefers explicit intro text when provided", () => {
    expect(
      buildReferenceIntro({
        title: "同级生",
        kind: "source",
        summary: "作品条目。",
        librarySection: "作品与人物",
        intro: "这份资料主要梳理《同级生》的作品定位与影响。"
      })
    ).toBe("这份资料主要梳理《同级生》的作品定位与影响。");
  });

  it("builds a fallback intro from summary and section when intro is missing", () => {
    expect(
      buildReferenceIntro({
        title: "地方电视网",
        kind: "source",
        summary: "90年代地方观众接收东京电视台内容时遇到的传播条件与地域差异。",
        librarySection: "社会背景"
      })
    ).toBe(
      "这份资料主要在讲90年代地方观众接收东京电视台内容时遇到的传播条件与地域差异。适合用来补平台环境、传播条件和时代背景。"
    );
  });

  it("builds a topic intro for topic pages", () => {
    expect(
      buildReferenceIntro({
        title: "资料包索引",
        kind: "topic",
        summary: "90年代 galgame 网页归档的公开索引页。"
      })
    ).toBe("这页主要收纳90年代 galgame 网页归档的公开索引页。适合拿来作为站内资料入口与专题索引。");
  });
});

describe("buildRelatedReferenceSlugs", () => {
  it("keeps explicit related references first and fills the rest with same-section neighbors", () => {
    const result = buildRelatedReferenceSlugs(
      {
        slug: "current",
        data: {
          kind: "source",
          title: "To Heart 讨论",
          summary: "讨论 To Heart 的社群回看。",
          librarySection: "回忆、讨论与后见视角",
          tags: ["galgame", "社群讨论"],
          topics: ["galgame-90s"],
          relatedRefs: ["manual-link"]
        }
      },
      [
        {
          slug: "manual-link",
          data: {
            kind: "source",
            title: "To Heart 条目",
            summary: "作品条目。",
            librarySection: "作品与人物",
            tags: ["galgame", "作品条目"],
            topics: ["galgame-90s"]
          }
        },
        {
          slug: "same-section-best",
          data: {
            kind: "source",
            title: "社群讨论 A",
            summary: "社群讨论。",
            librarySection: "回忆、讨论与后见视角",
            tags: ["galgame", "社群讨论"],
            topics: ["galgame-90s"]
          }
        },
        {
          slug: "same-section-next",
          data: {
            kind: "source",
            title: "社群讨论 B",
            summary: "社群讨论。",
            librarySection: "回忆、讨论与后见视角",
            tags: ["galgame"],
            topics: ["galgame-90s"]
          }
        },
        {
          slug: "different-section",
          data: {
            kind: "source",
            title: "硬件背景",
            summary: "平台背景。",
            librarySection: "社会背景",
            tags: ["pc-98"],
            topics: ["galgame-90s"]
          }
        }
      ],
      3
    );

    expect(result).toEqual(["manual-link", "same-section-best", "same-section-next"]);
  });
});

describe("buildReferenceSourceNeighbors", () => {
  const entries = [
    { slug: "source-a", data: { kind: "source" as const, title: "Source A", summary: "A" } },
    { slug: "topic-x", data: { kind: "topic" as const, title: "Topic X", summary: "X" } },
    { slug: "source-b", data: { kind: "source" as const, title: "Source B", summary: "B" } },
    { slug: "source-c", data: { kind: "source" as const, title: "Source C", summary: "C" } }
  ];

  it("preserves published source order while excluding topics", () => {
    expect(buildReferenceSourceNeighbors(entries, "source-b")).toEqual({
      previous: { slug: "source-a", title: "Source A" },
      next: { slug: "source-c", title: "Source C" }
    });
    expect(buildReferenceSourceNeighbors(entries, "topic-x")).toEqual({ previous: null, next: null });
  });

  it("does not wrap at the first or last published source", () => {
    expect(buildReferenceSourceNeighbors(entries, "source-a")).toEqual({
      previous: null,
      next: { slug: "source-b", title: "Source B" }
    });
    expect(buildReferenceSourceNeighbors(entries, "source-c")).toEqual({
      previous: { slug: "source-b", title: "Source B" },
      next: null
    });
  });
});

describe("production reference authority", () => {
  it("keeps distinct owner-authorized entrances even when they share a source URL", () => {
    const sharedSourceUrl = "https://example.com/shared-source";
    const entries = [
      {
        slug: "authority-a",
        data: { sourceUrl: sharedSourceUrl, ownerPublication: { decision: "project-owner-authorized-all-layers", entrance: true } }
      },
      {
        slug: "authority-b",
        data: { sourceUrl: sharedSourceUrl, ownerPublication: { decision: "project-owner-authorized-all-layers", entrance: true } }
      },
      {
        slug: "legacy-duplicate",
        data: { sourceUrl: sharedSourceUrl }
      }
    ];

    expect(selectPublishedReferenceAuthority(entries).map((entry) => entry.slug)).toEqual([
      "authority-a",
      "authority-b"
    ]);
  });

  it("publishes exactly 59 unique authority entries and preserves legacy redirects", async () => {
    const { readdir, readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const referencesRoot = "src/content/references";
    const files = (await readdir(referencesRoot)).filter((file) => file.endsWith(".md"));
    const authorizedSourceIds: string[] = [];

    for (const file of files) {
      const source = await readFile(join(referencesRoot, file), "utf8");
      if (!/^ownerPublication:.*"decision":"project-owner-authorized-all-layers"/mu.test(source)) continue;
      const sourceIds = source.match(/^sourceIds:\s*(\[[^\n]+\])/mu)?.[1];
      expect(sourceIds, `${file} must declare sourceIds`).toBeTruthy();
      authorizedSourceIds.push(sourceIds!);
    }

    expect(authorizedSourceIds).toHaveLength(59);
    expect(new Set(authorizedSourceIds).size).toBe(59);

    const redirectPages = [
      "src/pages/references/1990年代のエロゲー業界漫画-16bitセンセーション-はいかにして生まれた-作者若木民喜原案みつみ美里-and-甘露樹に直撃-ゲームエンタメ最新情報のファミ通-com.astro",
      "src/pages/references/コラム-昔やっていたゲームの思い出-19902003年くらい-大橋ちよ.astro",
      "src/pages/references/雫-痕-そして-toheart-ビジュアルノベルの誕生と繚乱-アニメ-16bitセンセーション-another-layer-連動企画第4回-ゲームエンタメ最新情報のファミ通-com.astro"
    ];
    const redirects = await Promise.all(redirectPages.map((file) => readFile(file, "utf8")));
    expect(redirects.every((source) => source.includes("location.replace(target)"))).toBe(true);
  });
});
