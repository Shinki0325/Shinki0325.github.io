import {
  birthdayPublicAssets,
  type PublicAssetCollectionConfig,
} from "../config/public-assets";
import type {
  BirthdayDate,
  BirthdayDisplayCharacter,
  BirthdayDisplayWork,
} from "./birthday-calendar-data";
import {
  parsePublicAssetManifest,
  resolvePublicAssetUrl,
  type PublicAssetManifest,
} from "./public-asset-manifest";

export type BirthdayDataset = {
  schemaVersion: "character-birthday-summary-v1" | "character-birthday-month-v1";
  snapshotId: string;
  month: string;
  works: BirthdayDisplayWork[];
  characters: BirthdayDisplayCharacter[];
};

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonRecord = Record<string, unknown>;

const defaultFetcher: Fetcher = (input, init) => globalThis.fetch(input, init);

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
const isMonth = (value: unknown): value is string =>
  isString(value) && /^(?:0[1-9]|1[0-2])$/.test(value);
const isBirthdayDate = (value: unknown): value is BirthdayDate =>
  isString(value) && /^(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(value);

export const sha256Hex = async (value: Uint8Array) => {
  const bytes = new Uint8Array(value.byteLength);
  bytes.set(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const readJson = async (response: Response) => {
  if (!response.ok) throw new Error("Public birthday data request failed");
  return response.json() as Promise<unknown>;
};

export class BirthdayDataClient {
  private manifestPromise: Promise<PublicAssetManifest> | null = null;
  private summaryPromise: Promise<BirthdayDataset> | null = null;
  private readonly monthCache = new Map<string, BirthdayDataset>();
  private readonly monthPromises = new Map<string, Promise<BirthdayDataset>>();

  constructor(
    private readonly config: PublicAssetCollectionConfig = birthdayPublicAssets,
    private readonly fetcher: Fetcher = defaultFetcher,
  ) {}

  private loadManifest() {
    if (this.manifestPromise) return this.manifestPromise;
    this.manifestPromise = (async () => {
      if (!this.config.enabled || !this.config.manifestSha256) {
        throw new Error("Birthday public collection is not enabled");
      }
      const response = await this.fetcher(new URL(this.config.manifestPath, this.config.baseUrl));
      if (!response.ok) throw new Error("Birthday public manifest request failed");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const digest = await sha256Hex(bytes);
      if (digest !== this.config.manifestSha256.toLowerCase()) {
        throw new Error("Birthday public manifest hash mismatch");
      }
      const value = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
      return parsePublicAssetManifest(value, this.config);
    })().catch((error) => {
      this.manifestPromise = null;
      throw error;
    });
    return this.manifestPromise;
  }

  private async loadDataset(
    path: string,
    schemaVersion: BirthdayDataset["schemaVersion"],
    expectedMonth?: string,
  ) {
    const manifest = await this.loadManifest();
    const url = resolvePublicAssetUrl(this.config, manifest, path);
    const value = await readJson(await this.fetcher(url));
    if (!isRecord(value)) throw new Error("Invalid public birthday dataset");
    if (value.schemaVersion !== schemaVersion || value.snapshotId !== manifest.snapshotId) {
      throw new Error("Public birthday dataset snapshot or schema mismatch");
    }
    if (!isMonth(value.month) || (expectedMonth && value.month !== expectedMonth)) {
      throw new Error("Public birthday dataset month mismatch");
    }
    if (!Array.isArray(value.works) || !Array.isArray(value.characters)) {
      throw new Error("Invalid public birthday dataset collections");
    }

    const works = value.works.map((entry, index): BirthdayDisplayWork => {
      if (!isRecord(entry) || !isNonEmptyString(entry.id) || !isNonEmptyString(entry.title)) {
        throw new Error(`Invalid public birthday work ${index}`);
      }
      return {
        id: entry.id,
        title: entry.title,
        ...(isNonEmptyString(entry.localizedTitle)
          ? { localizedTitle: entry.localizedTitle }
          : {}),
      };
    });
    const workIds = new Set(works.map((work) => work.id));
    const characters = value.characters.map((entry, index): BirthdayDisplayCharacter => {
      if (
        !isRecord(entry) ||
        !isNonEmptyString(entry.id) ||
        !isNonEmptyString(entry.name) ||
        !isNonEmptyString(entry.workId) ||
        !workIds.has(entry.workId) ||
        !isBirthdayDate(entry.birthday) ||
        !entry.birthday.startsWith(`${value.month}-`) ||
        (entry.gender !== "female" && entry.gender !== "male") ||
        !(entry.avatar === null || isNonEmptyString(entry.avatar))
      ) {
        throw new Error(`Invalid public birthday character ${index}`);
      }
      return {
        id: entry.id,
        name: entry.name,
        workId: entry.workId,
        birthday: entry.birthday,
        gender: entry.gender,
        avatar:
          entry.avatar === null
            ? null
            : resolvePublicAssetUrl(this.config, manifest, entry.avatar),
        ...(isNonEmptyString(entry.reading) ? { reading: entry.reading } : {}),
      };
    });

    return {
      schemaVersion,
      snapshotId: manifest.snapshotId,
      month: value.month,
      works,
      characters,
    };
  }

  loadSummary() {
    if (this.summaryPromise) return this.summaryPromise;
    this.summaryPromise = this.loadDataset(
      "birthdays/v1/summary.json",
      "character-birthday-summary-v1",
    ).catch((error) => {
      this.summaryPromise = null;
      throw error;
    });
    return this.summaryPromise;
  }

  async loadMonth(month: string, snapshotId: string) {
    if (!isMonth(month)) throw new Error("Invalid birthday month");
    const manifest = await this.loadManifest();
    if (manifest.snapshotId !== snapshotId) {
      throw new Error("Birthday month snapshot mismatch");
    }
    const key = `${snapshotId}:${month}`;
    const cached = this.monthCache.get(key);
    if (cached) return cached;
    const pending = this.monthPromises.get(key);
    if (pending) return pending;

    const request = this.loadDataset(
      `birthdays/v1/months/${month}.json`,
      "character-birthday-month-v1",
      month,
    )
      .then((dataset) => {
        this.monthCache.set(key, dataset);
        return dataset;
      })
      .finally(() => this.monthPromises.delete(key));
    this.monthPromises.set(key, request);
    return request;
  }
}

export const birthdayDataClient = new BirthdayDataClient();
