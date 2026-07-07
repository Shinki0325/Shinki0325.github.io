import type { Express, Request, Response } from "express";
import { copyAsset, listAssets } from "../files";

export const registerAssetRoutes = (app: Express) => {
  app.get("/api/assets", async (_req: Request, res: Response) => {
    try {
      res.json({
        items: await listAssets()
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/assets/copy", async (req: Request, res: Response) => {
    try {
      const { sourcePath, targetDir } = req.body as {
        sourcePath?: string;
        targetDir?: string;
      };

      if (!sourcePath) {
        res.status(400).json({ error: "sourcePath is required." });
        return;
      }

      res.json({
        item: await copyAsset(sourcePath, targetDir)
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};
