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
  backgroundImageText: string;
  musicTracksJson: string;
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

const asStringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const linesToText = (value: unknown) => asStringList(value).join("\n");

const textToLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const musicTracksToJson = (music: HomePageConfigRecord) => {
  if (Array.isArray(music.tracks)) {
    return JSON.stringify(music.tracks, null, 2);
  }

  return JSON.stringify(
    asStringList(music.cloudMusicIds).map((id) => ({
      id,
      title: `网易云歌曲 ${id}`,
      artist: "网易云音乐",
      coverUrl: asString(music.fallbackCover),
      audioUrl: `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`,
      lrc: ""
    })),
    null,
    2
  );
};

const parseMusicTracks = (value: string) => {
  const parsed = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error("音乐曲库必须是数组 JSON。");
  }

  return parsed;
};

export const parseHomePageConfig = (json: string): ParsedHomePageConfig => {
  const source = asRecord(JSON.parse(json));
  const brand = asRecord(source.brand);
  const hero = asRecord(source.hero);
  const profile = asRecord(source.profile);
  const social = asRecord(source.social);
  const search = asRecord(source.search);
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
      backgroundImageText: linesToText(source.backgroundImages),
      musicTracksJson: musicTracksToJson(music),
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
      backgroundImages: textToLines(form.backgroundImageText),
      music: {
        ...musicSource,
        tracks: parseMusicTracks(form.musicTracksJson),
        fallbackCover: form.fallbackCover,
        idleLyric: form.idleLyric
      }
    },
    null,
    2
  );
};
