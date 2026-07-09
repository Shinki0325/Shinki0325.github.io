export type AppearanceFontPreset = "serif" | "sans" | "rounded" | "custom";

export type AppearancePreviewCardVariant = "strong" | "soft" | "outline";

export type AppearancePreviewCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  variant: AppearancePreviewCardVariant;
  widthUnits: number;
  minHeight: number;
};

export type AppearanceNavigationSettings = {
  height: number;
  maxWidth: number;
  paddingX: number;
  blur: number;
  linkGap: number;
};

export type AppearanceMusicPlayerSettings = {
  cardPadding: number;
  coverSize: number;
  controlSize: number;
  primaryControlSize: number;
  floatingWidth: number;
  floatingHeight: number;
  floatingCoverSize: number;
};

export type AppearanceLyricBarSettings = {
  height: number;
  paddingX: number;
  radius: number;
  opacity: number;
  fontSize: number;
};

export type AppearanceSearchBarSettings = {
  width: number;
  height: number;
  marginBottom: number;
  iconSize: number;
};

export type AppearanceProfileCardSettings = {
  paddingX: number;
  paddingY: number;
  avatarSize: number;
  titleSize: number;
  minHeight: number;
  socialButtonSize: number;
};

export type AppearanceConfigForm = {
  panelOpacity: number;
  panelStrongOpacity: number;
  panelSoftOpacity: number;
  backgroundVideoOpacity: number;
  backgroundImageOpacity: number;
  veilOpacity: number;
  pageGutterMin: number;
  pageGutterVw: number;
  pageGutterMax: number;
  maxWidth: number;
  cardScale: number;
  radiusScale: number;
  fontPreset: AppearanceFontPreset;
  fontFamily: string;
  previewCards: AppearancePreviewCard[];
  navigation: AppearanceNavigationSettings;
  musicPlayer: AppearanceMusicPlayerSettings;
  lyricBar: AppearanceLyricBarSettings;
  searchBar: AppearanceSearchBarSettings;
  profileCard: AppearanceProfileCardSettings;
};

type AppearanceConfigRecord = Record<string, unknown>;

export type ParsedAppearanceConfig = {
  source: AppearanceConfigRecord;
  form: AppearanceConfigForm;
};

export const appearanceDefaults: AppearanceConfigForm = {
  panelOpacity: 0.58,
  panelStrongOpacity: 0.78,
  panelSoftOpacity: 0.08,
  backgroundVideoOpacity: 0.62,
  backgroundImageOpacity: 0.46,
  veilOpacity: 1,
  pageGutterMin: 44,
  pageGutterVw: 7,
  pageGutterMax: 112,
  maxWidth: 1052,
  cardScale: 1,
  radiusScale: 1,
  fontPreset: "serif",
  fontFamily: "\"Noto Serif SC\", \"Source Han Serif SC\", \"Songti SC\", serif",
  previewCards: [
    {
      id: "featured",
      eyebrow: "当前主稿",
      title: "为什么90年代是galgame真正意义上的黄金年代",
      description: "围绕90年代 galgame 为何能形成黄金年代感的一篇长文主稿。",
      meta: "文稿",
      actionLabel: "打开文稿",
      variant: "strong",
      widthUnits: 5,
      minHeight: 260,
    },
    {
      id: "reference",
      eyebrow: "重点资料",
      title: "E-LOGIN 条目",
      description: "E-LOGIN 条目梳理了这本杂志的创刊背景、内容定位与读者面向。",
      meta: "资料库",
      actionLabel: "打开资料页",
      variant: "strong",
      widthUnits: 7,
      minHeight: 260,
    },
    {
      id: "notes",
      eyebrow: "最新笔记",
      title: "笔记整理中",
      description: "用于观察小卡片在整页布局里的比例、留白和阅读节奏。",
      meta: "笔记",
      actionLabel: "查看笔记",
      variant: "soft",
      widthUnits: 4,
      minHeight: 180,
    },
    {
      id: "status",
      eyebrow: "运行回廊",
      title: "资料岛仍在缓慢发光",
      description: "公开内容、最近更新和日历模块可以用这种中等尺寸卡片承接。",
      meta: "Live",
      actionLabel: "查看状态",
      variant: "outline",
      widthUnits: 4,
      minHeight: 180,
    },
  ],
  navigation: {
    height: 58,
    maxWidth: 1052,
    paddingX: 16,
    blur: 24,
    linkGap: 12,
  },
  musicPlayer: {
    cardPadding: 29,
    coverSize: 97,
    controlSize: 38,
    primaryControlSize: 49,
    floatingWidth: 350,
    floatingHeight: 64,
    floatingCoverSize: 66,
  },
  lyricBar: {
    height: 76,
    paddingX: 22,
    radius: 25,
    opacity: 0.84,
    fontSize: 16,
  },
  searchBar: {
    width: 684,
    height: 60,
    marginBottom: 4,
    iconSize: 22,
  },
  profileCard: {
    paddingX: 27,
    paddingY: 32,
    avatarSize: 130,
    titleSize: 56,
    minHeight: 286,
    socialButtonSize: 47,
  },
};

export const fontPresetOptions: { value: AppearanceFontPreset; label: string; family: string }[] = [
  {
    value: "serif",
    label: "明朝/宋体",
    family: "\"Noto Serif SC\", \"Source Han Serif SC\", \"Songti SC\", serif",
  },
  {
    value: "sans",
    label: "现代黑体",
    family: "\"Noto Sans SC\", \"Source Han Sans SC\", \"Microsoft YaHei\", sans-serif",
  },
  {
    value: "rounded",
    label: "圆体",
    family: "\"M PLUS Rounded 1c\", \"Noto Sans SC\", \"Microsoft YaHei\", sans-serif",
  },
  {
    value: "custom",
    label: "自定义",
    family: appearanceDefaults.fontFamily,
  },
];

const asRecord = (value: unknown): AppearanceConfigRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as AppearanceConfigRecord) : {};

const asNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const asFontPreset = (value: unknown): AppearanceFontPreset =>
  value === "sans" || value === "rounded" || value === "custom" ? value : "serif";

const asPreviewCardVariant = (value: unknown): AppearancePreviewCardVariant =>
  value === "soft" || value === "outline" ? value : "strong";

const clampNumber = (value: unknown, min: number, max: number, fallback: number) =>
  Math.min(max, Math.max(min, asNumber(value, fallback)));

const normalizePreviewCard = (value: unknown, index: number): AppearancePreviewCard => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.previewCards[index] ?? appearanceDefaults.previewCards[0];

  return {
    id: asString(source.id, fallback.id || `card-${index + 1}`),
    eyebrow: asString(source.eyebrow, fallback.eyebrow),
    title: asString(source.title, fallback.title),
    description: asString(source.description, fallback.description),
    meta: asString(source.meta, fallback.meta),
    actionLabel: asString(source.actionLabel, fallback.actionLabel),
    variant: asPreviewCardVariant(source.variant),
    widthUnits: Math.round(clampNumber(source.widthUnits, 3, 12, fallback.widthUnits)),
    minHeight: Math.round(clampNumber(source.minHeight, 120, 360, fallback.minHeight)),
  };
};

const normalizePreviewCards = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) {
    return appearanceDefaults.previewCards;
  }

  return value.map(normalizePreviewCard);
};

const normalizeNavigation = (value: unknown): AppearanceNavigationSettings => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.navigation;

  return {
    height: Math.round(clampNumber(source.height, 46, 76, fallback.height)),
    maxWidth: Math.round(clampNumber(source.maxWidth, 880, 1320, fallback.maxWidth)),
    paddingX: Math.round(clampNumber(source.paddingX, 10, 30, fallback.paddingX)),
    blur: Math.round(clampNumber(source.blur, 8, 36, fallback.blur)),
    linkGap: Math.round(clampNumber(source.linkGap, 6, 24, fallback.linkGap)),
  };
};

const normalizeMusicPlayer = (value: unknown): AppearanceMusicPlayerSettings => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.musicPlayer;

  return {
    cardPadding: Math.round(clampNumber(source.cardPadding, 18, 42, fallback.cardPadding)),
    coverSize: Math.round(clampNumber(source.coverSize, 72, 132, fallback.coverSize)),
    controlSize: Math.round(clampNumber(source.controlSize, 30, 52, fallback.controlSize)),
    primaryControlSize: Math.round(
      clampNumber(source.primaryControlSize, 40, 68, fallback.primaryControlSize)
    ),
    floatingWidth: Math.round(clampNumber(source.floatingWidth, 280, 460, fallback.floatingWidth)),
    floatingHeight: Math.round(clampNumber(source.floatingHeight, 54, 92, fallback.floatingHeight)),
    floatingCoverSize: Math.round(
      clampNumber(source.floatingCoverSize, 52, 88, fallback.floatingCoverSize)
    ),
  };
};

const normalizeLyricBar = (value: unknown): AppearanceLyricBarSettings => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.lyricBar;

  return {
    height: Math.round(clampNumber(source.height, 54, 104, fallback.height)),
    paddingX: Math.round(clampNumber(source.paddingX, 14, 44, fallback.paddingX)),
    radius: Math.round(clampNumber(source.radius, 14, 40, fallback.radius)),
    opacity: roundedNumber(clampNumber(source.opacity, 0.38, 0.96, fallback.opacity), 2),
    fontSize: Math.round(clampNumber(source.fontSize, 13, 22, fallback.fontSize)),
  };
};

const normalizeSearchBar = (value: unknown): AppearanceSearchBarSettings => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.searchBar;

  return {
    width: Math.round(clampNumber(source.width, 520, 820, fallback.width)),
    height: Math.round(clampNumber(source.height, 48, 76, fallback.height)),
    marginBottom: Math.round(clampNumber(source.marginBottom, 0, 44, fallback.marginBottom)),
    iconSize: Math.round(clampNumber(source.iconSize, 16, 30, fallback.iconSize)),
  };
};

const normalizeProfileCard = (value: unknown): AppearanceProfileCardSettings => {
  const source = asRecord(value);
  const fallback = appearanceDefaults.profileCard;

  return {
    paddingX: Math.round(clampNumber(source.paddingX, 18, 42, fallback.paddingX)),
    paddingY: Math.round(clampNumber(source.paddingY, 20, 46, fallback.paddingY)),
    avatarSize: Math.round(clampNumber(source.avatarSize, 96, 160, fallback.avatarSize)),
    titleSize: Math.round(clampNumber(source.titleSize, 40, 72, fallback.titleSize)),
    minHeight: Math.round(clampNumber(source.minHeight, 220, 380, fallback.minHeight)),
    socialButtonSize: Math.round(clampNumber(source.socialButtonSize, 36, 58, fallback.socialButtonSize)),
  };
};

const roundedNumber = (value: number, digits = 2) => Number(value.toFixed(digits));

export const getPresetFontFamily = (preset: AppearanceFontPreset) =>
  fontPresetOptions.find((option) => option.value === preset)?.family ?? appearanceDefaults.fontFamily;

export const parseAppearanceConfig = (json: string): ParsedAppearanceConfig => {
  const source = asRecord(JSON.parse(json));
  const fontPreset = asFontPreset(source.fontPreset);

  return {
    source,
    form: {
      panelOpacity: asNumber(source.panelOpacity, appearanceDefaults.panelOpacity),
      panelStrongOpacity: asNumber(source.panelStrongOpacity, appearanceDefaults.panelStrongOpacity),
      panelSoftOpacity: asNumber(source.panelSoftOpacity, appearanceDefaults.panelSoftOpacity),
      backgroundVideoOpacity: asNumber(
        source.backgroundVideoOpacity,
        appearanceDefaults.backgroundVideoOpacity
      ),
      backgroundImageOpacity: asNumber(
        source.backgroundImageOpacity,
        appearanceDefaults.backgroundImageOpacity
      ),
      veilOpacity: asNumber(source.veilOpacity, appearanceDefaults.veilOpacity),
      pageGutterMin: asNumber(source.pageGutterMin, appearanceDefaults.pageGutterMin),
      pageGutterVw: asNumber(source.pageGutterVw, appearanceDefaults.pageGutterVw),
      pageGutterMax: asNumber(source.pageGutterMax, appearanceDefaults.pageGutterMax),
      maxWidth: asNumber(source.maxWidth, appearanceDefaults.maxWidth),
      cardScale: asNumber(source.cardScale, appearanceDefaults.cardScale),
      radiusScale: asNumber(source.radiusScale, appearanceDefaults.radiusScale),
      fontPreset,
      fontFamily: asString(source.fontFamily, getPresetFontFamily(fontPreset)),
      previewCards: normalizePreviewCards(source.previewCards),
      navigation: normalizeNavigation(source.navigation),
      musicPlayer: normalizeMusicPlayer(source.musicPlayer),
      lyricBar: normalizeLyricBar(source.lyricBar),
      searchBar: normalizeSearchBar(source.searchBar),
      profileCard: normalizeProfileCard(source.profileCard),
    },
  };
};

export const serializeAppearanceConfig = (
  source: AppearanceConfigRecord,
  form: AppearanceConfigForm
) =>
  JSON.stringify(
    {
      ...source,
      panelOpacity: form.panelOpacity,
      panelStrongOpacity: form.panelStrongOpacity,
      panelSoftOpacity: form.panelSoftOpacity,
      backgroundVideoOpacity: form.backgroundVideoOpacity,
      backgroundImageOpacity: form.backgroundImageOpacity,
      veilOpacity: form.veilOpacity,
      pageGutterMin: form.pageGutterMin,
      pageGutterVw: form.pageGutterVw,
      pageGutterMax: form.pageGutterMax,
      maxWidth: form.maxWidth,
      cardScale: form.cardScale,
      radiusScale: form.radiusScale,
      fontPreset: form.fontPreset,
      fontFamily: form.fontFamily,
      previewCards: form.previewCards,
      navigation: form.navigation,
      musicPlayer: form.musicPlayer,
      lyricBar: form.lyricBar,
      searchBar: form.searchBar,
      profileCard: form.profileCard,
    },
    null,
    2
  );
