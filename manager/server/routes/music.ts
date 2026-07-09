import type { Express, Request, Response } from "express";
import {
  buildCloudMusicRequestUrl,
  buildFallbackCloudTrack,
  hydrateCloudTrackLyrics,
  normalizeCloudTrack
} from "../../../src/lib/music-cloud";
import type { MusicTrackDraft } from "../../src/types";

type CloudRecord = Record<string, unknown>;

const DEFAULT_API_BASE_URL = "https://api.injahow.cn/meting/";
const DEFAULT_FALLBACK_COVER = "/uploads/ui/music-cover-fallback.jpg";

const firstRecord = (payload: unknown): CloudRecord | null => {
  if (Array.isArray(payload)) {
    const row = payload[0];
    return row && typeof row === "object" ? (row as CloudRecord) : null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as CloudRecord;
  if (Array.isArray(record.data)) {
    const row = record.data[0];
    return row && typeof row === "object" ? (row as CloudRecord) : null;
  }

  return record;
};

const pickString = (record: CloudRecord | null, keys: string[]) => {
  if (!record) {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const fetchText = async (url: string, signal: AbortSignal) => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`歌词请求失败：${response.status}`);
  }
  return response.text();
};

const looksLikeRemoteUrl = (value: string) => /^https?:\/\//i.test(value);

export const registerMusicRoutes = (app: Express) => {
  app.get("/api/music-cloud/track", async (req: Request, res: Response) => {
    try {
      const id = String(req.query.id ?? "").trim();
      if (!/^\d+$/.test(id)) {
        res.status(400).json({ error: "id must be a numeric NetEase song id." });
        return;
      }

      const apiBaseUrl = process.env.MUSIC_CLOUD_API_BASE_URL ?? DEFAULT_API_BASE_URL;
      const fallbackCover = String(req.query.fallbackCover ?? process.env.MUSIC_FALLBACK_COVER ?? DEFAULT_FALLBACK_COVER);
      const signal = AbortSignal.timeout(12000);
      const url = buildCloudMusicRequestUrl({
        apiBaseUrl,
        server: "netease",
        type: "song",
        id
      });

      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`歌曲信息请求失败：${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      const record = firstRecord(payload);
      const fallbackTrack = buildFallbackCloudTrack(id, fallbackCover);
      const normalized = normalizeCloudTrack(payload, fallbackCover) ?? fallbackTrack;
      const hydrated = await hydrateCloudTrackLyrics(normalized, { signal }).catch(() => normalized);
      const lrcSource = pickString(record, ["lrc", "lyric"]);
      const lrc = looksLikeRemoteUrl(lrcSource) ? await fetchText(lrcSource, signal).catch(() => "") : lrcSource;

      const track: MusicTrackDraft = {
        id,
        title: hydrated.title,
        artist: hydrated.artist,
        coverUrl: hydrated.coverUrl,
        audioUrl: hydrated.audioUrl,
        lrc,
        duration: hydrated.duration,
        album: hydrated.album
      };

      res.json({ track });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};
