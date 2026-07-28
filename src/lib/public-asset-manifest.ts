import type { PublicAssetCollectionConfig } from "../config/public-assets";

export type PublicAssetManifestEntry = {
  path: string;
  bytes: number;
  sha256: string;
  mime: string;
  kind: string;
  sourceId: string;
  public: true;
  width?: number;
  height?: number;
};

export type PublicAssetManifest = {
  schemaVersion: string;
  collection: string;
  snapshotId: string;
  generatedAt: string;
  files: PublicAssetManifestEntry[];
  filesByPath: ReadonlyMap<string, PublicAssetManifestEntry>;
};

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isSafeRelativePath = (path: string) =>
  !path.startsWith("/") &&
  !path.includes("\\") &&
  !path.split("/").includes("..") &&
  !/^[a-zA-Z]:/.test(path) &&
  !/^https?:/i.test(path);

const isAllowedPath = (config: PublicAssetCollectionConfig, path: string) =>
  config.allowedPaths.some((pattern) => pattern.test(path));

export const parsePublicAssetManifest = (
  value: unknown,
  config: PublicAssetCollectionConfig,
): PublicAssetManifest => {
  if (!config.enabled) throw new Error("Public asset collection is disabled");
  if (!isRecord(value)) throw new Error("Invalid public asset manifest");
  if (value.schemaVersion !== config.manifestSchemaVersion) {
    throw new Error("Unexpected public asset manifest schema");
  }
  if (value.collection !== config.collection) {
    throw new Error("Unexpected public asset collection");
  }
  if (!isNonEmptyString(value.snapshotId)) {
    throw new Error("Public asset manifest requires a snapshot id");
  }
  if (!isNonEmptyString(value.generatedAt) || !Array.isArray(value.files)) {
    throw new Error("Invalid public asset manifest metadata");
  }

  const files = value.files.map((entry, index): PublicAssetManifestEntry => {
    if (!isRecord(entry)) throw new Error(`Invalid public manifest entry ${index}`);
    if (!isNonEmptyString(entry.path) || !isSafeRelativePath(entry.path)) {
      throw new Error(`Invalid public manifest path at entry ${index}`);
    }
    if (!isAllowedPath(config, entry.path)) {
      throw new Error(`Unapproved public manifest path at entry ${index}`);
    }
    if (entry.public !== true) throw new Error(`Non-public manifest entry ${index}`);
    if (
      typeof entry.bytes !== "number" ||
      entry.bytes < 0 ||
      !isNonEmptyString(entry.sha256) ||
      !/^[0-9a-f]{64}$/i.test(entry.sha256) ||
      !isNonEmptyString(entry.mime) ||
      !isNonEmptyString(entry.kind) ||
      !isNonEmptyString(entry.sourceId)
    ) {
      throw new Error(`Invalid public manifest entry metadata ${index}`);
    }

    return {
      path: entry.path,
      bytes: entry.bytes,
      sha256: entry.sha256.toLowerCase(),
      mime: entry.mime,
      kind: entry.kind,
      sourceId: entry.sourceId,
      public: true,
      ...(typeof entry.width === "number" ? { width: entry.width } : {}),
      ...(typeof entry.height === "number" ? { height: entry.height } : {}),
    };
  });
  const filesByPath = new Map<string, PublicAssetManifestEntry>();
  for (const file of files) {
    if (filesByPath.has(file.path)) throw new Error(`Duplicate public manifest path: ${file.path}`);
    filesByPath.set(file.path, file);
  }

  return {
    schemaVersion: value.schemaVersion,
    collection: value.collection,
    snapshotId: value.snapshotId,
    generatedAt: value.generatedAt,
    files,
    filesByPath,
  };
};

export const resolvePublicAssetUrl = (
  config: PublicAssetCollectionConfig,
  manifest: PublicAssetManifest,
  path: string,
) => {
  if (!config.enabled || !isSafeRelativePath(path) || !isAllowedPath(config, path)) {
    throw new Error("Unapproved public asset path");
  }
  if (!manifest.filesByPath.has(path)) {
    throw new Error("Path is not present in the public manifest");
  }

  const base = new URL(config.baseUrl);
  if (base.protocol !== "https:" || !base.pathname.endsWith("/")) {
    throw new Error("Invalid public asset base URL");
  }
  const resolved = new URL(path, base);
  if (resolved.origin !== base.origin || !resolved.pathname.startsWith(base.pathname)) {
    throw new Error("Resolved public asset URL escaped its collection");
  }
  return resolved.toString();
};
