import { describe, expect, it } from "vitest";
import {
  buildReferenceIntro,
  buildRelatedReferenceSlugs,
  partitionReferenceLibrary
} from "../src/lib/reference-library";

describe("partitionReferenceLibrary", () => {
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
