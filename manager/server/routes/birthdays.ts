import type { Express, Request, Response } from "express";
import {
  copyBirthdayImage,
  cropBirthdayAvatar,
  deleteBirthdayCharacter,
  deleteBirthdayWork,
  getBirthdayStats,
  readBirthdayData,
  saveBirthdayCharacter,
  saveBirthdayWork,
  saveUploadedBirthdayImage
} from "../birthdays";
import type {
  BirthdayAvatarCrop,
  BirthdayCharacterDraft,
  BirthdayDataFile,
  BirthdayImageKind,
  BirthdayWorkDraft
} from "../birthdays";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBirthdayImageKind = (value: unknown): value is BirthdayImageKind =>
  value === "avatar" || value === "image";

const sendError = (res: Response, status: number, error: unknown) => {
  res.status(status).json({ error: (error as Error).message });
};

const sendMissingField = (res: Response, field: string) => {
  res.status(400).json({ error: `${field} is required.` });
};

const requireStringField = (
  body: Record<string, unknown>,
  field: string,
  res: Response
): string | undefined => {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    sendMissingField(res, field);
    return undefined;
  }

  return value;
};

const requireImageKind = (
  body: Record<string, unknown>,
  res: Response
): BirthdayImageKind | undefined => {
  if (!isBirthdayImageKind(body.kind)) {
    res.status(400).json({ error: "kind must be avatar or image." });
    return undefined;
  }

  return body.kind;
};

const requireFields = (
  body: unknown,
  fields: string[],
  res: Response
): body is Record<string, unknown> => {
  if (!isRecord(body)) {
    res.status(400).json({ error: "Request body is required." });
    return false;
  }

  for (const field of fields) {
    if (body[field] === undefined || body[field] === "") {
      sendMissingField(res, field);
      return false;
    }
  }

  return true;
};

const withStats = (data: BirthdayDataFile) => ({
  ...data,
  stats: getBirthdayStats(data)
});

const parseBase64ImageDataUrl = (dataUrl: string, res: Response): Buffer | undefined => {
  const match = dataUrl.match(/^data:image\/[a-z0-9.+-]+;base64,([a-z0-9+/=\s]+)$/i);
  if (!match) {
    res.status(400).json({ error: "dataUrl must be a base64 image data URL." });
    return undefined;
  }

  const buffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
  if (buffer.length === 0) {
    res.status(400).json({ error: "dataUrl must include image data." });
    return undefined;
  }

  return buffer;
};

export const registerBirthdayRoutes = (app: Express) => {
  app.get("/api/birthdays", async (_req: Request, res: Response) => {
    try {
      res.json(withStats(await readBirthdayData()));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/work/save", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["id", "title", "sourceUrl"], res)) {
        return;
      }

      res.json(withStats(await saveBirthdayWork(req.body as BirthdayWorkDraft)));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/work/delete", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["id"], res)) {
        return;
      }

      res.json(withStats(await deleteBirthdayWork(String(req.body.id))));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/character/save", async (req: Request, res: Response) => {
    try {
      if (
        !requireFields(
          req.body,
          ["id", "name", "workId", "birthday", "gender", "avatar", "sourceUrl", "verificationStatus"],
          res
        )
      ) {
        return;
      }

      res.json(withStats(await saveBirthdayCharacter(req.body as BirthdayCharacterDraft)));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/character/delete", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["id"], res)) {
        return;
      }

      res.json(withStats(await deleteBirthdayCharacter(String(req.body.id))));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/image/copy", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["sourcePath", "workId", "characterId", "kind"], res)) {
        return;
      }

      const sourcePath = requireStringField(req.body, "sourcePath", res);
      const workId = requireStringField(req.body, "workId", res);
      const characterId = requireStringField(req.body, "characterId", res);
      const kind = requireImageKind(req.body, res);

      if (!sourcePath || !workId || !characterId || !kind) {
        return;
      }

      res.json(await copyBirthdayImage(sourcePath, workId, characterId, kind));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/image/upload", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["dataUrl", "workId", "characterId", "kind"], res)) {
        return;
      }

      const dataUrl = requireStringField(req.body, "dataUrl", res);
      const workId = requireStringField(req.body, "workId", res);
      const characterId = requireStringField(req.body, "characterId", res);
      const kind = requireImageKind(req.body, res);

      if (!dataUrl || !workId || !characterId || !kind) {
        return;
      }

      const buffer = parseBase64ImageDataUrl(dataUrl, res);
      if (!buffer) {
        return;
      }

      res.json(await saveUploadedBirthdayImage(buffer, workId, characterId, kind));
    } catch (error) {
      sendError(res, 500, error);
    }
  });

  app.post("/api/birthdays/avatar/crop", async (req: Request, res: Response) => {
    try {
      if (!requireFields(req.body, ["sourceUrl", "workId", "characterId", "crop"], res)) {
        return;
      }

      const sourceUrl = requireStringField(req.body, "sourceUrl", res);
      const workId = requireStringField(req.body, "workId", res);
      const characterId = requireStringField(req.body, "characterId", res);
      const crop = req.body.crop;

      if (!sourceUrl || !workId || !characterId) {
        return;
      }

      if (!isRecord(crop) || crop.x === undefined || crop.y === undefined || crop.size === undefined) {
        res.status(400).json({ error: "crop with x, y, and size is required." });
        return;
      }

      res.json(
        await cropBirthdayAvatar(sourceUrl, workId, characterId, crop as BirthdayAvatarCrop)
      );
    } catch (error) {
      sendError(res, 500, error);
    }
  });
};
