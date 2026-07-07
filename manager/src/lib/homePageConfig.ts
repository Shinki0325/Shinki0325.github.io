export type HomePageConfigForm = {
  brandTitle: string;
  brandSuffix: string;
  brandAfter: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  announcementText: string;
  backgroundImageText: string;
  cloudMusicIdsText: string;
  apiBaseUrl: string;
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

export const parseHomePageConfig = (json: string): ParsedHomePageConfig => {
  const source = asRecord(JSON.parse(json));
  const brand = asRecord(source.brand);
  const hero = asRecord(source.hero);
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
      announcementText: linesToText(source.announcements),
      backgroundImageText: linesToText(source.backgroundImages),
      cloudMusicIdsText: linesToText(music.cloudMusicIds),
      apiBaseUrl: asString(music.apiBaseUrl),
      fallbackCover: asString(music.fallbackCover),
      idleLyric: asString(music.idleLyric)
    }
  };
};

export const serializeHomePageConfig = (source: HomePageConfigRecord, form: HomePageConfigForm) =>
  JSON.stringify(
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
      announcements: textToLines(form.announcementText),
      backgroundImages: textToLines(form.backgroundImageText),
      music: {
        ...asRecord(source.music),
        cloudMusicIds: textToLines(form.cloudMusicIdsText),
        apiBaseUrl: form.apiBaseUrl,
        fallbackCover: form.fallbackCover,
        idleLyric: form.idleLyric
      }
    },
    null,
    2
  );
