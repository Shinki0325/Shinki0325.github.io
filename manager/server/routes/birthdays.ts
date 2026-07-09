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

class RouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected birthday manager error.";

const getBirthdayRouteErrorStatus = (error: unknown) => {
  if (error instanceof RouteError) {
    return error.status;
  }

  const message = getErrorMessage(error);
  if (message.startsWith("Cannot delete work")) {
    return 409;
  }

  if (
    [
      " is required",
      " must ",
      "Invalid ",
      "duplicate ",
      "Source path must be a file"
    ].some((fragment) => message.includes(fragment))
  ) {
    return 400;
  }

  return 500;
};

const sendRouteError = (res: Response, error: unknown) => {
  res.status(getBirthdayRouteErrorStatus(error)).json({ error: getErrorMessage(error) });
};

const requireStringField = (body: Record<string, unknown>, field: string) => {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RouteError(400, `${field} is required.`);
  }

  return value;
};

const requireImageKind = (body: Record<string, unknown>) => {
  if (!isBirthdayImageKind(body.kind)) {
    throw new RouteError(400, "kind must be avatar or image.");
  }

  return body.kind;
};

const requireBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new RouteError(400, "Request body is required.");
  }

  return body;
};

const requireFields = (body: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === "") {
      throw new RouteError(400, `${field} is required.`);
    }
  }
};

const withStats = (data: BirthdayDataFile) => ({
  ...data,
  stats: getBirthdayStats(data)
});

const parseBase64ImageDataUrl = (dataUrl: string): Buffer => {
  const match = dataUrl.match(/^data:image\/(?:webp|png|jpe?g);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) {
    throw new RouteError(400, "dataUrl must be a data:image/webp, image/png, or image/jpeg;base64 URL.");
  }

  const buffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
  if (buffer.length === 0) {
    throw new RouteError(400, "dataUrl must include image data.");
  }

  return buffer;
};

const parseBirthdayWorkDraft = (body: unknown): BirthdayWorkDraft => {
  const record = requireBody(body);
  requireFields(record, ["id", "title", "sourceUrl"]);

  return record as BirthdayWorkDraft;
};

const parseBirthdayCharacterDraft = (input: unknown): BirthdayCharacterDraft => {
  const body = requireBody(input);
  requireFields(body, ["id", "name", "workId", "birthday", "gender", "sourceUrl", "verificationStatus"]);

  return {
    ...body,
    avatar: body.avatar ?? null
  } as BirthdayCharacterDraft;
};

const parseIdPayload = (body: unknown) => {
  const record = requireBody(body);
  return requireStringField(record, "id");
};

const parseBirthdayImagePayload = (body: unknown) => {
  const record = requireBody(body);

  return {
    sourcePath: requireStringField(record, "sourcePath"),
    workId: requireStringField(record, "workId"),
    characterId: requireStringField(record, "characterId"),
    kind: requireImageKind(record)
  };
};

const parseBirthdayImageUploadPayload = (body: unknown) => {
  const record = requireBody(body);

  return {
    dataUrl: requireStringField(record, "dataUrl"),
    workId: requireStringField(record, "workId"),
    characterId: requireStringField(record, "characterId"),
    kind: requireImageKind(record)
  };
};

const parseBirthdayAvatarCropPayload = (body: unknown) => {
  const record = requireBody(body);
  const crop = record.crop;

  if (!isRecord(crop) || crop.x === undefined || crop.y === undefined || crop.size === undefined) {
    throw new RouteError(400, "crop with x, y, and size is required.");
  }

  return {
    sourceUrl: requireStringField(record, "sourceUrl"),
    workId: requireStringField(record, "workId"),
    characterId: requireStringField(record, "characterId"),
    crop: crop as BirthdayAvatarCrop
  };
};

export const registerBirthdayRoutes = (app: Express) => {
  app.get("/api/birthdays", async (_req: Request, res: Response) => {
    try {
      res.json(withStats(await readBirthdayData()));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/work/save", async (req: Request, res: Response) => {
    try {
      res.json(withStats(await saveBirthdayWork(parseBirthdayWorkDraft(req.body))));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/work/delete", async (req: Request, res: Response) => {
    try {
      res.json(withStats(await deleteBirthdayWork(parseIdPayload(req.body))));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/character/save", async (req: Request, res: Response) => {
    try {
      res.json(withStats(await saveBirthdayCharacter(parseBirthdayCharacterDraft(req.body))));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/character/delete", async (req: Request, res: Response) => {
    try {
      res.json(withStats(await deleteBirthdayCharacter(parseIdPayload(req.body))));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/image/copy", async (req: Request, res: Response) => {
    try {
      const { sourcePath, workId, characterId, kind } = parseBirthdayImagePayload(req.body);
      res.json(await copyBirthdayImage(sourcePath, workId, characterId, kind));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/image/upload", async (req: Request, res: Response) => {
    try {
      const { dataUrl, workId, characterId, kind } = parseBirthdayImageUploadPayload(req.body);
      const buffer = parseBase64ImageDataUrl(dataUrl);
      res.json(await saveUploadedBirthdayImage(buffer, workId, characterId, kind));
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.post("/api/birthdays/avatar/crop", async (req: Request, res: Response) => {
    try {
      const { sourceUrl, workId, characterId, crop } = parseBirthdayAvatarCropPayload(req.body);
      res.json(await cropBirthdayAvatar(sourceUrl, workId, characterId, crop));
    } catch (error) {
      sendRouteError(res, error);
    }
  });
};
