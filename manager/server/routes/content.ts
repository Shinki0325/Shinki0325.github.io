import type { Express, Request, Response } from "express";
import {
  getContentKinds,
  getPageConfigNames,
  listEntries,
  readEntry,
  readPageConfig,
  saveMarkdownEntry,
  savePageConfig
} from "../files";
import type { ContentKind, PageConfigName, SaveContentPayload } from "../../src/types";

const isContentKind = (value: string): value is ContentKind =>
  getContentKinds().includes(value as ContentKind);

const isPageConfigName = (value: string): value is PageConfigName =>
  getPageConfigNames().includes(value as PageConfigName);

export const registerContentRoutes = (app: Express) => {
  app.get("/api/content", async (req: Request, res: Response) => {
    try {
      const requestedKind = String(req.query.kind ?? "articles");

      if (!isContentKind(requestedKind)) {
        res.status(400).json({
          error: "Unsupported content kind",
          supportedKinds: getContentKinds()
        });
        return;
      }

      const items = await listEntries(requestedKind);
      res.json({
        kind: requestedKind,
        items
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/content/entry", async (req: Request, res: Response) => {
    try {
      const requestedKind = String(req.query.kind ?? "");
      const slug = String(req.query.slug ?? "");

      if (!isContentKind(requestedKind) || !slug) {
        res.status(400).json({ error: "kind and slug are required." });
        return;
      }

      res.json(await readEntry(requestedKind, slug));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/content/save", async (req: Request, res: Response) => {
    try {
      const payload = req.body as SaveContentPayload;
      if (!isContentKind(payload.kind) || !payload.slug) {
        res.status(400).json({ error: "kind and slug are required." });
        return;
      }

      res.json(
        await saveMarkdownEntry({
          kind: payload.kind,
          slug: payload.slug,
          frontmatter: payload.frontmatter,
          body: payload.body
        })
      );
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/content/page-config", async (req: Request, res: Response) => {
    try {
      const name = String(req.query.name ?? "home");
      if (!isPageConfigName(name)) {
        res.status(400).json({ error: "Unsupported page config." });
        return;
      }

      res.json(await readPageConfig(name));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/content/page-config/save", async (req: Request, res: Response) => {
    try {
      const { name, json } = req.body as { name: string; json: string };
      if (!isPageConfigName(name) || typeof json !== "string") {
        res.status(400).json({ error: "name and json are required." });
        return;
      }

      res.json(await savePageConfig(name, json));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};
