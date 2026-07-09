import type {
  AssetItem,
  AssetListResponse,
  BirthdayAvatarCrop,
  BirthdayCharacterDraft,
  BirthdayDataResponse,
  BirthdayImageKind,
  BirthdayImageResult,
  BirthdayWorkDraft,
  ContentEntry,
  ContentKind,
  ContentListResponse,
  PageConfigFile,
  PageConfigName,
  SaveContentPayload,
  SystemCommandResult,
  SystemStatus
} from "./types";

const request = async <T>(path: string) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
};

const postJson = async <T>(path: string, body: Record<string, unknown>) => {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};

export const getSystemStatus = () => request<SystemStatus>("/api/system");

export const getContentList = async (kind: ContentKind) => {
  const response = await request<ContentListResponse>(`/api/content?kind=${kind}`);
  return response.items;
};

export const getContentEntry = (kind: ContentKind, slug: string) =>
  request<ContentEntry>(`/api/content/entry?kind=${kind}&slug=${encodeURIComponent(slug)}`);

export const saveContentEntry = async (payload: SaveContentPayload) => {
  const response = await fetch("/api/content/save", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ContentEntry;
};

export const getPageConfig = (name: PageConfigName) =>
  request<PageConfigFile>(`/api/content/page-config?name=${name}`);

export const savePageConfig = async (name: PageConfigName, json: string) => {
  const response = await fetch("/api/content/page-config/save", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ name, json })
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as PageConfigFile;
};

export const getAssets = async () => {
  const response = await request<AssetListResponse>("/api/assets");
  return response.items;
};

export const copyAsset = async (sourcePath: string, targetDir?: string) => {
  const response = await fetch("/api/assets/copy", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ sourcePath, targetDir })
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return ((await response.json()) as { item: AssetItem }).item;
};

export const getBirthdayData = () => request<BirthdayDataResponse>("/api/birthdays");

export const saveBirthdayWork = (payload: BirthdayWorkDraft) =>
  postJson<BirthdayDataResponse>("/api/birthdays/work/save", payload);

export const deleteBirthdayWork = (id: string) =>
  postJson<BirthdayDataResponse>("/api/birthdays/work/delete", { id });

export const saveBirthdayCharacter = (payload: BirthdayCharacterDraft) =>
  postJson<BirthdayDataResponse>("/api/birthdays/character/save", payload);

export const deleteBirthdayCharacter = (id: string) =>
  postJson<BirthdayDataResponse>("/api/birthdays/character/delete", { id });

export const copyBirthdayImage = (
  sourcePath: string,
  workId: string,
  characterId: string,
  kind: BirthdayImageKind
) =>
  postJson<BirthdayImageResult>("/api/birthdays/image/copy", {
    sourcePath,
    workId,
    characterId,
    kind
  });

export const uploadBirthdayImage = (
  dataUrl: string,
  workId: string,
  characterId: string,
  kind: BirthdayImageKind
) =>
  postJson<BirthdayImageResult>("/api/birthdays/image/upload", {
    dataUrl,
    workId,
    characterId,
    kind
  });

export const cropBirthdayAvatar = (
  sourceUrl: string,
  workId: string,
  characterId: string,
  crop: BirthdayAvatarCrop
) =>
  postJson<BirthdayImageResult>("/api/birthdays/avatar/crop", {
    sourceUrl,
    workId,
    characterId,
    crop
  });

const runSystemAction = async (path: string, body?: Record<string, unknown>) => {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: body
      ? {
          "content-type": "application/json"
        }
      : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  return (await response.json()) as SystemCommandResult;
};

export const runValidate = () => runSystemAction("/api/system/validate", {});

export const runBuild = () => runSystemAction("/api/system/build", {});

export const runCheck = () => runSystemAction("/api/system/check", {});

export const getGitStatus = () => runSystemAction("/api/system/git-status");

export const commitAllChanges = (message: string) =>
  runSystemAction("/api/system/commit", { message });
