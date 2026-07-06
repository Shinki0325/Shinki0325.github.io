import { defineCollection, z } from "astro:content";

const article = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

const note = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    source: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

const topic = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: z.string().optional(),
    pinned: z.boolean().default(false)
  })
});

const draft = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(true)
  })
});

const vault = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date()
  })
});

export const collections = {
  articles: article,
  notes: note,
  topics: topic,
  drafts: draft,
  vault: vault
};
