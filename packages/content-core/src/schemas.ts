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
  template: z.string().optional()
});

export const referenceSchema = z.object({
  title: z.string(),
  kind: z.enum(["source", "topic"]),
  visibility: z.enum(["public", "private"]).default("public"),
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
  relatedRefs: z.array(z.string()).default([]),
  relatedScripts: z.array(z.string()).default([])
});
