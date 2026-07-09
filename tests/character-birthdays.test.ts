import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import birthdayData from "../src/data/character-birthdays.json";
import {
  birthdayWorks,
  characterBirthdays,
  getAdjacentCalendarMonth,
  getBirthdaysByDate,
  getBirthdaysByMonth,
  getCalendarMonth,
  getCharacterBangumiUrl,
  getCharactersByWork,
  groupBirthdaysByMonthDay,
  isSameMonthDay,
  type CharacterBirthday,
} from "../src/data/character-birthdays";

afterEach(() => {
  vi.doUnmock("../src/data/character-birthdays.json");
  vi.resetModules();
});

describe("character birthday dataset", () => {
  it("is backed by an editable JSON source for manager CRUD", () => {
    expect(birthdayData.works).toHaveLength(birthdayWorks.length);
    expect(birthdayData.characters).toHaveLength(characterBirthdays.length);
    expect(birthdayData.characters[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        workId: expect.any(String),
        name: expect.any(String),
        birthday: expect.any(String),
        avatar: expect.any(String),
        bangumiId: expect.any(String),
      }),
    );
  });

  it("keeps every JSON work id unique with title and source URL", () => {
    const workIds = birthdayData.works.map((work) => work.id);
    expect(new Set(workIds).size).toBe(workIds.length);

    for (const work of birthdayData.works) {
      expect(work.id).not.toBe("");
      expect(work.title).not.toBe("");
      expect(work.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("keeps every JSON character linked, dated, typed, and source-synchronized", () => {
    const workSourceUrls = new Map(birthdayData.works.map((work) => [work.id, work.sourceUrl]));
    const validGenders = new Set(["female", "male"]);
    const validVerificationStatuses = new Set(["verified", "todo"]);

    for (const character of birthdayData.characters) {
      const match = character.birthday.match(/^(\d{2})-(\d{2})$/);
      expect(match, character.name).not.toBeNull();

      const month = Number(match?.[1]);
      const day = Number(match?.[2]);
      const daysInMonth = new Date(2024, month, 0).getDate();

      expect(workSourceUrls.has(character.workId), character.name).toBe(true);
      expect(month, character.name).toBeGreaterThanOrEqual(1);
      expect(month, character.name).toBeLessThanOrEqual(12);
      expect(day, character.name).toBeGreaterThanOrEqual(1);
      expect(day, character.name).toBeLessThanOrEqual(daysInMonth);
      expect(validGenders.has(character.gender), character.name).toBe(true);
      expect(validVerificationStatuses.has(character.verificationStatus), character.name).toBe(true);
      expect(character.sourceUrl, character.name).toBe(workSourceUrls.get(character.workId));
    }
  });

  it("rejects JSON characters whose duplicated source URL drifts from their work", async () => {
    const invalidData = structuredClone(birthdayData);
    invalidData.characters[0] = {
      ...invalidData.characters[0],
      sourceUrl: "https://example.com/drifted-source",
    };

    vi.resetModules();
    vi.doMock("../src/data/character-birthdays.json", () => ({ default: invalidData }));

    await expect(import("../src/data/character-birthdays")).rejects.toThrow(/sourceUrl/);
  });

  it("covers the requested galgame works", () => {
    expect(birthdayWorks.map((work) => work.id)).toEqual(
      expect.arrayContaining([
        "rance-series",
        "summer-pockets",
        "hoshikaka",
        "aokana",
        "maitetsu",
        "kinkoi",
        "ambitious-mission",
        "kakenuke-seishun-sparking",
        "floral-flowlove",
        "hanasaki-work-spring",
        "karumaruka-circle",
        "hatsuyuki-sakura",
        "daitoshokan",
        "sen-no-hatou",
        "eustia",
        "steins-gate",
        "ginharu",
        "hikoukigumo",
        "miahoshi",
        "tsukikana",
        "clover-days",
        "koi-kake",
        "tsukiniyorisou",
        "otome-domain",
        "happiness-nightmare",
        "time-stop-fate",
        "hoshizora-memoria",
        "sakura-moyu",
        "irotoridori-no-sekai",
        "astralair",
        "yukizome-koyo",
        "tayutama",
        "amakano",
        "sakura-no-uta",
        "atri",
        "rewrite",
        "ef",
        "tsukihime",
        "ensemble-coda",
        "itsusora",
        "muv-luv-alternative",
        "baldr-sky",
        "little-busters",
        "kizuna-kirameku",
        "aozora-promise",
        "kimi-nozo",
        "nine",
        "sakura-cloud-scarlet",
        "grisaia",
        "otome-riron",
      ]),
    );
  });

  it("keeps records source-backed and attached to known works", () => {
    const workIds = birthdayWorks.map((work) => work.id);
    expect(new Set(workIds).size).toBe(workIds.length);
    expect(characterBirthdays.length).toBeGreaterThan(120);

    const characterIds = characterBirthdays.map((character) => character.id);
    expect(new Set(characterIds).size).toBe(characterIds.length);

    for (const character of characterBirthdays) {
      expect(workIds).toContain(character.workId);
      expect(character.name).not.toBe("");
      expect(character.birthday).toMatch(/^\d{2}-\d{2}$/);
      expect(character.sourceUrl).toMatch(/^https:\/\//);
      expect(character.verificationStatus).toBe("verified");
    }
  });

  it("uses local generated avatars for every reviewed character", () => {
    for (const character of characterBirthdays) {
      expect(character.avatar, character.name).toMatch(
        /^\/uploads\/character-birthdays\/.+\.webp$/,
      );
      if (character.avatar === null) {
        throw new Error(`Expected ${character.name} to have a generated avatar`);
      }
      expect(
        existsSync(join(process.cwd(), "public", character.avatar.replace(/^\//, ""))),
        character.name,
      ).toBe(true);
    }
  });

  it("uses independent Bangumi character ids instead of birthday-source ids", () => {
    const shiroha = characterBirthdays.find((character) => character.id === "summer-pockets-32209");
    expect(shiroha).toMatchObject({
      name: "鳴瀨しろは",
      sourceId: "32209",
      bangumiId: "59846",
    });
    expect(shiroha ? getCharacterBangumiUrl(shiroha) : null).toBe(
      "https://bangumi.tv/character/59846",
    );

    expect(characterBirthdays.find((character) => character.id === "maitetsu-58373")).toBeUndefined();
    expect(characterBirthdays.find((character) => character.id === "maitetsu-58377")).toBeUndefined();

    for (const character of characterBirthdays) {
      expect(character.bangumiId, character.name).toMatch(/^\d+$/);
      expect(getCharacterBangumiUrl(character), character.name).toBe(
        `https://bangumi.tv/character/${character.bangumiId}`,
      );
    }
  });

  it("includes the manually selected Rance heroines", () => {
    expect(getCharactersByWork("rance-series").map((character) => character.name)).toEqual([
      "シィル・プライン",
      "見当かなみ",
      "魔想志津香",
      "リズナ・ランフビット",
      "マリア・カスタード",
      "コパンドン・ドット",
    ]);
    expect(getBirthdaysByDate(5, 3).map((character) => character.name)).toContain("見当かなみ");
  });

  it("includes representative main characters from the requested works", () => {
    expect(characterBirthdays).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workId: "summer-pockets",
          name: "鳴瀨しろは",
          birthday: "06-08",
        }),
        expect.objectContaining({
          workId: "aokana",
          name: "倉科明日香",
          birthday: "05-02",
        }),
        expect.objectContaining({
          workId: "steins-gate",
          name: "牧瀬紅莉栖",
          birthday: "07-25",
        }),
        expect.objectContaining({
          workId: "tsukiniyorisou",
          name: "小倉朝日（大蔵遊星）",
          gender: "male",
          birthday: "01-06",
        }),
        expect.objectContaining({
          workId: "otome-domain",
          name: "飛鳥湊",
          gender: "male",
          birthday: "05-22",
        }),
        expect.objectContaining({
          workId: "sakura-cloud-scarlet",
          name: "所長",
          birthday: "06-01",
          bangumiId: "77281",
        }),
        expect.objectContaining({
          workId: "muv-luv-alternative",
          name: "御剣冥夜",
          birthday: "12-16",
        }),
        expect.objectContaining({
          workId: "otome-riron",
          name: "大蔵りそな",
          bangumiId: "19924",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "鳥海有栖",
          birthday: "11-26",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "鳥海有子",
          birthday: "11-26",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "蓮乃咲",
          birthday: "08-28",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "弥生・B・ルートウィッジ",
          birthday: "03-03",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "平坂景子",
          birthday: "12-27",
        }),
        expect.objectContaining({
          workId: "happiness-nightmare",
          name: "内藤舞亜",
          birthday: "01-27",
        }),
      ]),
    );

    expect(birthdayWorks.find((work) => work.id === "dimension-shift")).toBeUndefined();
    expect(birthdayWorks.find((work) => work.id === "konosora")).toBeUndefined();
  });

  it("keeps the corrected Sakura Moyu character and removes rejected KimiNozo side characters", () => {
    expect(characterBirthdays.find((character) => character.id === "sakura-moyu-37")).toMatchObject({
      name: "クロ",
      birthday: "02-22",
      bangumiId: "59775",
    });

    expect(characterBirthdays.find((character) => character.id === "kimi-nozo-11644")).toBeUndefined();
    expect(characterBirthdays.find((character) => character.id === "kimi-nozo-11645")).toBeUndefined();
    expect(characterBirthdays.find((character) => character.id === "kimi-nozo-11646")).toBeUndefined();
  });

  it("groups dated records by month and day for a calendar UI", () => {
    const datedCharacters: CharacterBirthday[] = [
      {
        id: "sample-a",
        name: "Sample A",
        workId: "summer-pockets",
        birthday: "03-03",
        gender: "female",
        avatar: null,
        sourceUrl: "https://example.com/a",
        verificationStatus: "verified",
      },
      {
        id: "sample-b",
        name: "Sample B",
        workId: "aokana",
        birthday: "03-03",
        gender: "female",
        avatar: null,
        sourceUrl: "https://example.com/b",
        verificationStatus: "verified",
      },
    ];

    expect(groupBirthdaysByMonthDay(datedCharacters)).toEqual({
      "03-03": [datedCharacters[0], datedCharacters[1]],
    });
  });

  it("offers work, month, and date lookup helpers", () => {
    expect(getCharactersByWork("steins-gate").map((character) => character.name)).toContain(
      "椎名まゆり",
    );
    expect(getBirthdaysByMonth(2).some((character) => character.name === "シィル・プライン")).toBe(
      true,
    );
    expect(getBirthdaysByDate(9, 9).map((character) => character.name)).toEqual(
      expect.arrayContaining(["コパンドン・ドット"]),
    );
  });

  it("builds a Monday-first 42-cell real calendar month with birthday records", () => {
    const month = getCalendarMonth({
      year: 2026,
      month: 7,
      today: "2026-07-08",
      records: characterBirthdays,
    });

    expect(month.year).toBe(2026);
    expect(month.month).toBe(7);
    expect(month.days).toHaveLength(42);
    expect(month.days[0]).toMatchObject({
      date: "2026-06-29",
      month: 6,
      day: 29,
      isCurrentMonth: false,
      isToday: false,
    });

    const today = month.days.find((day) => day.date === "2026-07-08");
    expect(today).toMatchObject({
      birthdayKey: "07-08",
      isCurrentMonth: true,
      isToday: true,
    });

    const kurisuDay = month.days.find((day) => day.date === "2026-07-25");
    expect(kurisuDay?.birthdays.map((character) => character.name)).toContain("牧瀬紅莉栖");
  });

  it("supports month navigation across year boundaries", () => {
    expect(getAdjacentCalendarMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(getAdjacentCalendarMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(getAdjacentCalendarMonth(2026, 7, 0)).toEqual({ year: 2026, month: 7 });
  });

  it("matches recurring birthdays by month and day without depending on the year", () => {
    expect(isSameMonthDay("09-20", "2026-09-20")).toBe(true);
    expect(isSameMonthDay("09-20", new Date("2027-09-20T12:00:00+09:00"))).toBe(true);
    expect(isSameMonthDay("09-20", "2026-09-21")).toBe(false);
  });
});
