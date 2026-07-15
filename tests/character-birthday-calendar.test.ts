import { describe, expect, it } from "vitest";
import {
  getCalendarMonth,
  type CharacterBirthday,
} from "../src/data/character-birthdays";
import {
  buildBirthdayConstellationFocusPath,
  buildBirthdayConstellationPath,
  buildBirthdayConstellationWeekPath,
  getBirthdayNeighborDates,
  getBirthdayConstellationLayout,
  isBirthdayConstellationDateVisible,
} from "../src/components/birthdays/birthday-constellation";

const birthday = (
  id: string,
  date: CharacterBirthday["birthday"],
): CharacterBirthday => ({
  id,
  name: id,
  workId: "test-work",
  birthday: date,
  gender: "female",
  avatar: `/uploads/${id}.webp`,
  sourceUrl: "https://example.com/work",
  bangumiId: id,
  verificationStatus: "verified",
});

describe("birthday constellation layout", () => {
  it("places July 2026 on Monday-first weekday coordinates without filler days", () => {
    const calendar = getCalendarMonth({
      year: 2026,
      month: 7,
      today: "2026-07-14",
      records: [],
    });
    const layout = getBirthdayConstellationLayout(calendar);

    expect(layout).toHaveLength(31);
    expect(layout[0]).toMatchObject({ day: 1, week: 0, column: 2, x: 36, y: 12 });
    expect(layout.at(-1)).toMatchObject({ day: 31, week: 4, column: 4, x: 64, y: 72 });
  });

  it("shows a selected node only in its exact visible year and month", () => {
    const selectedDate = { year: 2026, month: 7, day: 14 };

    expect(isBirthdayConstellationDateVisible(selectedDate, 2026, 7)).toBe(true);
    expect(isBirthdayConstellationDateVisible(selectedDate, 2026, 8)).toBe(false);
    expect(isBirthdayConstellationDateVisible(selectedDate, 2027, 7)).toBe(false);
  });

  it("routes week transitions outside node rows", () => {
    const calendar = getCalendarMonth({ year: 2026, month: 7, records: [] });
    const path = buildBirthdayConstellationPath(getBirthdayConstellationLayout(calendar));

    expect(path).toContain("L 96 12");
    expect(path).toContain("L 4 19.5");
    expect(path).not.toContain("NaN");
  });

  it("builds an isolated path for the hovered week without changing node positions", () => {
    const calendar = getCalendarMonth({ year: 2026, month: 7, records: [] });
    const layout = getBirthdayConstellationLayout(calendar);

    expect(buildBirthdayConstellationWeekPath(layout, 1)).toBe(
      "M 8 27 L 22 27 L 36 27 L 50 27 L 64 27 L 78 27 L 92 27",
    );
  });

  it("finds one previous and one next recurring birthday date with grouped characters", () => {
    const neighbors = getBirthdayNeighborDates(
      { year: 2026, month: 7, day: 8 },
      [birthday("a", "07-07"), birthday("b", "07-07"), birthday("c", "07-12")],
    );

    expect(neighbors.previous).toMatchObject({ year: 2026, month: 7, day: 7 });
    expect(neighbors.previous?.birthdays.map((item) => item.id)).toEqual(["a", "b"]);
    expect(neighbors.next).toMatchObject({ year: 2026, month: 7, day: 12 });
  });

  it("wraps neighbor dates across year boundaries", () => {
    const neighbors = getBirthdayNeighborDates(
      { year: 2026, month: 1, day: 1 },
      [birthday("previous", "12-31"), birthday("next", "01-02")],
    );

    expect(neighbors.previous).toMatchObject({ year: 2025, month: 12, day: 31 });
    expect(neighbors.next).toMatchObject({ year: 2026, month: 1, day: 2 });
  });

  it("builds only the path immediately surrounding the focused date", () => {
    const calendar = getCalendarMonth({ year: 2026, month: 7, records: [] });
    const layout = getBirthdayConstellationLayout(calendar);
    const path = buildBirthdayConstellationFocusPath(layout, 8);

    expect(path).toContain("M 22 27");
    expect(path).toContain("L 50 27");
    expect(path).not.toContain("M 36 12");
  });
});
