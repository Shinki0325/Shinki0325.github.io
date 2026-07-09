import appearanceSource from "./pages/appearance.json";

export type FontPreset = "serif" | "sans" | "rounded" | "custom";
export type SiteAppearanceCardVariant = "strong" | "soft" | "outline";

export type SiteAppearancePreviewCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  variant: SiteAppearanceCardVariant;
  widthUnits: number;
  minHeight: number;
};

export type SiteAppearance = {
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
  fontPreset: FontPreset;
  fontFamily: string;
  previewCards: SiteAppearancePreviewCard[];
  navigation: {
    height: number;
    maxWidth: number;
    paddingX: number;
    blur: number;
    linkGap: number;
  };
  musicPlayer: {
    cardPadding: number;
    coverSize: number;
    controlSize: number;
    primaryControlSize: number;
    floatingWidth: number;
    floatingHeight: number;
    floatingCoverSize: number;
  };
  lyricBar: {
    height: number;
    paddingX: number;
    radius: number;
    opacity: number;
    fontSize: number;
  };
  searchBar: {
    width: number;
    height: number;
    marginBottom: number;
    iconSize: number;
  };
  profileCard: {
    paddingX: number;
    paddingY: number;
    avatarSize: number;
    titleSize: number;
    minHeight: number;
    socialButtonSize: number;
  };
};

export const siteAppearanceDefaults: SiteAppearance = {
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
      description: "把零散线索先整理成可继续扩写的工作台。",
      meta: "笔记",
      actionLabel: "打开笔记",
      variant: "soft",
      widthUnits: 4,
      minHeight: 180,
    },
    {
      id: "status",
      eyebrow: "运行回廊",
      title: "资料岛仍在缓慢发光",
      description: "文稿、资料库、笔记和照片墙会继续向同一个归档系统汇流。",
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

const presetFonts: Record<FontPreset, string> = {
  serif: "\"Noto Serif SC\", \"Source Han Serif SC\", \"Songti SC\", serif",
  sans: "\"Noto Sans SC\", \"Source Han Sans SC\", \"Microsoft YaHei\", sans-serif",
  rounded: "\"M PLUS Rounded 1c\", \"Noto Sans SC\", \"Microsoft YaHei\", sans-serif",
  custom: siteAppearanceDefaults.fontFamily,
};

const toFiniteNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  Math.min(max, Math.max(min, toFiniteNumber(value, fallback)));

const toFontPreset = (value: unknown): FontPreset =>
  value === "sans" || value === "rounded" || value === "custom" ? value : "serif";

const toCardVariant = (value: unknown): SiteAppearanceCardVariant =>
  value === "soft" || value === "outline" ? value : "strong";

const normalizeFontFamily = (fontPreset: FontPreset, value: unknown) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return presetFonts[fontPreset];
};

const asRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const toString = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback);

const normalizePreviewCard = (value: unknown, index: number): SiteAppearancePreviewCard => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.previewCards[index] ?? siteAppearanceDefaults.previewCards[0];

  return {
    id: toString(source.id, fallback.id || `card-${index + 1}`),
    eyebrow: toString(source.eyebrow, fallback.eyebrow),
    title: toString(source.title, fallback.title),
    description: toString(source.description, fallback.description),
    meta: toString(source.meta, fallback.meta),
    actionLabel: toString(source.actionLabel, fallback.actionLabel),
    variant: toCardVariant(source.variant),
    widthUnits: Math.round(clamp(source.widthUnits, 3, 12, fallback.widthUnits)),
    minHeight: Math.round(clamp(source.minHeight, 120, 360, fallback.minHeight)),
  };
};

const normalizePreviewCards = (value: unknown): SiteAppearancePreviewCard[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return siteAppearanceDefaults.previewCards;
  }

  return value.map(normalizePreviewCard);
};

const normalizeNavigation = (value: unknown): SiteAppearance["navigation"] => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.navigation;

  return {
    height: Math.round(clamp(source.height, 46, 76, fallback.height)),
    maxWidth: Math.round(clamp(source.maxWidth, 880, 1320, fallback.maxWidth)),
    paddingX: Math.round(clamp(source.paddingX, 10, 30, fallback.paddingX)),
    blur: Math.round(clamp(source.blur, 8, 36, fallback.blur)),
    linkGap: Math.round(clamp(source.linkGap, 6, 24, fallback.linkGap)),
  };
};

const normalizeMusicPlayer = (value: unknown): SiteAppearance["musicPlayer"] => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.musicPlayer;

  return {
    cardPadding: Math.round(clamp(source.cardPadding, 18, 42, fallback.cardPadding)),
    coverSize: Math.round(clamp(source.coverSize, 72, 132, fallback.coverSize)),
    controlSize: Math.round(clamp(source.controlSize, 30, 52, fallback.controlSize)),
    primaryControlSize: Math.round(clamp(source.primaryControlSize, 40, 68, fallback.primaryControlSize)),
    floatingWidth: Math.round(clamp(source.floatingWidth, 280, 460, fallback.floatingWidth)),
    floatingHeight: Math.round(clamp(source.floatingHeight, 54, 92, fallback.floatingHeight)),
    floatingCoverSize: Math.round(clamp(source.floatingCoverSize, 52, 88, fallback.floatingCoverSize)),
  };
};

const normalizeLyricBar = (value: unknown): SiteAppearance["lyricBar"] => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.lyricBar;

  return {
    height: Math.round(clamp(source.height, 54, 104, fallback.height)),
    paddingX: Math.round(clamp(source.paddingX, 14, 44, fallback.paddingX)),
    radius: Math.round(clamp(source.radius, 14, 40, fallback.radius)),
    opacity: Number(clamp(source.opacity, 0.38, 0.96, fallback.opacity).toFixed(2)),
    fontSize: Math.round(clamp(source.fontSize, 13, 22, fallback.fontSize)),
  };
};

const normalizeSearchBar = (value: unknown): SiteAppearance["searchBar"] => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.searchBar;

  return {
    width: Math.round(clamp(source.width, 520, 820, fallback.width)),
    height: Math.round(clamp(source.height, 48, 76, fallback.height)),
    marginBottom: Math.round(clamp(source.marginBottom, 0, 44, fallback.marginBottom)),
    iconSize: Math.round(clamp(source.iconSize, 16, 30, fallback.iconSize)),
  };
};

const normalizeProfileCard = (value: unknown): SiteAppearance["profileCard"] => {
  const source = asRecord(value);
  const fallback = siteAppearanceDefaults.profileCard;

  return {
    paddingX: Math.round(clamp(source.paddingX, 18, 42, fallback.paddingX)),
    paddingY: Math.round(clamp(source.paddingY, 20, 46, fallback.paddingY)),
    avatarSize: Math.round(clamp(source.avatarSize, 96, 160, fallback.avatarSize)),
    titleSize: Math.round(clamp(source.titleSize, 40, 72, fallback.titleSize)),
    minHeight: Math.round(clamp(source.minHeight, 220, 380, fallback.minHeight)),
    socialButtonSize: Math.round(clamp(source.socialButtonSize, 36, 58, fallback.socialButtonSize)),
  };
};

export const normalizeSiteAppearance = (value: unknown): SiteAppearance => {
  const source = asRecord(value);
  const fontPreset = toFontPreset(source.fontPreset);

  return {
    panelOpacity: clamp(source.panelOpacity, 0.18, 0.9, siteAppearanceDefaults.panelOpacity),
    panelStrongOpacity: clamp(
      source.panelStrongOpacity,
      0.28,
      0.95,
      siteAppearanceDefaults.panelStrongOpacity
    ),
    panelSoftOpacity: clamp(source.panelSoftOpacity, 0.02, 0.28, siteAppearanceDefaults.panelSoftOpacity),
    backgroundVideoOpacity: clamp(
      source.backgroundVideoOpacity,
      0.18,
      0.9,
      siteAppearanceDefaults.backgroundVideoOpacity
    ),
    backgroundImageOpacity: clamp(
      source.backgroundImageOpacity,
      0.18,
      0.9,
      siteAppearanceDefaults.backgroundImageOpacity
    ),
    veilOpacity: clamp(source.veilOpacity, 0.35, 1, siteAppearanceDefaults.veilOpacity),
    pageGutterMin: clamp(source.pageGutterMin, 24, 84, siteAppearanceDefaults.pageGutterMin),
    pageGutterVw: clamp(source.pageGutterVw, 4, 12, siteAppearanceDefaults.pageGutterVw),
    pageGutterMax: clamp(source.pageGutterMax, 72, 180, siteAppearanceDefaults.pageGutterMax),
    maxWidth: clamp(source.maxWidth, 880, 1320, siteAppearanceDefaults.maxWidth),
    cardScale: clamp(source.cardScale, 0.86, 1.08, siteAppearanceDefaults.cardScale),
    radiusScale: clamp(source.radiusScale, 0.72, 1.18, siteAppearanceDefaults.radiusScale),
    fontPreset,
    fontFamily: normalizeFontFamily(fontPreset, source.fontFamily),
    previewCards: normalizePreviewCards(source.previewCards),
    navigation: normalizeNavigation(source.navigation),
    musicPlayer: normalizeMusicPlayer(source.musicPlayer),
    lyricBar: normalizeLyricBar(source.lyricBar),
    searchBar: normalizeSearchBar(source.searchBar),
    profileCard: normalizeProfileCard(source.profileCard),
  };
};

export const buildAppearanceStyle = (appearance: SiteAppearance) => {
  const radius = (base: number) => Math.round(base * appearance.radiusScale);

  return [
    `--panel-alpha: ${appearance.panelOpacity};`,
    `--panel-strong-alpha: ${appearance.panelStrongOpacity};`,
    `--panel-soft-alpha: ${appearance.panelSoftOpacity};`,
    `--bg-video-opacity: ${appearance.backgroundVideoOpacity};`,
    `--bg-image-opacity: ${appearance.backgroundImageOpacity};`,
    `--backdrop-veil-opacity: ${appearance.veilOpacity};`,
    `--card-scale: ${appearance.cardScale};`,
    `--radius-xl: ${radius(27)}px;`,
    `--radius-lg: ${radius(22)}px;`,
    `--radius-md: ${radius(18)}px;`,
    `--max-width: ${Math.round(appearance.maxWidth)}px;`,
    `--page-gutter: clamp(${Math.round(appearance.pageGutterMin)}px, ${appearance.pageGutterVw}vw, ${Math.round(
      appearance.pageGutterMax
    )}px);`,
    `--site-font-family: ${appearance.fontFamily};`,
    `--nav-height: ${appearance.navigation.height}px;`,
    `--nav-max-width: ${appearance.navigation.maxWidth}px;`,
    `--nav-padding-x: ${appearance.navigation.paddingX}px;`,
    `--nav-blur: ${appearance.navigation.blur}px;`,
    `--nav-link-gap: ${appearance.navigation.linkGap}px;`,
    `--home-player-padding: ${appearance.musicPlayer.cardPadding}px;`,
    `--home-player-cover-size: ${appearance.musicPlayer.coverSize}px;`,
    `--home-player-control-size: ${appearance.musicPlayer.controlSize}px;`,
    `--home-player-primary-control-size: ${appearance.musicPlayer.primaryControlSize}px;`,
    `--floating-player-width: ${appearance.musicPlayer.floatingWidth}px;`,
    `--floating-player-height: ${appearance.musicPlayer.floatingHeight}px;`,
    `--floating-player-cover-size: ${appearance.musicPlayer.floatingCoverSize}px;`,
    `--home-lyric-bar-height: ${appearance.lyricBar.height}px;`,
    `--home-lyric-bar-padding-x: ${appearance.lyricBar.paddingX}px;`,
    `--home-lyric-bar-radius: ${appearance.lyricBar.radius}px;`,
    `--home-lyric-bar-opacity: ${appearance.lyricBar.opacity};`,
    `--home-lyric-bar-font-size: ${appearance.lyricBar.fontSize}px;`,
    `--home-search-width: ${appearance.searchBar.width}px;`,
    `--home-search-height: ${appearance.searchBar.height}px;`,
    `--home-search-margin-bottom: ${appearance.searchBar.marginBottom}px;`,
    `--home-search-icon-size: ${appearance.searchBar.iconSize}px;`,
    `--home-profile-padding-x: ${appearance.profileCard.paddingX}px;`,
    `--home-profile-padding-y: ${appearance.profileCard.paddingY}px;`,
    `--home-profile-avatar-size: ${appearance.profileCard.avatarSize}px;`,
    `--home-profile-title-size: ${appearance.profileCard.titleSize}px;`,
    `--home-profile-min-height: ${appearance.profileCard.minHeight}px;`,
    `--home-profile-social-button-size: ${appearance.profileCard.socialButtonSize}px;`,
  ].join("");
};

export const siteAppearance = normalizeSiteAppearance(appearanceSource);
