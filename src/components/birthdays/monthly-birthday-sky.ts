export type MonthlySkyMagnitude = "primary" | "secondary" | "faint";

export type MonthlySkyStar = {
  id: string;
  x: number;
  y: number;
  magnitude: MonthlySkyMagnitude;
};

export type MonthlySkyEdge = { from: string; to: string };

export type MonthlySkyProfile = {
  id: string;
  label: string;
  stars: MonthlySkyStar[];
  edges: MonthlySkyEdge[];
};

type Point = { x: number; y: number };

const s = (
  id: string,
  x: number,
  y: number,
  magnitude: MonthlySkyMagnitude = "secondary",
): MonthlySkyStar => ({ id, x, y, magnitude });

const e = (from: string, to: string): MonthlySkyEdge => ({ from, to });

export const monthlyBirthdaySkyProfiles: Record<number, MonthlySkyProfile> = {
  1: {
    id: "winter-triangle",
    label: "一月 · 冬季大三角",
    stars: [
      s("betelgeuse", 34, 25, "primary"),
      s("procyon", 22, 62, "primary"),
      s("sirius", 57, 78, "primary"),
      s("bellatrix", 53, 24),
      s("rigel", 62, 56),
    ],
    edges: [
      e("betelgeuse", "procyon"),
      e("procyon", "sirius"),
      e("sirius", "betelgeuse"),
      e("betelgeuse", "bellatrix"),
      e("bellatrix", "rigel"),
    ],
  },
  2: {
    id: "winter-hexagon",
    label: "二月 · 冬季六边形",
    stars: [
      s("capella", 32, 16, "primary"),
      s("aldebaran", 51, 32, "primary"),
      s("rigel", 61, 58, "primary"),
      s("sirius", 43, 80, "primary"),
      s("procyon", 20, 63, "primary"),
      s("pollux", 17, 35, "primary"),
    ],
    edges: [
      e("capella", "aldebaran"),
      e("aldebaran", "rigel"),
      e("rigel", "sirius"),
      e("sirius", "procyon"),
      e("procyon", "pollux"),
      e("pollux", "capella"),
    ],
  },
  3: {
    id: "leo",
    label: "三月 · 狮子座",
    stars: [
      s("regulus", 22, 64, "primary"),
      s("eta-leo", 28, 51),
      s("algieba", 36, 41, "primary"),
      s("adhafera", 45, 34),
      s("ras-elasad", 52, 43),
      s("zosma", 61, 49),
      s("denebola", 79, 56, "primary"),
    ],
    edges: [
      e("regulus", "eta-leo"),
      e("eta-leo", "algieba"),
      e("algieba", "adhafera"),
      e("adhafera", "ras-elasad"),
      e("ras-elasad", "algieba"),
      e("algieba", "zosma"),
      e("zosma", "denebola"),
    ],
  },
  4: {
    id: "spring-triangle",
    label: "四月 · 春季大三角",
    stars: [
      s("arcturus", 29, 27, "primary"),
      s("spica", 53, 73, "primary"),
      s("denebola", 79, 42, "primary"),
      s("cor-caroli", 52, 25),
    ],
    edges: [
      e("arcturus", "spica"),
      e("spica", "denebola"),
      e("denebola", "arcturus"),
      e("arcturus", "cor-caroli"),
    ],
  },
  5: {
    id: "bootes-virgo",
    label: "五月 · 牧夫与室女",
    stars: [
      s("arcturus", 31, 27, "primary"),
      s("izar", 22, 43),
      s("nekkar", 32, 58),
      s("seginus", 44, 47),
      s("muphrid", 45, 34),
      s("vindemiatrix", 63, 54),
      s("porrima", 67, 65),
      s("spica", 75, 77, "primary"),
    ],
    edges: [
      e("arcturus", "izar"),
      e("izar", "nekkar"),
      e("nekkar", "seginus"),
      e("seginus", "muphrid"),
      e("muphrid", "arcturus"),
      e("arcturus", "vindemiatrix"),
      e("vindemiatrix", "porrima"),
      e("porrima", "spica"),
    ],
  },
  6: {
    id: "lyra",
    label: "六月 · 天琴座",
    stars: [
      s("vega", 31, 22, "primary"),
      s("epsilon-lyrae", 38, 31),
      s("zeta-lyrae", 45, 42),
      s("sheliak", 38, 57),
      s("sulafat", 53, 58),
      s("delta-lyrae", 54, 42),
    ],
    edges: [
      e("vega", "epsilon-lyrae"),
      e("epsilon-lyrae", "zeta-lyrae"),
      e("zeta-lyrae", "sulafat"),
      e("sulafat", "sheliak"),
      e("sheliak", "zeta-lyrae"),
      e("zeta-lyrae", "delta-lyrae"),
    ],
  },
  7: {
    id: "summer-triangle",
    label: "七月 · 夏季大三角",
    stars: [
      s("vega", 27, 20, "primary"),
      s("deneb", 72, 27, "primary"),
      s("altair", 49, 79, "primary"),
      s("epsilon-lyrae", 33, 29),
      s("sulafat", 38, 41),
      s("sheliak", 30, 44),
      s("sadr", 67, 43),
      s("albireo", 61, 65),
      s("gienah", 55, 45),
      s("delta-cygni", 81, 42),
      s("tarazed", 42, 70),
      s("alshain", 56, 72),
      s("eta-aquilae", 51, 89, "faint"),
    ],
    edges: [
      e("vega", "deneb"),
      e("deneb", "altair"),
      e("altair", "vega"),
      e("vega", "epsilon-lyrae"),
      e("epsilon-lyrae", "sulafat"),
      e("sulafat", "sheliak"),
      e("sheliak", "epsilon-lyrae"),
      e("deneb", "sadr"),
      e("sadr", "albireo"),
      e("gienah", "sadr"),
      e("sadr", "delta-cygni"),
      e("tarazed", "altair"),
      e("altair", "alshain"),
      e("altair", "eta-aquilae"),
    ],
  },
  8: {
    id: "cygnus",
    label: "八月 · 天鹅座",
    stars: [
      s("deneb", 50, 17, "primary"),
      s("sadr", 49, 43, "primary"),
      s("albireo", 48, 78, "primary"),
      s("gienah", 27, 47),
      s("delta-cygni", 74, 42),
      s("epsilon-cygni", 34, 62, "faint"),
    ],
    edges: [
      e("deneb", "sadr"),
      e("sadr", "albireo"),
      e("gienah", "sadr"),
      e("sadr", "delta-cygni"),
      e("gienah", "epsilon-cygni"),
    ],
  },
  9: {
    id: "great-square-pegasus",
    label: "九月 · 秋季四边形",
    stars: [
      s("markab", 27, 31, "primary"),
      s("scheat", 69, 27, "primary"),
      s("algenib", 72, 68, "primary"),
      s("alpheratz", 29, 72, "primary"),
      s("enif", 13, 51),
      s("homam", 20, 42),
    ],
    edges: [
      e("markab", "scheat"),
      e("scheat", "algenib"),
      e("algenib", "alpheratz"),
      e("alpheratz", "markab"),
      e("markab", "homam"),
      e("homam", "enif"),
    ],
  },
  10: {
    id: "andromeda",
    label: "十月 · 仙女座",
    stars: [
      s("alpheratz", 21, 67, "primary"),
      s("delta-and", 33, 58),
      s("mirach", 47, 49, "primary"),
      s("almach", 76, 29, "primary"),
      s("m31", 54, 36, "faint"),
      s("markab", 19, 86),
      s("scheat", 5, 71),
    ],
    edges: [
      e("alpheratz", "delta-and"),
      e("delta-and", "mirach"),
      e("mirach", "almach"),
      e("mirach", "m31"),
      e("alpheratz", "markab"),
      e("alpheratz", "scheat"),
    ],
  },
  11: {
    id: "cassiopeia",
    label: "十一月 · 仙后座",
    stars: [
      s("caph", 18, 55, "primary"),
      s("schedar", 34, 36, "primary"),
      s("gamma-cas", 49, 59, "primary"),
      s("ruchbah", 65, 33, "primary"),
      s("segin", 82, 51, "primary"),
    ],
    edges: [
      e("caph", "schedar"),
      e("schedar", "gamma-cas"),
      e("gamma-cas", "ruchbah"),
      e("ruchbah", "segin"),
    ],
  },
  12: {
    id: "orion",
    label: "十二月 · 猎户座",
    stars: [
      s("betelgeuse", 30, 27, "primary"),
      s("bellatrix", 63, 25, "primary"),
      s("meissa", 48, 16),
      s("alnitak", 37, 48),
      s("alnilam", 49, 50, "primary"),
      s("mintaka", 60, 48),
      s("saiph", 34, 75, "primary"),
      s("rigel", 67, 72, "primary"),
      s("sword", 49, 63, "faint"),
    ],
    edges: [
      e("meissa", "betelgeuse"),
      e("meissa", "bellatrix"),
      e("betelgeuse", "alnitak"),
      e("bellatrix", "mintaka"),
      e("alnitak", "alnilam"),
      e("alnilam", "mintaka"),
      e("alnitak", "saiph"),
      e("mintaka", "rigel"),
      e("saiph", "rigel"),
      e("alnilam", "sword"),
    ],
  },
};

export const getMonthlyBirthdaySky = (month: number) => {
  const profile = monthlyBirthdaySkyProfiles[month];
  if (!profile) throw new Error(`Unsupported birthday sky month: ${month}`);
  return profile;
};

export const getMonthlySkyEdgeKey = (edge: MonthlySkyEdge) => `${edge.from}:${edge.to}`;

export const getIncidentMonthlySkyEdgeKeys = (profile: MonthlySkyProfile, starId: string) =>
  profile.edges
    .filter((edge) => edge.from === starId || edge.to === starId)
    .map(getMonthlySkyEdgeKey);

export const getNearestMonthlySkyStar = (profile: MonthlySkyProfile, point: Point) =>
  profile.stars.reduce((nearest, star) => {
    const nearestDistance = (nearest.x - point.x) ** 2 + (nearest.y - point.y) ** 2;
    const starDistance = (star.x - point.x) ** 2 + (star.y - point.y) ** 2;
    return starDistance < nearestDistance ? star : nearest;
  });
