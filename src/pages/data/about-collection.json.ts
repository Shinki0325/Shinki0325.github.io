import type { APIRoute } from "astro";
import bangumiCollections from "../../data/bangumi-collections.json";
import { buildAboutCollectionPayload } from "../../lib/about-collection";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildAboutCollectionPayload(bangumiCollections)), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
