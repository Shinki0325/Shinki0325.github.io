import { getCollection } from "astro:content";
import { collectTags, filterPublishedEntries, sortByDateDesc } from "./content";

export const getPublishedArticles = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("articles")));

export const getPublishedNotes = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("notes")));

export const getPublishedTags = async () => {
  const [articles, notes] = await Promise.all([getPublishedArticles(), getPublishedNotes()]);
  return collectTags([...articles, ...notes]);
};
