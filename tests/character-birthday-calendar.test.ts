import { describe, expect, it } from "vitest";
import { getCalendarMonth } from "../src/data/character-birthdays";
import {
  buildBirthdayConstellationPath,
  buildBirthdayConstellationWeekPath,
  getBirthdayConstellationLayout,
  isBirthdayConstellationDateVisible,
} from "../src/components/birthdays/birthday-constellation";

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
});
