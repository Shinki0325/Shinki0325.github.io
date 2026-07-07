const PUBLIC_COLLECTIONS = new Set(["articles", "notes", "topics", "references"]);

export const isPublicCollection = (collection: string) =>
  PUBLIC_COLLECTIONS.has(collection);

export const publicContentGlob = [
  "src/content/articles/**/*",
  "src/content/notes/**/*",
  "src/content/topics/**/*",
  "src/content/references/**/*"
];

type EntryWithDraft = {
  data: {
    draft?: boolean;
  };
};

type EntryWithDate = {
  data: {
    date: Date;
  };
};

type EntryWithTags = EntryWithDraft & {
  data: {
    tags?: string[];
  };
};

export const isPublishedEntry = <T extends EntryWithDraft>(entry: T) =>
  entry.data.draft !== true;

export const filterPublishedEntries = <T extends EntryWithDraft>(entries: T[]) =>
  entries.filter(isPublishedEntry);

export const compareByDateDesc = <T extends EntryWithDate>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime();

export const sortByDateDesc = <T extends EntryWithDate>(entries: T[]) =>
  [...entries].sort(compareByDateDesc);

export const collectTags = <T extends EntryWithTags>(entries: T[]) =>
  [...new Set(filterPublishedEntries(entries).flatMap((entry) => entry.data.tags ?? []))].sort();
