type EntryData = {
  title: string;
  summary: string;
  date?: string;
  tags?: string[];
  type?: string;
};

type EntryLike = {
  slug: string;
  data: EntryData;
};

type HomeCollections = {
  articles: EntryLike[];
  notes: EntryLike[];
  references: EntryLike[];
};

type SearchItem = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  section: "文稿" | "笔记" | "资料库";
};

export type HomeViewModel = {
  featuredArticle: EntryLike | null;
  featuredNote: EntryLike | null;
  featuredReference: EntryLike | null;
  stats: {
    articleCount: number;
    noteCount: number;
    referenceCount: number;
  };
};

const withTags = (tags: string[] | undefined) => tags ?? [];

export const buildHomeViewModel = ({
  articles,
  notes,
  references,
}: HomeCollections): HomeViewModel => ({
  featuredArticle: articles[0] ?? null,
  featuredNote: notes[0] ?? null,
  featuredReference: references[0] ?? null,
  stats: {
    articleCount: articles.length,
    noteCount: notes.length,
    referenceCount: references.length,
  },
});

export const buildHomeSearchIndex = ({
  articles,
  notes,
  references,
}: HomeCollections): SearchItem[] => [
  ...articles.map((entry) => ({
    title: entry.data.title,
    summary: entry.data.summary,
    tags: withTags(entry.data.tags),
    href: `/articles/${entry.slug}/`,
    section: "文稿" as const,
  })),
  ...notes.map((entry) => ({
    title: entry.data.title,
    summary: entry.data.summary,
    tags: withTags(entry.data.tags),
    href: `/notes/${entry.slug}/`,
    section: "笔记" as const,
  })),
  ...references.map((entry) => ({
    title: entry.data.title,
    summary: entry.data.summary,
    tags: withTags(entry.data.tags),
    href: `/references/${entry.slug}/`,
    section: "资料库" as const,
  })),
];
