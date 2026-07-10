import { describe, expect, it } from "vitest";
import {
  buildBangumiCollectionViewModel,
  normalizeBangumiCollectionItem,
} from "../src/lib/bangumi-collections";

const animeApiItem = {
  updated_at: "2026-06-29T18:35:13+08:00",
  comment: "虽然都说剧情弱智，但这表现力我就问你牛不牛逼吧",
  tags: ["机战", "原创"],
  subject_id: 109948,
  subject_type: 2,
  type: 2,
  rate: 7,
  private: false,
  subject: {
    id: 109948,
    type: 2,
    date: "2014-10-04",
    name: "クロスアンジュ 天使と竜の輪舞",
    name_cn: "CROSS ANGE 天使与龙的轮舞",
    short_summary: "人类获得了高度进化的情报技术。",
    score: 6.4,
    images: {
      common: "https://lain.bgm.tv/r/400/pic/cover/l/ec/eb/109948_96r35.jpg",
      large: "https://lain.bgm.tv/pic/cover/l/ec/eb/109948_96r35.jpg",
    },
    tags: [
      { name: "SUNRISE", count: 841 },
      { name: "原创", count: 718 },
    ],
  },
};

const gameApiItem = {
  ...animeApiItem,
  subject_id: 110,
  subject_type: 4,
  type: 3,
  rate: 9,
  subject: {
    ...animeApiItem.subject,
    id: 110,
    type: 4,
    date: "1989-07-15",
    name: "Rance",
    name_cn: "兰斯",
    score: 7.8,
  },
};

describe("normalizeBangumiCollectionItem", () => {
  it("converts a Bangumi API item into a local poster-card model", () => {
    expect(normalizeBangumiCollectionItem(animeApiItem)).toEqual({
      id: 109948,
      category: "anime",
      categoryLabel: "动画",
      status: "done",
      statusLabel: "看过",
      title: "CROSS ANGE 天使与龙的轮舞",
      originalTitle: "クロスアンジュ 天使と竜の輪舞",
      year: "2014",
      cover: "https://lain.bgm.tv/r/400/pic/cover/l/ec/eb/109948_96r35.jpg",
      score: 6.4,
      userRate: 7,
      comment: "虽然都说剧情弱智，但这表现力我就问你牛不牛逼吧",
      tags: ["机战", "原创", "SUNRISE"],
      url: "https://bangumi.tv/subject/109948",
      updatedAt: "2026-06-29T18:35:13+08:00",
    });
  });
});

describe("buildBangumiCollectionViewModel", () => {
  it("summarizes category and status counts for filtering", () => {
    const model = buildBangumiCollectionViewModel({
      username: "shinkisakura",
      updatedAt: "2026-07-09T00:00:00.000Z",
      items: [animeApiItem, gameApiItem],
    });

    expect(model.username).toBe("shinkisakura");
    expect(model.total).toBe(2);
    expect(model.categories.map((category) => [category.key, category.count])).toEqual([
      ["anime", 1],
      ["book", 0],
      ["music", 0],
      ["game", 1],
    ]);
    expect(model.statuses.map((status) => [status.key, status.count])).toEqual([
      ["all", 2],
      ["wish", 0],
      ["done", 1],
      ["doing", 1],
      ["on_hold", 0],
      ["dropped", 0],
    ]);
  });
});
