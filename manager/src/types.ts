export type ContentKind =
  | "articles"
  | "albums"
  | "references"
  | "drafts"
  | "notes"
  | "topics"
  | "vault";

export type ContentListItem = {
  kind: ContentKind;
  slug: string;
  title: string;
  summary?: string;
  date?: string;
  draft: boolean;
  visibility?: string;
  path: string;
};

export type ContentEntry = {
  kind: ContentKind;
  slug: string;
  frontmatter: Record<string, unknown>;
  body: string;
  path: string;
};

export type ContentListResponse = {
  kind: ContentKind;
  items: ContentListItem[];
};

export type SaveContentPayload = {
  kind: ContentKind;
  slug: string;
  frontmatter: Record<string, unknown>;
  body: string;
};

export type PageConfigName = "home" | "references" | "appearance";

export type PageConfigFile = {
  name: PageConfigName;
  path: string;
  json: string;
};

export type AssetItem = {
  path: string;
  url: string;
  size: number;
  originalUrl?: string;
};

export type ImageHostStatus = {
  enabled: boolean;
  provider: string;
  publicBaseUrl: string;
  bucket: string;
};

export type AssetListResponse = {
  items: AssetItem[];
};

export type AssetImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MusicTrackDraft = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  lrc: string;
  duration?: number | null;
  album?: string | null;
};

export type BirthdayVerificationStatus = "verified" | "todo";

export type BirthdayDate = `${number}${number}-${number}${number}`;

export type BirthdayImageKind = "avatar" | "image";

export type BirthdayGender = "female" | "male";

export type BirthdayWorkDraft = {
  id: string;
  title: string;
  localizedTitle?: string;
  sourceUrl: string;
};

export type BirthdayCharacterDraft = {
  id: string;
  name: string;
  workId: string;
  birthday: BirthdayDate;
  gender: BirthdayGender;
  avatar: string | null;
  image?: string | null;
  sourceUrl: string;
  sourceId?: string;
  bangumiId?: string;
  reading?: string;
  verificationStatus: BirthdayVerificationStatus;
};

export type BirthdayDataFile = {
  works: BirthdayWorkDraft[];
  characters: BirthdayCharacterDraft[];
};

export type BirthdayStats = {
  works: number;
  characters: number;
  missingAvatar: number;
  missingImage: number;
  todo: number;
  characterCountByWork?: Record<string, number>;
};

export type BirthdayDataResponse = BirthdayDataFile & {
  stats: BirthdayStats;
};

export type BirthdayImageResult = {
  path: string;
  url: string;
  size: number;
};

export type BirthdayAvatarCrop = {
  x: number;
  y: number;
  size: number;
};

export type SystemCommandResult = {
  ok: boolean;
  command?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
  previewUrl?: string;
};

export type SystemStatus = {
  ok: boolean;
  repoRoot: string;
  contentRoot: string;
  contentKinds: ContentKind[];
};
