import type {
  AssetItem,
  AssetImageCrop,
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
  ImageHostStatus,
  MusicTrackDraft,
  PageConfigFile,
  PageConfigName,
  SaveContentPayload,
  SystemCommandResult,
  SystemStatus
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const isErrorPayload = (payload: unknown): payload is { error: string } =>
  typeof payload === "object" &&
  payload !== null &&
  "error" in payload &&
  typeof (payload as { error?: unknown }).error === "string";

const readResponse = async <T>(response: Response) => {
  const payload = (await response.json().catch(() => undefined)) as
    | { error?: unknown }
    | T
    | undefined;

  if (!response.ok) {
    const serverMessage = isErrorPayload(payload)
      ? payload.error
      : `${response.status} ${response.statusText}`;
    throw new ApiError(response.status, `Request failed: ${serverMessage}`);
  }

  return payload as T;
};

const request = async <T>(path: string) => {
  const response = await fetch(path);
  return readResponse<T>(response);
};

const postJson = async <T>(path: string, body: Record<string, unknown>) => {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return readResponse<T>(response);
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

  return readResponse<ContentEntry>(response);
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

  return readResponse<PageConfigFile>(response);
};

export const getAssets = async () => {
  const response = await request<AssetListResponse>("/api/assets");
  return response.items;
};

export const getImageHostStatus = () => request<ImageHostStatus>("/api/image-host/status");

export const copyAsset = async (sourcePath: string, targetDir?: string) => {
  const response = await fetch("/api/assets/copy", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ sourcePath, targetDir })
  });

  return (await readResponse<{ item: AssetItem }>(response)).item;
};

export const uploadAssetImage = async (dataUrl: string, targetDir: string, filename: string) => {
  const response = await postJson<{ item: AssetItem }>("/api/assets/image/upload", {
    dataUrl,
    targetDir,
    filename
  });
  return response.item;
};

export const cropAssetImage = async (
  sourceUrl: string,
  targetDir: string,
  filename: string,
  crop: AssetImageCrop,
  outputWidth: number,
  outputHeight: number
) => {
  const response = await postJson<{ item: AssetItem }>("/api/assets/image/crop", {
    sourceUrl,
    targetDir,
    filename,
    crop,
    outputWidth,
    outputHeight
  });
  return response.item;
};

export const fetchCloudMusicTrack = async (id: string, fallbackCover?: string) => {
  const params = new URLSearchParams({ id });
  if (fallbackCover) {
    params.set("fallbackCover", fallbackCover);
  }
  const response = await request<{ track: MusicTrackDraft }>(`/api/music-cloud/track?${params.toString()}`);
  return response.track;
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
