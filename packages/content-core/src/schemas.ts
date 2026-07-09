import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  type: z.enum(["article", "script"]).default("article"),
  tags: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  template: z.string().optional(),
});

export const albumPhotoSchema = z.object({
  url: z.string(),
  originalUrl: z.string().optional(),
  alt: z.string(),
  caption: z.string().optional(),
  credit: z.string().optional(),
  relatedReferences: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
});

export const albumSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
  visibility: z.enum(["public", "hidden"]).default("public"),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
  relatedArticles: z.array(z.string()).default([]),
  relatedReferences: z.array(z.string()).default([]),
  photos: z.array(albumPhotoSchema).min(1),
});

const readingBlockSchema = z.object({
  label: z.string().optional(),
  original: z.string(),
  translation: z.string().optional(),
  note: z.string().optional(),
  focus: z.boolean().default(false),
});

export const referenceSchema = z.object({
  title: z.string(),
  kind: z.enum(["source", "topic"]),
  visibility: z.enum(["public", "private"]).default("public"),
  librarySection: z.enum(["回忆、讨论与后见视角", "作品与人物", "社会背景"]).optional(),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  sourceType: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  publisher: z.string().optional(),
  quote: z.string().optional(),
  note: z.string().optional(),
  intro: z.string().optional(),
  relatedRefs: z.array(z.string()).optional(),
  relatedScripts: z.array(z.string()).optional(),
  readingMode: z.enum(["curated", "extract"]).default("extract"),
  sourceLanguage: z.string().optional(),
  translationLanguage: z.string().optional(),
  readingBlocks: z.array(readingBlockSchema).default([]),
});
