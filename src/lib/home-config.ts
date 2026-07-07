import { z } from "zod";
import homeConfigSource from "../config/pages/home.json";
import referencesConfigSource from "../config/pages/references.json";

const articleListBlockSchema = z.object({
  type: z.literal("article-list"),
  title: z.string().min(1),
  limit: z.number().int().positive(),
  articleType: z.enum(["article", "script"]).optional()
});

const referenceListBlockSchema = z.object({
  type: z.literal("reference-list"),
  title: z.string().min(1),
  limit: z.number().int().positive()
});

const homePageConfigSchema = z.object({
  blocks: z.array(z.discriminatedUnion("type", [articleListBlockSchema, referenceListBlockSchema]))
});

const referencesPageConfigSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  blocks: z.array(referenceListBlockSchema)
});

export type HomePageConfig = z.infer<typeof homePageConfigSchema>;
export type HomePageBlock = HomePageConfig["blocks"][number];
export type ReferencesPageConfig = z.infer<typeof referencesPageConfigSchema>;

export const loadHomeConfig = async () =>
  homePageConfigSchema.parse(homeConfigSource);

export const loadReferencesConfig = async () =>
  referencesPageConfigSchema.parse(referencesConfigSource);
