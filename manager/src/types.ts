export type ContentKind =
  | "articles"
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

export type PageConfigName = "home" | "references";

export type PageConfigFile = {
  name: PageConfigName;
  path: string;
  json: string;
};

export type AssetItem = {
  path: string;
  url: string;
  size: number;
};

export type AssetListResponse = {
  items: AssetItem[];
};

export type SystemCommandResult = {
  ok: boolean;
  command?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
};

export type SystemStatus = {
  ok: boolean;
  repoRoot: string;
  contentRoot: string;
  contentKinds: ContentKind[];
};
