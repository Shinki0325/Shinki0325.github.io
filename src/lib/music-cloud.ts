export type CloudMusicConfig = {
  apiBaseUrl: string;
  server: string;
  type: string;
  id: string;
};

export type LyricLine = {
  time: number;
  text: string;
};

export type CloudTrack = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  lyrics: LyricLine[];
  lyricsUrl: string | null;
  duration: number | null;
  album: string | null;
};

type CloudRecord = Record<string, unknown>;

const UNKNOWN_TITLE = "未命名曲目";
const UNKNOWN_ARTIST = "未知歌手";

export function buildCloudMusicRequestUrl(config: CloudMusicConfig): string {
  const normalizedBase = config.apiBaseUrl.endsWith("/")
    ? config.apiBaseUrl
    : `${config.apiBaseUrl}/`;
  const separator = normalizedBase.includes("?") ? "&" : "?";

  return (
    `${normalizedBase}${separator}` +
    `server=${encodeURIComponent(config.server)}` +
    `&type=${encodeURIComponent(config.type)}` +
    `&id=${encodeURIComponent(config.id)}` +
    "&r=format=json"
  );
}

export function parseLrc(text: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const matches = [...rawLine.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{1,3}))?\]/g)];

    if (matches.length === 0) {
      continue;
    }

    const lyric = rawLine.replace(/\[(\d{2,}):(\d{2})(?:\.(\d{1,3}))?\]/g, "").trim();
    if (!lyric) {
      continue;
    }

    for (const match of matches) {
      const minutes = Number(match[1] ?? 0);
      const seconds = Number(match[2] ?? 0);
      const fraction = match[3] ?? "";
      const fractionScale = fraction.length === 3 ? 1000 : fraction.length === 0 ? 1 : 100;
      const time = minutes * 60 + seconds + Number(fraction || 0) / fractionScale;

      lines.push({ time, text: lyric });
    }
  }

  return lines.sort((left, right) => left.time - right.time);
}

function firstRecord(payload: unknown): CloudRecord | null {
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
}

function pickString(record: CloudRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNumber(record: CloudRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function looksLikeRemoteLyricUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export async function hydrateCloudTrackLyrics(
  track: CloudTrack,
  options?: {
    fetch?: typeof fetch;
    signal?: AbortSignal;
  }
): Promise<CloudTrack> {
  if (track.lyrics.length > 0 || !track.lyricsUrl) {
    return track;
  }

  const fetchImpl = options?.fetch ?? fetch;
  const response = await fetchImpl(track.lyricsUrl, {
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`歌词请求失败：${response.status}`);
  }

  const text = await response.text();

  return {
    ...track,
    lyrics: parseLrc(text),
  };
}

export function normalizeCloudTrack(
  payload: unknown,
  fallbackCover: string
): CloudTrack | null {
  const record = firstRecord(payload);
  if (!record) {
    return null;
  }

  const audioUrl = pickString(record, ["url", "src"]);
  if (!audioUrl) {
    return null;
  }

  const coverUrl = pickString(record, ["pic", "cover", "poster"], fallbackCover) || fallbackCover;
  const lyricSource = pickString(record, ["lrc", "lyric"]);
  const lyricsUrl = looksLikeRemoteLyricUrl(lyricSource) ? lyricSource : null;

  return {
    id: pickString(record, ["id"], audioUrl),
    title: pickString(record, ["title", "name"], UNKNOWN_TITLE),
    artist: pickString(record, ["artist", "author"], UNKNOWN_ARTIST),
    audioUrl,
    coverUrl,
    lyrics: lyricsUrl ? [] : parseLrc(lyricSource),
    lyricsUrl,
    duration: pickNumber(record, ["duration", "length"]),
    album: pickString(record, ["album"], "") || null,
  };
}
