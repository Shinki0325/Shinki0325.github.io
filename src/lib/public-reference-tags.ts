const DOMAIN_LABELS: Record<string, string> = {
  "genre-narrative": "类型与叙事",
  "creation-production": "创作与制作",
  "platform-technology": "平台与技术",
  "industry-company": "产业与会社",
  "market-distribution": "市场与流通",
  "media-circulation": "媒体与传播",
  "player-community": "玩家与社群",
  "society-regulation": "社会与制度",
  "place-everyday": "地域与日常",
  "reception-impact": "作品接受与影响",
};

const EXPLICIT_LABELS: Record<string, string> = {
  galgame: "视觉小说",
  "玩家交流": "玩家交流",
  "玩家经历": "玩家经历",
  "创作与制作": "创作与制作",
  "媒体与传播": "媒体与传播",
};

export const publicReferenceTags = (tags: string[] = []) =>
  [...new Set(tags.map((tag) => DOMAIN_LABELS[tag] ?? EXPLICIT_LABELS[tag] ?? (/\p{Script=Han}/u.test(tag) ? tag : undefined)).filter(Boolean))];
