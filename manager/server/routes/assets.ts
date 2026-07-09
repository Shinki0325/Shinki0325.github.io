import type { Express, Request, Response } from "express";
import { copyAsset, cropAssetImage, listAssets, saveUploadedAssetImage } from "../files";
import { getImageHostStatus } from "../imageHost";
import type { AssetImageCrop } from "../../src/types";

const parseBase64ImageDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:image\/(?:webp|png|jpe?g);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) {
    throw new Error("dataUrl must be a data:image/webp, image/png, or image/jpeg;base64 URL.");
  }

  const buffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
  if (buffer.length === 0) {
    throw new Error("dataUrl must include image data.");
  }
  const subtype = match[0].match(/^data:image\/([^;]+)/i)?.[1]?.replace("jpg", "jpeg") ?? "jpeg";
  return {
    buffer,
    contentType: `image/${subtype}`
  };
};

export const registerAssetRoutes = (app: Express) => {
  app.get("/api/image-host/status", (_req: Request, res: Response) => {
    res.json(getImageHostStatus());
  });

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

  app.post("/api/assets/image/upload", async (req: Request, res: Response) => {
    try {
      const { dataUrl, targetDir, filename } = req.body as {
        dataUrl?: string;
        targetDir?: string;
        filename?: string;
      };

      if (!dataUrl) {
        res.status(400).json({ error: "dataUrl is required." });
        return;
      }

      const image = parseBase64ImageDataUrl(dataUrl);
      res.json({
        item: await saveUploadedAssetImage(image.buffer, targetDir, filename, image.contentType)
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/assets/image/crop", async (req: Request, res: Response) => {
    try {
      const { sourceUrl, targetDir, filename, crop, outputWidth, outputHeight } = req.body as {
        sourceUrl?: string;
        targetDir?: string;
        filename?: string;
        crop?: AssetImageCrop;
        outputWidth?: number;
        outputHeight?: number;
      };

      if (!sourceUrl || !filename || !crop || !outputWidth || !outputHeight) {
        res.status(400).json({ error: "sourceUrl, filename, crop, outputWidth, and outputHeight are required." });
        return;
      }

      res.json({
        item: await cropAssetImage(sourceUrl, targetDir ?? "", filename, crop, outputWidth, outputHeight)
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
};
