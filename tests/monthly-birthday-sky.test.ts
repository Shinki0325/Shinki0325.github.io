import { describe, expect, it } from "vitest";
import {
  getIncidentMonthlySkyEdgeKeys,
  getMonthlyBirthdaySky,
  getNearestMonthlySkyStar,
  monthlyBirthdaySkyProfiles,
} from "../src/components/birthdays/monthly-birthday-sky";

const expectedLabels = [
  "一月 · 冬季大三角",
  "二月 · 冬季六边形",
  "三月 · 狮子座",
  "四月 · 春季大三角",
  "五月 · 牧夫与室女",
  "六月 · 天琴座",
  "七月 · 夏季大三角",
  "八月 · 天鹅座",
  "九月 · 秋季四边形",
  "十月 · 仙女座",
  "十一月 · 仙后座",
  "十二月 · 猎户座",
];

describe("monthly birthday sky profiles", () => {
  it("defines one valid profile for every month", () => {
    expect(Object.keys(monthlyBirthdaySkyProfiles)).toHaveLength(12);
    expect(Array.from({ length: 12 }, (_, index) => getMonthlyBirthdaySky(index + 1).label))
      .toEqual(expectedLabels);

    for (let month = 1; month <= 12; month += 1) {
      const profile = getMonthlyBirthdaySky(month);
      const ids = new Set(profile.stars.map((star) => star.id));
      expect(profile.stars.length).toBeGreaterThanOrEqual(3);
      expect(profile.edges.length).toBeGreaterThanOrEqual(2);
      expect(profile.stars.some((star) => star.magnitude === "primary")).toBe(true);
      expect(ids.size).toBe(profile.stars.length);
      for (const star of profile.stars) {
        expect(star.x).toBeGreaterThanOrEqual(0);
        expect(star.x).toBeLessThanOrEqual(100);
        expect(star.y).toBeGreaterThanOrEqual(0);
        expect(star.y).toBeLessThanOrEqual(100);
      }
      for (const edge of profile.edges) {
        expect(ids.has(edge.from), `${month}:${edge.from}`).toBe(true);
        expect(ids.has(edge.to), `${month}:${edge.to}`).toBe(true);
        expect(edge.from).not.toBe(edge.to);
      }
    }
  });

  it("keeps July recognizable as the Summer Triangle with secondary structures", () => {
    const july = getMonthlyBirthdaySky(7);
    const primaries = july.stars
      .filter((star) => star.magnitude === "primary")
      .map((star) => star.id);
    expect(primaries).toEqual(expect.arrayContaining(["vega", "deneb", "altair"]));
    expect(july.stars.map((star) => star.id)).toEqual(
      expect.arrayContaining([
        "sadr",
        "albireo",
        "sheliak",
        "sulafat",
        "tarazed",
        "alshain",
      ]),
    );
  });

  it("finds a nearest star and its incident edges", () => {
    const july = getMonthlyBirthdaySky(7);
    const nearest = getNearestMonthlySkyStar(july, { x: 29, y: 23 });
    expect(nearest.id).toBe("vega");
    expect(getIncidentMonthlySkyEdgeKeys(july, nearest.id).length).toBeGreaterThan(0);
  });
});
