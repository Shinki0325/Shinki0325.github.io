import type {
  AssetItem,
  AssetListResponse,
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
