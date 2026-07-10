import { albumSchema, articleSchema, referenceSchema } from "@maki/content-core";
import { defineCollection, z } from "astro:content";

const article = defineCollection({ schema: articleSchema });

const album = defineCollection({ schema: albumSchema });

const reference = defineCollection({ schema: referenceSchema });

const note = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    category: z.string().optional(),
    cover: z.string().optional(),
    covers: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    source: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const draft = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["article", "reference", "note", "vault"]).optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

const vault = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = {
  articles: article,
  albums: album,
  references: reference,
  notes: note,
  drafts: draft,
  vault: vault,
};
