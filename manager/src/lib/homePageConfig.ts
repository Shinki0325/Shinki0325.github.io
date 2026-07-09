export type MusicTrackForm = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  lrc: string;
  duration?: number | null;
  album?: string | null;
};

export type HomePageConfigForm = {
  brandTitle: string;
  brandSuffix: string;
  brandAfter: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  profileDisplayName: string;
  profileBio: string;
  profileAvatarUrl: string;
  socialGithub: string;
  socialBilibili: string;
  socialEmail: string;
  searchPlaceholder: string;
  announcementText: string;
  homeBackgroundEnabled: boolean;
  homeBackgroundVideoSrc: string;
  homeBackgroundPoster: string;
  backgroundImageText: string;
  musicTracks: MusicTrackForm[];
  fallbackCover: string;
  idleLyric: string;
};

type HomePageConfigRecord = Record<string, unknown>;

export type ParsedHomePageConfig = {
  source: HomePageConfigRecord;
  form: HomePageConfigForm;
};

const asRecord = (value: unknown): HomePageConfigRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as HomePageConfigRecord) : {};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

const asNullableNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const asStringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const linesToText = (value: unknown) => asStringList(value).join("\n");

const textToLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const normalizeMusicTrack = (track: unknown): MusicTrackForm => {
  const record = asRecord(track);
  return {
    id: asString(record.id),
    title: asString(record.title),
    artist: asString(record.artist),
    coverUrl: asString(record.coverUrl),
    audioUrl: asString(record.audioUrl),
    lrc: asString(record.lrc),
    duration: asNullableNumber(record.duration),
    album: asString(record.album) || null
  };
};

const musicTracksToForm = (music: HomePageConfigRecord): MusicTrackForm[] => {
  if (Array.isArray(music.tracks)) {
    return music.tracks.map(normalizeMusicTrack);
  }

  return asStringList(music.cloudMusicIds).map((id) => ({
      id,
      title: `网易云歌曲 ${id}`,
      artist: "网易云音乐",
      coverUrl: asString(music.fallbackCover),
      audioUrl: `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`,
      lrc: ""
  }));
};

export const parseHomePageConfig = (json: string): ParsedHomePageConfig => {
  const source = asRecord(JSON.parse(json));
  const brand = asRecord(source.brand);
  const hero = asRecord(source.hero);
  const profile = asRecord(source.profile);
  const social = asRecord(source.social);
  const search = asRecord(source.search);
  const homeBackground = asRecord(source.homeBackground);
  const music = asRecord(source.music);

  return {
    source,
    form: {
      brandTitle: asString(brand.title),
      brandSuffix: asString(brand.suffix),
      brandAfter: asString(brand.after),
      heroEyebrow: asString(hero.eyebrow),
      heroTitle: asString(hero.title),
      heroDescription: asString(hero.description),
      profileDisplayName: asString(profile.displayName),
      profileBio: asString(profile.bio),
      profileAvatarUrl: asString(profile.avatarUrl),
      socialGithub: asString(social.github),
      socialBilibili: asString(social.bilibili),
      socialEmail: asString(social.email),
      searchPlaceholder: asString(search.placeholder),
      announcementText: linesToText(source.announcements),
      homeBackgroundEnabled: asBoolean(homeBackground.enabled, true),
      homeBackgroundVideoSrc: asString(homeBackground.videoSrc) || "/uploads/backgrounds/home-loop-h264.mp4",
      homeBackgroundPoster: asString(homeBackground.poster) || "/uploads/backgrounds/home-loop-poster.jpg",
      backgroundImageText: linesToText(source.backgroundImages),
      musicTracks: musicTracksToForm(music),
      fallbackCover: asString(music.fallbackCover),
      idleLyric: asString(music.idleLyric)
    }
  };
};

export const serializeHomePageConfig = (source: HomePageConfigRecord, form: HomePageConfigForm) => {
  const {
    cloudMusicIds: _cloudMusicIds,
    apiBaseUrl: _apiBaseUrl,
    server: _server,
    type: _type,
    ...musicSource
  } = asRecord(source.music);

  return JSON.stringify(
    {
      ...source,
      brand: {
        ...asRecord(source.brand),
        title: form.brandTitle,
        suffix: form.brandSuffix,
        after: form.brandAfter
      },
      hero: {
        ...asRecord(source.hero),
        eyebrow: form.heroEyebrow,
        title: form.heroTitle,
        description: form.heroDescription
      },
      profile: {
        ...asRecord(source.profile),
        displayName: form.profileDisplayName,
        bio: form.profileBio,
        avatarUrl: form.profileAvatarUrl
      },
      social: {
        ...asRecord(source.social),
        github: form.socialGithub,
        bilibili: form.socialBilibili,
        email: form.socialEmail
      },
      search: {
        ...asRecord(source.search),
        placeholder: form.searchPlaceholder
      },
      announcements: textToLines(form.announcementText),
      homeBackground: {
        ...asRecord(source.homeBackground),
        enabled: form.homeBackgroundEnabled,
        videoSrc: form.homeBackgroundVideoSrc,
        poster: form.homeBackgroundPoster
      },
      backgroundImages: textToLines(form.backgroundImageText),
      music: {
        ...musicSource,
        tracks: form.musicTracks,
        fallbackCover: form.fallbackCover,
        idleLyric: form.idleLyric
      }
    },
    null,
    2
  );
};
