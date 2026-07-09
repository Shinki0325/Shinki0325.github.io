# Birthday Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished local manager section for maintaining character birthday works, character records, avatars, and full-size character images.

**Architecture:** Move birthday records into a JSON source that is safe for the manager to edit, while keeping the existing `src/data/character-birthdays.ts` public API stable for the Astro site. Add localhost-only manager API routes for CRUD and image operations, then add a React manager page with glass-card UI, manual avatar cropping, and upload/path import support.

**Tech Stack:** Astro, React 18, Vite, TypeScript, Express, Vitest, existing Python OpenCV anime-face crop helper, WSL file paths under `/mnt/d/blog`.

---

## File Structure

- Create `src/data/character-birthdays.json`: editable source of works and characters.
- Modify `src/data/character-birthdays.ts`: import JSON and keep all current calendar exports stable.
- Modify `tsconfig.json`: allow JSON imports in TypeScript.
- Create `manager/server/birthdays.ts`: read/write birthday JSON, validate records, copy/upload images, crop avatars.
- Create `manager/server/routes/birthdays.ts`: Express routes for birthday manager APIs.
- Modify `manager/server/index.ts`: register birthday routes and keep JSON upload payloads within the existing local API limit.
- Modify `manager/src/types.ts`: add birthday manager response, work, character, and image operation types.
- Modify `manager/src/api.ts`: add birthday API client functions.
- Create `manager/src/pages/BirthdayManager.tsx`: local manager UI for works, characters, image previews, and avatar crop controls.
- Modify `manager/src/App.tsx`: add the `生日角色` navigation entry.
- Modify `manager/src/main.tsx`: improve manager shell/global UI with the glass-card control-room style.
- Modify `tests/character-birthdays.test.ts`: assert JSON-backed data, optional full image field, and existing behavior.
- Modify `tests/manager-api.test.ts`: assert birthday route registration and data service presence.
- Create `tests/manager-birthday-manager.test.ts`: assert UI entry, fields, image/crop controls, and API usage.

## Task 1: Convert Birthday Data To Editable JSON

**Files:**
- Create: `src/data/character-birthdays.json`
- Modify: `src/data/character-birthdays.ts`
- Modify: `tsconfig.json`
- Modify: `tests/character-birthdays.test.ts`

- [ ] **Step 1: Write the failing JSON-source test**

Add this import near the top of `tests/character-birthdays.test.ts`:

```ts
import birthdayData from "../src/data/character-birthdays.json";
```

Add this test inside `describe("character birthday dataset", () => { ... })`:

```ts
  it("is backed by an editable JSON source for manager CRUD", () => {
    expect(birthdayData.works.length).toBe(birthdayWorks.length);
    expect(birthdayData.characters.length).toBe(characterBirthdays.length);
    expect(birthdayData.characters[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        workId: expect.any(String),
        name: expect.any(String),
        birthday: expect.stringMatching(/^\d{2}-\d{2}$/),
        avatar: expect.stringMatching(/^\/uploads\/character-birthdays\/.+\.webp$/),
        bangumiId: expect.stringMatching(/^\d+$/),
      }),
    );
  });
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test -- tests/character-birthdays.test.ts
```

Expected: FAIL because `src/data/character-birthdays.json` does not exist or cannot be imported.

- [ ] **Step 3: Generate the initial JSON from the current TypeScript exports**

Before editing `src/data/character-birthdays.ts`, run this one-time command:

```bash
pnpm exec tsx -e 'import { birthdayWorks, characterBirthdays } from "./src/data/character-birthdays.ts"; import { writeFileSync } from "node:fs"; const data = { works: birthdayWorks, characters: characterBirthdays.map((character) => ({ ...character, image: null })) }; writeFileSync("src/data/character-birthdays.json", `${JSON.stringify(data, null, 2)}\n`); console.log(JSON.stringify({ works: data.works.length, characters: data.characters.length }));'
```

Expected: prints non-zero work and character counts.

- [ ] **Step 4: Enable JSON imports**

Update `tsconfig.json` to include `resolveJsonModule`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 5: Replace the inline source arrays in `src/data/character-birthdays.ts`**

Keep all exported types and calendar helper functions. Replace the large `birthdayWorks`, `bangumiCharacterIds`, `reviewedCharacterIds`, `recordsByWork`, and `toCharacters()` source-building section with JSON-backed exports shaped like this:

```ts
import birthdayData from "./character-birthdays.json";

export type BirthdayVerificationStatus = "verified" | "todo";
export type BirthdayDate = `${number}${number}-${number}${number}`;
export type CharacterGender = "female" | "male";

export type BirthdayWork = {
  id: string;
  title: string;
  localizedTitle?: string;
  sourceUrl: string;
};

export type CharacterBirthday = {
  id: string;
  name: string;
  workId: string;
  birthday: BirthdayDate;
  gender: CharacterGender;
  avatar: string | null;
  image?: string | null;
  sourceUrl: string;
  sourceId?: string;
  bangumiId?: string;
  reading?: string;
  verificationStatus: BirthdayVerificationStatus;
};

export const birthdayWorks = birthdayData.works as BirthdayWork[];

export const characterBirthdays = birthdayData.characters as CharacterBirthday[];
```

Keep existing functions below these exports, including `groupBirthdaysByMonthDay`, `getCalendarMonth`, `getCharactersByWork`, and `getCharacterBangumiUrl`.

- [ ] **Step 6: Run birthday tests**

Run:

```bash
pnpm test -- tests/character-birthdays.test.ts tests/character-birthday-calendar.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the JSON migration**

Run:

```bash
git add tsconfig.json src/data/character-birthdays.json src/data/character-birthdays.ts tests/character-birthdays.test.ts
git commit -m "feat: move birthday records to json source"
```

## Task 2: Add Birthday Manager Server Data Service

**Files:**
- Create: `manager/server/birthdays.ts`
- Modify: `tests/manager-api.test.ts`

- [ ] **Step 1: Write the failing server contract test**

Add this test to `tests/manager-api.test.ts`:

```ts
  it("adds a birthday data service for local CRUD and image operations", async () => {
    const serviceSource = await fs.readFile("manager/server/birthdays.ts", "utf8");

    expect(serviceSource).toContain("readBirthdayData");
    expect(serviceSource).toContain("saveBirthdayWork");
    expect(serviceSource).toContain("saveBirthdayCharacter");
    expect(serviceSource).toContain("deleteBirthdayCharacter");
    expect(serviceSource).toContain("copyBirthdayImage");
    expect(serviceSource).toContain("cropBirthdayAvatar");
    expect(serviceSource).toContain("character-birthdays.json");
    expect(serviceSource).toContain("public/uploads/character-birthdays");
  });
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test -- tests/manager-api.test.ts
```

Expected: FAIL because `manager/server/birthdays.ts` does not exist.

- [ ] **Step 3: Implement `manager/server/birthdays.ts`**

Create a focused service with these exported functions and validation rules:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  BirthdayCharacterDraft,
  BirthdayDataFile,
  BirthdayImageKind,
  BirthdayWorkDraft,
} from "../src/types";

const execFileAsync = promisify(execFile);
const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(managerRoot, "..");
const dataPath = path.join(repoRoot, "src", "data", "character-birthdays.json");
const publicRoot = path.join(repoRoot, "public");
const avatarRoot = path.join(publicRoot, "uploads", "character-birthdays");
const datePattern = /^\d{2}-\d{2}$/;
const safeIdPattern = /^[a-z0-9][a-z0-9-]*$/;
const numericPattern = /^\d+$/;

const normalizeWindowsPath = (inputPath: string) => {
  const match = inputPath.trim().match(/^([A-Za-z]):[\\/](.*)$/);
  return match ? `/mnt/${match[1].toLowerCase()}/${match[2].replaceAll("\\", "/")}` : inputPath.trim();
};

const toPublicUrl = (filePath: string) => `/${path.relative(publicRoot, filePath).replaceAll(path.sep, "/")}`;

const assertSafeId = (id: string, label: string) => {
  if (!safeIdPattern.test(id)) {
    throw new Error(`${label} must use lowercase letters, numbers, and hyphens.`);
  }
};

const assertBirthday = (birthday: string) => {
  if (!datePattern.test(birthday)) {
    throw new Error("birthday must use MM-DD format.");
  }
  const [month, day] = birthday.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("birthday is outside the valid calendar range.");
  }
};

const normalizeData = (data: BirthdayDataFile): BirthdayDataFile => ({
  works: [...data.works].sort((a, b) => a.id.localeCompare(b.id)),
  characters: [...data.characters].sort((a, b) =>
    a.workId === b.workId ? a.birthday.localeCompare(b.birthday) || a.name.localeCompare(b.name, "ja") : a.workId.localeCompare(b.workId),
  ),
});

export const readBirthdayData = async (): Promise<BirthdayDataFile> => {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw) as BirthdayDataFile;
};

export const writeBirthdayData = async (data: BirthdayDataFile) => {
  const normalized = normalizeData(data);
  await fs.writeFile(dataPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
};

export const getBirthdayStats = (data: BirthdayDataFile) => ({
  works: data.works.length,
  characters: data.characters.length,
  missingAvatar: data.characters.filter((character) => !character.avatar).length,
  missingImage: data.characters.filter((character) => !character.image).length,
  todo: data.characters.filter((character) => character.verificationStatus !== "verified").length,
});

export const saveBirthdayWork = async (draft: BirthdayWorkDraft) => {
  assertSafeId(draft.id, "work id");
  if (!draft.title.trim() || !draft.sourceUrl.trim()) {
    throw new Error("work title and sourceUrl are required.");
  }
  const data = await readBirthdayData();
  const nextWork = {
    id: draft.id.trim(),
    title: draft.title.trim(),
    localizedTitle: draft.localizedTitle?.trim() || undefined,
    sourceUrl: draft.sourceUrl.trim(),
  };
  const works = data.works.filter((work) => work.id !== nextWork.id);
  return writeBirthdayData({ ...data, works: [...works, nextWork] });
};

export const deleteBirthdayWork = async (id: string) => {
  const data = await readBirthdayData();
  if (data.characters.some((character) => character.workId === id)) {
    throw new Error("Cannot delete a work that still has characters.");
  }
  return writeBirthdayData({ ...data, works: data.works.filter((work) => work.id !== id) });
};

export const saveBirthdayCharacter = async (draft: BirthdayCharacterDraft) => {
  assertSafeId(draft.id, "character id");
  assertBirthday(draft.birthday);
  if (draft.bangumiId && !numericPattern.test(draft.bangumiId)) {
    throw new Error("bangumiId must be numeric.");
  }
  const data = await readBirthdayData();
  if (!data.works.some((work) => work.id === draft.workId)) {
    throw new Error("Unknown workId.");
  }
  const nextCharacter = {
    id: draft.id.trim(),
    workId: draft.workId.trim(),
    name: draft.name.trim(),
    reading: draft.reading?.trim() || undefined,
    birthday: draft.birthday,
    gender: draft.gender,
    sourceId: draft.sourceId?.trim() || undefined,
    bangumiId: draft.bangumiId?.trim() || undefined,
    sourceUrl: draft.sourceUrl.trim(),
    avatar: draft.avatar?.trim() || null,
    image: draft.image?.trim() || null,
    verificationStatus: draft.verificationStatus,
  };
  if (!nextCharacter.name || !nextCharacter.sourceUrl) {
    throw new Error("character name and sourceUrl are required.");
  }
  const characters = data.characters.filter((character) => character.id !== nextCharacter.id);
  return writeBirthdayData({ ...data, characters: [...characters, nextCharacter] });
};

export const deleteBirthdayCharacter = async (id: string) => {
  const data = await readBirthdayData();
  return writeBirthdayData({ ...data, characters: data.characters.filter((character) => character.id !== id) });
};

const getImageDestination = (workId: string, characterId: string, kind: BirthdayImageKind) => {
  assertSafeId(workId, "work id");
  assertSafeId(characterId, "character id");
  const filename = kind === "avatar" ? `${characterId}.webp` : `${characterId}-full.webp`;
  const destination = path.resolve(avatarRoot, workId, filename);
  if (!destination.startsWith(avatarRoot)) {
    throw new Error("Invalid birthday image path.");
  }
  return destination;
};

export const copyBirthdayImage = async (sourcePath: string, workId: string, characterId: string, kind: BirthdayImageKind) => {
  const source = path.resolve(normalizeWindowsPath(sourcePath));
  const stat = await fs.stat(source);
  if (!stat.isFile()) {
    throw new Error("sourcePath must be a file.");
  }
  const destination = getImageDestination(workId, characterId, kind);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
  return toPublicUrl(destination);
};

export const saveUploadedBirthdayImage = async (buffer: Buffer, workId: string, characterId: string, kind: BirthdayImageKind) => {
  const destination = getImageDestination(workId, characterId, kind);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, buffer);
  return toPublicUrl(destination);
};

export const cropBirthdayAvatar = async (sourceUrl: string, workId: string, characterId: string, crop: { x: number; y: number; size: number }) => {
  const sourcePath = path.resolve(publicRoot, sourceUrl.replace(/^\//, ""));
  const destination = getImageDestination(workId, characterId, "avatar");
  const cropArg = `${Math.round(crop.x)},${Math.round(crop.y)},${Math.round(crop.size)}`;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await execFileAsync("python3", ["scripts/crop_square_image.py", sourcePath, destination, cropArg], {
    cwd: repoRoot,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 4,
  });
  return toPublicUrl(destination);
};
```

- [ ] **Step 4: Run the server contract test**

Run:

```bash
pnpm test -- tests/manager-api.test.ts
```

Expected: PASS for the new contract test after types and referenced script are added in later tasks. If TypeScript build is run before later tasks, it may still fail because `BirthdayCharacterDraft` and `scripts/crop_square_image.py` are not created yet.

- [ ] **Step 5: Commit the server service**

Run after Task 3 types are added and tests pass:

```bash
git add manager/server/birthdays.ts tests/manager-api.test.ts
git commit -m "feat: add birthday manager data service"
```

## Task 3: Add Birthday Manager Types And API Routes

**Files:**
- Modify: `manager/src/types.ts`
- Modify: `manager/src/api.ts`
- Create: `manager/server/routes/birthdays.ts`
- Modify: `manager/server/index.ts`
- Modify: `tests/manager-api.test.ts`

- [ ] **Step 1: Write the failing route registration test**

Add this test to `tests/manager-api.test.ts`:

```ts
  it("registers birthday manager routes and client API helpers", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(indexSource).toContain("registerBirthdayRoutes");
    expect(routeSource).toContain("/api/birthdays");
    expect(routeSource).toContain("/api/birthdays/character/save");
    expect(routeSource).toContain("/api/birthdays/image/upload");
    expect(apiSource).toContain("getBirthdayData");
    expect(apiSource).toContain("saveBirthdayCharacter");
    expect(apiSource).toContain("uploadBirthdayImage");
    expect(typesSource).toContain("BirthdayDataFile");
    expect(typesSource).toContain("BirthdayCharacterDraft");
  });
```

- [ ] **Step 2: Run the route test and verify it fails**

Run:

```bash
pnpm test -- tests/manager-api.test.ts
```

Expected: FAIL because the route file and API helpers do not exist.

- [ ] **Step 3: Add birthday types**

Append these types to `manager/src/types.ts`:

```ts
export type BirthdayVerificationStatus = "verified" | "todo";
export type BirthdayDate = `${number}${number}-${number}${number}`;
export type BirthdayImageKind = "avatar" | "image";

export type BirthdayWorkDraft = {
  id: string;
  title: string;
  localizedTitle?: string;
  sourceUrl: string;
};

export type BirthdayCharacterDraft = {
  id: string;
  name: string;
  workId: string;
  birthday: BirthdayDate;
  gender: "female" | "male";
  avatar: string | null;
  image?: string | null;
  sourceUrl: string;
  sourceId?: string;
  bangumiId?: string;
  reading?: string;
  verificationStatus: BirthdayVerificationStatus;
};

export type BirthdayDataFile = {
  works: BirthdayWorkDraft[];
  characters: BirthdayCharacterDraft[];
};

export type BirthdayStats = {
  works: number;
  characters: number;
  missingAvatar: number;
  missingImage: number;
  todo: number;
};

export type BirthdayDataResponse = BirthdayDataFile & {
  stats: BirthdayStats;
};
```

- [ ] **Step 4: Add Express birthday routes**

Create `manager/server/routes/birthdays.ts`:

```ts
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
  saveUploadedBirthdayImage,
} from "../birthdays";
import type { BirthdayCharacterDraft, BirthdayImageKind, BirthdayWorkDraft } from "../../src/types";

const sendError = (res: Response, error: unknown, status = 500) => {
  res.status(status).json({ error: (error as Error).message });
};

const isImageKind = (value: unknown): value is BirthdayImageKind => value === "avatar" || value === "image";

export const registerBirthdayRoutes = (app: Express) => {
  app.get("/api/birthdays", async (_req: Request, res: Response) => {
    try {
      const data = await readBirthdayData();
      res.json({ ...data, stats: getBirthdayStats(data) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/work/save", async (req: Request, res: Response) => {
    try {
      const data = await saveBirthdayWork(req.body as BirthdayWorkDraft);
      res.json({ ...data, stats: getBirthdayStats(data) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/work/delete", async (req: Request, res: Response) => {
    try {
      const data = await deleteBirthdayWork(String(req.body?.id ?? ""));
      res.json({ ...data, stats: getBirthdayStats(data) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/character/save", async (req: Request, res: Response) => {
    try {
      const data = await saveBirthdayCharacter(req.body as BirthdayCharacterDraft);
      res.json({ ...data, stats: getBirthdayStats(data) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/character/delete", async (req: Request, res: Response) => {
    try {
      const data = await deleteBirthdayCharacter(String(req.body?.id ?? ""));
      res.json({ ...data, stats: getBirthdayStats(data) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/image/copy", async (req: Request, res: Response) => {
    try {
      const { sourcePath, workId, characterId, kind } = req.body as Record<string, unknown>;
      if (typeof sourcePath !== "string" || typeof workId !== "string" || typeof characterId !== "string" || !isImageKind(kind)) {
        res.status(400).json({ error: "sourcePath, workId, characterId, and kind are required." });
        return;
      }
      res.json({ url: await copyBirthdayImage(sourcePath, workId, characterId, kind) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/image/upload", async (req: Request, res: Response) => {
    try {
      const { workId, characterId, kind, dataUrl } = req.body as Record<string, unknown>;
      if (typeof workId !== "string" || typeof characterId !== "string" || !isImageKind(kind) || typeof dataUrl !== "string") {
        res.status(400).json({ error: "workId, characterId, kind, and dataUrl are required." });
        return;
      }
      const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: "dataUrl must be a base64 image data URL." });
        return;
      }
      res.json({ url: await saveUploadedBirthdayImage(Buffer.from(match[1], "base64"), workId, characterId, kind) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/birthdays/avatar/crop", async (req: Request, res: Response) => {
    try {
      const { sourceUrl, workId, characterId, crop } = req.body as {
        sourceUrl?: string;
        workId?: string;
        characterId?: string;
        crop?: { x: number; y: number; size: number };
      };
      if (!sourceUrl || !workId || !characterId || !crop) {
        res.status(400).json({ error: "sourceUrl, workId, characterId, and crop are required." });
        return;
      }
      res.json({ url: await cropBirthdayAvatar(sourceUrl, workId, characterId, crop) });
    } catch (error) {
      sendError(res, error);
    }
  });
};
```

- [ ] **Step 5: Register routes in `manager/server/index.ts`**

Add the import:

```ts
import { registerBirthdayRoutes } from "./routes/birthdays";
```

Register before `registerSystemRoutes(app);`:

```ts
registerBirthdayRoutes(app);
```

- [ ] **Step 6: Add manager API client functions**

Add imports and functions in `manager/src/api.ts`:

```ts
import type {
  BirthdayCharacterDraft,
  BirthdayDataResponse,
  BirthdayImageKind,
  BirthdayWorkDraft,
} from "./types";

export const getBirthdayData = () => request<BirthdayDataResponse>("/api/birthdays");

const postBirthdayJson = async <T>(path: string, body: Record<string, unknown>) => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
};

export const saveBirthdayWork = (payload: BirthdayWorkDraft) =>
  postBirthdayJson<BirthdayDataResponse>("/api/birthdays/work/save", payload);

export const deleteBirthdayWork = (id: string) =>
  postBirthdayJson<BirthdayDataResponse>("/api/birthdays/work/delete", { id });

export const saveBirthdayCharacter = (payload: BirthdayCharacterDraft) =>
  postBirthdayJson<BirthdayDataResponse>("/api/birthdays/character/save", payload);

export const deleteBirthdayCharacter = (id: string) =>
  postBirthdayJson<BirthdayDataResponse>("/api/birthdays/character/delete", { id });

export const copyBirthdayImage = (sourcePath: string, workId: string, characterId: string, kind: BirthdayImageKind) =>
  postBirthdayJson<{ url: string }>("/api/birthdays/image/copy", { sourcePath, workId, characterId, kind });

export const uploadBirthdayImage = (dataUrl: string, workId: string, characterId: string, kind: BirthdayImageKind) =>
  postBirthdayJson<{ url: string }>("/api/birthdays/image/upload", { dataUrl, workId, characterId, kind });

export const cropBirthdayAvatar = (sourceUrl: string, workId: string, characterId: string, crop: { x: number; y: number; size: number }) =>
  postBirthdayJson<{ url: string }>("/api/birthdays/avatar/crop", { sourceUrl, workId, characterId, crop });
```

- [ ] **Step 7: Run route tests and manager build**

Run:

```bash
pnpm test -- tests/manager-api.test.ts
pnpm --filter @maki/manager build
```

Expected: both PASS.

- [ ] **Step 8: Commit routes and API client**

Run:

```bash
git add manager/src/types.ts manager/src/api.ts manager/server/index.ts manager/server/routes/birthdays.ts manager/server/birthdays.ts tests/manager-api.test.ts
git commit -m "feat: add birthday manager api"
```

## Task 4: Add Manual Square Crop Helper

**Files:**
- Create: `scripts/crop_square_image.py`
- Modify: `tests/test_character_avatar_crop.py`

- [ ] **Step 1: Add crop helper tests**

Add this test method to `tests/test_character_avatar_crop.py`:

```py
    def test_manual_square_crop_argument_parser(self):
        cropper = load_module()
        manual = cropper.parse_manual_crop("10,20,120")

        self.assertEqual(manual, (10, 20, 120))
```

Also add a loader for the new helper:

```py
def load_square_crop_module():
    script_path = Path(__file__).resolve().parents[1] / "scripts" / "crop_square_image.py"
    spec = importlib.util.spec_from_file_location("crop_square_image", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module
```

Then change the method to:

```py
    def test_manual_square_crop_argument_parser(self):
        cropper = load_square_crop_module()
        manual = cropper.parse_manual_crop("10,20,120")

        self.assertEqual(manual, (10, 20, 120))
```

- [ ] **Step 2: Run Python test and verify it fails**

Run:

```bash
python3 -m unittest tests/test_character_avatar_crop.py
```

Expected: FAIL because `scripts/crop_square_image.py` does not exist.

- [ ] **Step 3: Implement `scripts/crop_square_image.py`**

Create:

```py
#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def parse_manual_crop(value: str) -> tuple[int, int, int]:
    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 3:
        raise ValueError("crop must be x,y,size")
    x, y, size = (int(part) for part in parts)
    if size <= 0:
        raise ValueError("crop size must be positive")
    return x, y, size


def crop_square(source: Path, destination: Path, crop: tuple[int, int, int], output_size: int = 240) -> None:
    import cv2

    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Failed to read image: {source}")
    image_h, image_w = image.shape[:2]
    x, y, size = crop
    x = max(0, min(x, image_w - 1))
    y = max(0, min(y, image_h - 1))
    size = max(1, min(size, image_w - x, image_h - y))
    cropped = image[y : y + size, x : x + size]
    resized = cv2.resize(cropped, (output_size, output_size), interpolation=cv2.INTER_AREA)
    destination.parent.mkdir(parents=True, exist_ok=True)
    ok = cv2.imwrite(str(destination), resized, [cv2.IMWRITE_WEBP_QUALITY, 92])
    if not ok:
        raise RuntimeError(f"Failed to write image: {destination}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("destination")
    parser.add_argument("crop")
    parser.add_argument("--output-size", type=int, default=240)
    args = parser.parse_args()
    crop_square(Path(args.source), Path(args.destination), parse_manual_crop(args.crop), args.output_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run Python tests**

Run:

```bash
python3 -m unittest tests/test_character_avatar_crop.py
```

Expected: PASS.

- [ ] **Step 5: Commit manual crop helper**

Run:

```bash
git add scripts/crop_square_image.py tests/test_character_avatar_crop.py
git commit -m "feat: add manual birthday avatar crop helper"
```

## Task 5: Build Birthday Manager UI

**Files:**
- Create: `manager/src/pages/BirthdayManager.tsx`
- Modify: `manager/src/App.tsx`
- Create: `tests/manager-birthday-manager.test.ts`

- [ ] **Step 1: Write the failing UI contract test**

Create `tests/manager-birthday-manager.test.ts`:

```ts
import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager birthday page", () => {
  it("adds a birthday character management entry and editor UI", async () => {
    const appSource = await fs.readFile("manager/src/App.tsx", "utf8");
    const pageSource = await fs.readFile("manager/src/pages/BirthdayManager.tsx", "utf8");

    expect(appSource).toContain('"birthdays"');
    expect(appSource).toContain("生日角色");
    expect(pageSource).toContain("export default function BirthdayManager");
    expect(pageSource).toContain("getBirthdayData");
    expect(pageSource).toContain("saveBirthdayCharacter");
    expect(pageSource).toContain("uploadBirthdayImage");
    expect(pageSource).toContain("cropBirthdayAvatar");
    expect(pageSource).toContain("Bangumi ID");
    expect(pageSource).toContain("大图");
    expect(pageSource).toContain("头像裁切");
  });
});
```

- [ ] **Step 2: Run UI test and verify it fails**

Run:

```bash
pnpm test -- tests/manager-birthday-manager.test.ts
```

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Add `BirthdayManager` navigation**

Modify `manager/src/App.tsx`:

```ts
import BirthdayManager from "./pages/BirthdayManager";
```

Extend `View`:

```ts
  | "birthdays"
```

Add nav item:

```ts
    { view: "birthdays", label: "生日角色" },
```

Add render branch before the default assets branch:

```tsx
    if (view === "birthdays") {
      return <BirthdayManager />;
    }
```

- [ ] **Step 4: Implement `BirthdayManager.tsx`**

Create a page with these behaviors:

```tsx
import { useEffect, useMemo, useState } from "react";
import {
  copyBirthdayImage,
  cropBirthdayAvatar,
  deleteBirthdayCharacter,
  getBirthdayData,
  saveBirthdayCharacter,
  saveBirthdayWork,
  uploadBirthdayImage,
} from "../api";
import type { BirthdayCharacterDraft, BirthdayDataResponse, BirthdayImageKind, BirthdayWorkDraft } from "../types";

const emptyCharacter = (workId = ""): BirthdayCharacterDraft => ({
  id: "",
  name: "",
  workId,
  birthday: "01-01",
  gender: "female",
  avatar: null,
  image: null,
  sourceUrl: "",
  verificationStatus: "verified",
});

const emptyWork: BirthdayWorkDraft = {
  id: "",
  title: "",
  localizedTitle: "",
  sourceUrl: "",
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function BirthdayManager() {
  const [data, setData] = useState<BirthdayDataResponse | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [query, setQuery] = useState("");
  const [character, setCharacter] = useState<BirthdayCharacterDraft>(emptyCharacter());
  const [work, setWork] = useState<BirthdayWorkDraft>(emptyWork);
  const [sourcePath, setSourcePath] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 240 });
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => {
    void getBirthdayData()
      .then((nextData) => {
        setData(nextData);
        setSelectedWorkId((current) => current || nextData.works[0]?.id || "");
      })
      .catch((error: Error) => setMessage(error.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const works = data?.works ?? [];
  const characters = data?.characters ?? [];
  const filteredCharacters = useMemo(
    () =>
      characters.filter((item) => {
        const inWork = selectedWorkId ? item.workId === selectedWorkId : true;
        const text = `${item.name} ${item.reading ?? ""} ${item.id}`.toLowerCase();
        return inWork && text.includes(query.toLowerCase());
      }),
    [characters, query, selectedWorkId],
  );

  const selectCharacter = (nextCharacter: BirthdayCharacterDraft) => {
    setCharacter({ ...nextCharacter });
    setMessage(null);
  };

  const createCharacter = () => {
    setCharacter(emptyCharacter(selectedWorkId));
    setMessage(null);
  };

  const handleSaveCharacter = async () => {
    try {
      const nextData = await saveBirthdayCharacter(character);
      setData(nextData);
      setSelectedWorkId(character.workId);
      setMessage(`已保存角色：${character.name}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character.id || !window.confirm(`删除角色 ${character.name || character.id}？`)) {
      return;
    }
    try {
      const nextData = await deleteBirthdayCharacter(character.id);
      setData(nextData);
      setCharacter(emptyCharacter(selectedWorkId));
      setMessage("角色已删除，图片文件已保留。");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleSaveWork = async () => {
    try {
      const nextData = await saveBirthdayWork(work);
      setData(nextData);
      setSelectedWorkId(work.id);
      setWork(emptyWork);
      setMessage(`已保存作品：${work.title}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const applyImageUrl = (kind: BirthdayImageKind, url: string) => {
    setCharacter((current) => (kind === "avatar" ? { ...current, avatar: url } : { ...current, image: url }));
  };

  const handleCopyImage = async (kind: BirthdayImageKind) => {
    try {
      const result = await copyBirthdayImage(sourcePath, character.workId, character.id, kind);
      applyImageUrl(kind, result.url);
      setMessage(`已导入${kind === "avatar" ? "头像" : "大图"}：${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleUpload = async (file: File | undefined, kind: BirthdayImageKind) => {
    if (!file) {
      return;
    }
    try {
      const result = await uploadBirthdayImage(await fileToDataUrl(file), character.workId, character.id, kind);
      applyImageUrl(kind, result.url);
      setMessage(`已上传${kind === "avatar" ? "头像" : "大图"}：${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCrop = async () => {
    if (!character.image) {
      setMessage("需要先上传或导入大图。");
      return;
    }
    try {
      const result = await cropBirthdayAvatar(character.image, character.workId, character.id, crop);
      applyImageUrl("avatar", result.url);
      setMessage(`头像裁切完成：${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page birthday-manager-page">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Birthday Archive</p>
          <h1>生日角色管理</h1>
          <p>维护首页生日历使用的作品、角色、Bangumi 链接、头像和大图。</p>
        </div>
        {data ? (
          <dl className="stat-strip">
            <div><dt>作品</dt><dd>{data.stats.works}</dd></div>
            <div><dt>角色</dt><dd>{data.stats.characters}</dd></div>
            <div><dt>缺头像</dt><dd>{data.stats.missingAvatar}</dd></div>
            <div><dt>缺大图</dt><dd>{data.stats.missingImage}</dd></div>
          </dl>
        ) : null}
      </section>

      <section className="birthday-workspace">
        <aside className="panel stack work-rail">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Works</p>
              <h2>作品</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => setSelectedWorkId("")}>全部</button>
          </div>
          <div className="work-list">
            {works.map((item) => (
              <button key={item.id} className={selectedWorkId === item.id ? "work-tab active" : "work-tab"} onClick={() => setSelectedWorkId(item.id)} type="button">
                <strong>{item.localizedTitle || item.title}</strong>
                <span>{characters.filter((entry) => entry.workId === item.id).length} characters</span>
              </button>
            ))}
          </div>
          <div className="mini-form">
            <input placeholder="work-id" value={work.id} onChange={(event) => setWork({ ...work, id: event.target.value })} />
            <input placeholder="标题" value={work.title} onChange={(event) => setWork({ ...work, title: event.target.value })} />
            <input placeholder="中文名" value={work.localizedTitle ?? ""} onChange={(event) => setWork({ ...work, localizedTitle: event.target.value })} />
            <input placeholder="来源链接" value={work.sourceUrl} onChange={(event) => setWork({ ...work, sourceUrl: event.target.value })} />
            <button className="primary-button" type="button" onClick={handleSaveWork}>保存作品</button>
          </div>
        </aside>

        <section className="panel stack character-browser">
          <div className="toolbar">
            <label className="field">
              <span>搜索角色</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名字、读音、ID" />
            </label>
            <button className="primary-button" type="button" onClick={createCharacter}>新建角色</button>
          </div>
          <div className="character-grid">
            {filteredCharacters.map((item) => (
              <button key={item.id} className="character-card" onClick={() => selectCharacter(item)} type="button">
                {item.avatar ? <img src={item.avatar} alt="" /> : <span className="avatar-empty">No Avatar</span>}
                <strong>{item.name}</strong>
                <span>{item.birthday}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel stack birthday-editor">
          <div>
            <p className="eyebrow">Editor</p>
            <h2>角色资料</h2>
          </div>
          <div className="grid-form">
            <label className="field"><span>角色 ID</span><input value={character.id} onChange={(event) => setCharacter({ ...character, id: event.target.value })} /></label>
            <label className="field"><span>所属作品</span><select value={character.workId} onChange={(event) => setCharacter({ ...character, workId: event.target.value })}>{works.map((item) => <option key={item.id} value={item.id}>{item.localizedTitle || item.title}</option>)}</select></label>
            <label className="field"><span>名字</span><input value={character.name} onChange={(event) => setCharacter({ ...character, name: event.target.value })} /></label>
            <label className="field"><span>读音</span><input value={character.reading ?? ""} onChange={(event) => setCharacter({ ...character, reading: event.target.value })} /></label>
            <label className="field"><span>生日</span><input value={character.birthday} onChange={(event) => setCharacter({ ...character, birthday: event.target.value as BirthdayCharacterDraft["birthday"] })} /></label>
            <label className="field"><span>性别</span><select value={character.gender} onChange={(event) => setCharacter({ ...character, gender: event.target.value === "male" ? "male" : "female" })}><option value="female">female</option><option value="male">male</option></select></label>
            <label className="field"><span>Bangumi ID</span><input value={character.bangumiId ?? ""} onChange={(event) => setCharacter({ ...character, bangumiId: event.target.value })} /></label>
            <label className="field"><span>来源站 ID</span><input value={character.sourceId ?? ""} onChange={(event) => setCharacter({ ...character, sourceId: event.target.value })} /></label>
            <label className="field field-span"><span>来源链接</span><input value={character.sourceUrl} onChange={(event) => setCharacter({ ...character, sourceUrl: event.target.value })} /></label>
          </div>

          <div className="image-lab">
            <div>
              <p className="eyebrow">头像</p>
              {character.avatar ? <img className="avatar-preview" src={character.avatar} alt="" /> : <div className="avatar-preview empty">头像</div>}
              <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0], "avatar")} />
            </div>
            <div>
              <p className="eyebrow">大图</p>
              {character.image ? <img className="portrait-preview" src={character.image} alt="" /> : <div className="portrait-preview empty">大图</div>}
              <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0], "image")} />
            </div>
          </div>

          <label className="field"><span>本机图片路径</span><input value={sourcePath} onChange={(event) => setSourcePath(event.target.value)} placeholder="D:\\素材\\角色.png 或 /mnt/d/素材/角色.png" /></label>
          <div className="actions">
            <button className="secondary-button" type="button" onClick={() => void handleCopyImage("image")}>导入为大图</button>
            <button className="secondary-button" type="button" onClick={() => void handleCopyImage("avatar")}>导入为头像</button>
          </div>

          <div className="crop-box">
            <p className="eyebrow">头像裁切</p>
            <div className="grid-form">
              <label className="field"><span>X</span><input type="number" value={crop.x} onChange={(event) => setCrop({ ...crop, x: Number(event.target.value) })} /></label>
              <label className="field"><span>Y</span><input type="number" value={crop.y} onChange={(event) => setCrop({ ...crop, y: Number(event.target.value) })} /></label>
              <label className="field"><span>Size</span><input type="number" value={crop.size} onChange={(event) => setCrop({ ...crop, size: Number(event.target.value) })} /></label>
            </div>
            <button className="secondary-button" type="button" onClick={() => void handleCrop()}>从大图裁切头像</button>
          </div>

          <div className="actions">
            <button className="primary-button" type="button" onClick={handleSaveCharacter}>保存角色</button>
            <button className="secondary-button danger" type="button" onClick={handleDeleteCharacter}>删除角色</button>
          </div>
          {message ? <p className="hint">{message}</p> : null}
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Run UI test and manager build**

Run:

```bash
pnpm test -- tests/manager-birthday-manager.test.ts
pnpm --filter @maki/manager build
```

Expected: PASS.

- [ ] **Step 6: Commit birthday manager UI**

Run:

```bash
git add manager/src/App.tsx manager/src/pages/BirthdayManager.tsx tests/manager-birthday-manager.test.ts
git commit -m "feat: add birthday manager ui"
```

## Task 6: Upgrade Manager Visual Shell

**Files:**
- Modify: `manager/src/main.tsx`
- Modify: `tests/manager-birthday-manager.test.ts`

- [ ] **Step 1: Add UI style contract assertions**

Extend `tests/manager-birthday-manager.test.ts`:

```ts
  it("uses the refreshed glass control-room manager shell", async () => {
    const styleSource = await fs.readFile("manager/src/main.tsx", "utf8");

    expect(styleSource).toContain("backdrop-filter");
    expect(styleSource).toContain("birthday-workspace");
    expect(styleSource).toContain("hero-panel");
    expect(styleSource).toContain("stat-strip");
    expect(styleSource).toContain("character-card");
  });
```

- [ ] **Step 2: Run style test and verify it fails**

Run:

```bash
pnpm test -- tests/manager-birthday-manager.test.ts
```

Expected: FAIL until styles are added.

- [ ] **Step 3: Replace the inline manager CSS**

In `manager/src/main.tsx`, keep the React mounting code and replace the `<style>{`...`}</style>` content with a refined version that includes:

```css
:root {
  color: #2b251f;
  background:
    radial-gradient(circle at 12% 8%, rgba(255, 219, 162, 0.72), transparent 30%),
    radial-gradient(circle at 86% 18%, rgba(129, 186, 178, 0.34), transparent 28%),
    linear-gradient(135deg, #f7efe2 0%, #eadcc8 48%, #f8f3ea 100%);
  font-family: "Segoe UI", "PingFang SC", "Noto Sans SC", sans-serif;
}

.shell {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  min-height: 100vh;
  gap: 22px;
  padding: 22px;
}

.sidebar,
.panel {
  background: rgba(255, 250, 243, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 24px 70px rgba(72, 49, 27, 0.12);
  backdrop-filter: blur(26px);
}

.sidebar {
  border-radius: 32px;
  color: #4a3828;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.brand {
  border-radius: 24px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(69, 47, 31, 0.95), rgba(143, 99, 53, 0.9));
  color: #fff6ea;
  font-size: 1.22rem;
  font-weight: 800;
}

.nav {
  border: 1px solid rgba(107, 77, 45, 0.08);
  border-radius: 18px;
  padding: 12px 14px;
  color: #5b4937;
  background: rgba(255, 255, 255, 0.36);
  cursor: pointer;
  text-align: left;
  transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.nav.active {
  transform: translateX(6px);
  color: #fff7ec;
  background: linear-gradient(135deg, #6c4a2d, #c68b4f);
  box-shadow: 0 14px 28px rgba(117, 74, 34, 0.22);
}

.main-panel {
  min-width: 0;
}

.panel {
  border-radius: 30px;
  padding: 22px;
}

.hero-panel,
.stat-strip,
.birthday-workspace,
.character-grid,
.image-lab {
  display: grid;
  gap: 16px;
}

.hero-panel {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.stat-strip {
  grid-template-columns: repeat(4, minmax(82px, 1fr));
}

.stat-strip div,
.meta-grid div,
.content-item {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.46);
}

.stat-strip dd {
  font-size: 1.4rem;
  font-weight: 900;
}

.birthday-workspace {
  grid-template-columns: 250px minmax(320px, 0.78fr) minmax(360px, 1fr);
  align-items: start;
}

.work-list,
.character-grid {
  display: grid;
  gap: 10px;
}

.work-tab,
.character-card {
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.42);
  color: inherit;
  cursor: pointer;
}

.work-tab {
  padding: 12px;
  text-align: left;
}

.work-tab.active {
  background: rgba(91, 67, 43, 0.9);
  color: #fff6ea;
}

.character-grid {
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
}

.character-card {
  padding: 10px;
  display: grid;
  justify-items: center;
  gap: 7px;
}

.character-card img,
.avatar-preview {
  width: 74px;
  height: 74px;
  border-radius: 22px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.portrait-preview {
  width: 100%;
  max-height: 260px;
  border-radius: 24px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.36);
}

.image-lab {
  grid-template-columns: 130px minmax(0, 1fr);
}

.danger {
  color: #8f2d20;
  border-color: rgba(143, 45, 32, 0.32);
}
```

Preserve existing generic classes such as `.field`, `.grid-form`, `.actions`, `.primary-button`, `.secondary-button`, `.pill`, `.error`, `.hint`, `.preview`, `.overlay`, and responsive rules.

- [ ] **Step 4: Run manager UI tests and build**

Run:

```bash
pnpm test -- tests/manager-birthday-manager.test.ts
pnpm --filter @maki/manager build
```

Expected: PASS.

- [ ] **Step 5: Commit manager shell refresh**

Run:

```bash
git add manager/src/main.tsx tests/manager-birthday-manager.test.ts
git commit -m "style: refresh local manager shell"
```

## Task 7: Full Verification

**Files:**
- No new files unless fixes are required by failing checks.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
pnpm test -- tests/character-birthdays.test.ts tests/character-birthday-calendar.test.ts tests/manager-api.test.ts tests/manager-birthday-manager.test.ts
python3 -m unittest tests/test_character_avatar_crop.py
```

Expected: PASS.

- [ ] **Step 2: Run full unit tests**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 3: Build manager**

Run:

```bash
pnpm --filter @maki/manager build
```

Expected: PASS and writes `manager/dist`.

- [ ] **Step 4: Build public site**

Run:

```bash
pnpm build
```

Expected: PASS and writes `dist`.

- [ ] **Step 5: Validate public output**

Run:

```bash
pnpm run validate:public
```

Expected: PASS.

- [ ] **Step 6: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intended source/test changes are tracked or staged. Existing untracked preview and temporary files remain untracked and must not be added.

- [ ] **Step 7: Commit final fixes if any**

If verification required fixes, commit only those files:

```bash
git add <fixed-source-files>
git commit -m "fix: stabilize birthday manager"
```

## Self-Review

- Spec coverage: data CRUD, manager entry, UI refresh, avatar and full image support, upload/path import, manual crop, validation, and tests are each mapped to tasks.
- Placeholder scan: plan does not use placeholder markers for implementation work.
- Type consistency: `BirthdayCharacterDraft`, `BirthdayWorkDraft`, `BirthdayDataFile`, `BirthdayImageKind`, `avatar`, and `image` are named consistently across server, client, JSON, and tests.
