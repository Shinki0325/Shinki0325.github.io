import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

export type BirthdayVerificationStatus = "verified" | "todo";
export type BirthdayDate = `${number}${number}-${number}${number}`;
export type BirthdayImageKind = "avatar" | "image";
export type BirthdayGender = "female" | "male";

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
  gender: BirthdayGender;
  avatar: string | null;
  image?: string | null;
  sourceUrl?: string;
  sourceId?: string;
  bangumiId?: string;
  reading?: string;
  verificationStatus: BirthdayVerificationStatus;
};

export type BirthdayWork = BirthdayWorkDraft;

export type BirthdayCharacter = Omit<BirthdayCharacterDraft, "sourceUrl"> & {
  sourceUrl: string;
};

export type BirthdayDataFile = {
  works: BirthdayWork[];
  characters: BirthdayCharacter[];
};

export type BirthdayImageResult = {
  path: string;
  url: string;
  size: number;
};

export type BirthdayAvatarCrop = {
  x: number;
  y: number;
  size: number;
};

const execFileAsync = promisify(execFile);

const managerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(managerRoot, "..");
const dataPath = path.join(repoRoot, "src", "data", "character-birthdays.json");
const publicRoot = path.join(repoRoot, "public");
const birthdayUploadRoot = "public/uploads/character-birthdays";
const avatarRoot = path.join(publicRoot, "uploads", "character-birthdays");
const cropScriptPath = path.join(repoRoot, "scripts", "crop_square_image.py");

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const assertValid: (condition: unknown, message: string) => asserts condition = (
  condition,
  message
) => {
  if (!condition) {
    throw new Error(message);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const nullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const requiredText = (value: unknown, field: string): string => {
  assertValid(typeof value === "string" && value.trim().length > 0, `${field} is required.`);
  return value.trim();
};

const optionalText = (value: unknown, field: string): string | undefined => {
  assertValid(optionalString(value), `${field} must be a string when present.`);
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const validateId = (id: string, field: string) => {
  assertValid(ID_PATTERN.test(id), `${field} must use lowercase letters, numbers, and hyphens.`);
};

const isBirthdayDate = (value: string): value is BirthdayDate => {
  const match = value.match(/^(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);

  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(2024, month, 0).getDate();
};

const validateBirthday = (birthday: unknown): BirthdayDate => {
  assertValid(typeof birthday === "string" && isBirthdayDate(birthday), "birthday must be a valid MM-DD date.");
  return birthday;
};

const validateVerificationStatus = (status: unknown): BirthdayVerificationStatus => {
  assertValid(status === "verified" || status === "todo", "verificationStatus must be verified or todo.");
  return status;
};

const validateGender = (gender: unknown): BirthdayGender => {
  assertValid(gender === "female" || gender === "male", "gender must be female or male.");
  return gender;
};

const validateBangumiId = (bangumiId: string | undefined) => {
  assertValid(bangumiId === undefined || /^\d+$/.test(bangumiId), "bangumiId must be numeric when present.");
};

const normalizeWindowsPath = (inputPath: string) => {
  const windowsPathMatch = inputPath.match(/^([A-Za-z]):[\\/](.*)$/);
  if (!windowsPathMatch) {
    return inputPath;
  }

  const [, drive, remainder] = windowsPathMatch;
  return `/mnt/${drive.toLowerCase()}/${remainder.replaceAll("\\", "/")}`;
};

const toRelativePosixPath = (baseDir: string, targetPath: string) =>
  path.relative(baseDir, targetPath).replaceAll(path.sep, "/");

const toPublicUrl = async (destinationPath: string): Promise<BirthdayImageResult> => {
  const relativePath = toRelativePosixPath(publicRoot, destinationPath);

  return {
    path: relativePath,
    url: `/${relativePath}`,
    size: (await fs.stat(destinationPath)).size
  };
};

const isWithinDirectory = (root: string, targetPath: string) => {
  const relativePath = path.relative(root, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
};

const getImageDestination = (workId: string, characterId: string, kind: BirthdayImageKind) => {
  validateId(workId, "workId");
  validateId(characterId, "characterId");
  assertValid(kind === "avatar" || kind === "image", "kind must be avatar or image.");

  const filename = kind === "avatar" ? `${characterId}.webp` : `${characterId}-full.webp`;
  const destinationPath = path.resolve(avatarRoot, workId, filename);

  assertValid(isWithinDirectory(avatarRoot, destinationPath), `Invalid ${birthdayUploadRoot} destination.`);

  return destinationPath;
};

const sortBirthdayData = (data: BirthdayDataFile): BirthdayDataFile => ({
  works: [...data.works].sort((a, b) => a.id.localeCompare(b.id, "en")),
  characters: [...data.characters].sort((a, b) => {
    const workOrder = a.workId.localeCompare(b.workId, "en");
    if (workOrder !== 0) {
      return workOrder;
    }

    const birthdayOrder = a.birthday.localeCompare(b.birthday, "en");
    if (birthdayOrder !== 0) {
      return birthdayOrder;
    }

    return a.name.localeCompare(b.name, "zh-Hans-CN");
  })
});

const validateWorkDraft = (draft: BirthdayWorkDraft): BirthdayWork => {
  const id = requiredText(draft.id, "work id");
  validateId(id, "work id");

  const title = requiredText(draft.title, "work title");
  const sourceUrl = requiredText(draft.sourceUrl, "work sourceUrl");
  const localizedTitle = optionalText(draft.localizedTitle, "work localizedTitle");

  return {
    id,
    title,
    ...(localizedTitle ? { localizedTitle } : {}),
    sourceUrl
  };
};

const validateCharacterDraft = (
  draft: BirthdayCharacterDraft,
  works: BirthdayWork[]
): BirthdayCharacter => {
  const id = requiredText(draft.id, "character id");
  validateId(id, "character id");

  const workId = requiredText(draft.workId, "character workId");
  validateId(workId, "character workId");

  const work = works.find((item) => item.id === workId);
  assertValid(work, `workId must reference an existing work: ${workId}.`);

  const sourceUrl = draft.sourceUrl?.trim() || work.sourceUrl;
  assertValid(sourceUrl === work.sourceUrl, "character sourceUrl must match the selected work sourceUrl.");

  const sourceId = optionalText(draft.sourceId, "character sourceId");
  const bangumiId = optionalText(draft.bangumiId, "character bangumiId");
  const reading = optionalText(draft.reading, "character reading");
  validateBangumiId(bangumiId);

  assertValid(nullableString(draft.avatar), "character avatar must be null or a string.");
  assertValid(
    draft.image === undefined || nullableString(draft.image),
    "character image must be null or a string when present."
  );

  return {
    id,
    name: requiredText(draft.name, "character name"),
    workId,
    birthday: validateBirthday(draft.birthday),
    gender: validateGender(draft.gender),
    avatar: draft.avatar,
    sourceUrl,
    verificationStatus: validateVerificationStatus(draft.verificationStatus),
    ...(draft.image !== undefined ? { image: draft.image } : {}),
    ...(sourceId ? { sourceId } : {}),
    ...(bangumiId ? { bangumiId } : {}),
    ...(reading ? { reading } : {})
  };
};

const validateBirthdayData = (data: unknown): BirthdayDataFile => {
  assertValid(isRecord(data), "birthday data must be an object.");
  assertValid(Array.isArray(data.works), "birthday data works must be an array.");
  assertValid(Array.isArray(data.characters), "birthday data characters must be an array.");

  const works = data.works.map((work, index) => {
    assertValid(isRecord(work), `works[${index}] must be an object.`);
    return validateWorkDraft(work as BirthdayWorkDraft);
  });

  const workIds = new Set<string>();
  for (const work of works) {
    assertValid(!workIds.has(work.id), `duplicate work id: ${work.id}.`);
    workIds.add(work.id);
  }

  const characters = data.characters.map((character, index) => {
    assertValid(isRecord(character), `characters[${index}] must be an object.`);
    return validateCharacterDraft(character as BirthdayCharacterDraft, works);
  });

  const characterIds = new Set<string>();
  for (const character of characters) {
    assertValid(!characterIds.has(character.id), `duplicate character id: ${character.id}.`);
    characterIds.add(character.id);
  }

  return sortBirthdayData({ works, characters });
};

export const readBirthdayData = async (): Promise<BirthdayDataFile> => {
  const source = await fs.readFile(dataPath, "utf8");
  return validateBirthdayData(JSON.parse(source));
};

export const writeBirthdayData = async (data: BirthdayDataFile): Promise<BirthdayDataFile> => {
  const sortedData = validateBirthdayData(data);
  await fs.writeFile(dataPath, `${JSON.stringify(sortedData, null, 2)}\n`, "utf8");
  return sortedData;
};

export const getBirthdayStats = (data: BirthdayDataFile) => {
  const characterCountByWork = data.characters.reduce<Record<string, number>>((counts, character) => {
    counts[character.workId] = (counts[character.workId] ?? 0) + 1;
    return counts;
  }, {});

  return {
    workCount: data.works.length,
    characterCount: data.characters.length,
    verifiedCount: data.characters.filter((character) => character.verificationStatus === "verified").length,
    todoCount: data.characters.filter((character) => character.verificationStatus === "todo").length,
    characterCountByWork
  };
};

export const saveBirthdayWork = async (draft: BirthdayWorkDraft) => {
  const data = await readBirthdayData();
  const work = validateWorkDraft(draft);
  const works = data.works.filter((item) => item.id !== work.id);

  return writeBirthdayData({
    works: [...works, work],
    characters: data.characters
  });
};

export const deleteBirthdayWork = async (id: string) => {
  const data = await readBirthdayData();
  const workId = requiredText(id, "work id");
  validateId(workId, "work id");
  assertValid(
    !data.characters.some((character) => character.workId === workId),
    `Cannot delete work ${workId} while characters reference it.`
  );

  return writeBirthdayData({
    works: data.works.filter((work) => work.id !== workId),
    characters: data.characters
  });
};

export const saveBirthdayCharacter = async (draft: BirthdayCharacterDraft) => {
  const data = await readBirthdayData();
  const character = validateCharacterDraft(draft, data.works);
  const characters = data.characters.filter((item) => item.id !== character.id);

  return writeBirthdayData({
    works: data.works,
    characters: [...characters, character]
  });
};

export const deleteBirthdayCharacter = async (id: string) => {
  const data = await readBirthdayData();
  const characterId = requiredText(id, "character id");
  validateId(characterId, "character id");

  return writeBirthdayData({
    works: data.works,
    characters: data.characters.filter((character) => character.id !== characterId)
  });
};

export const copyBirthdayImage = async (
  sourcePath: string,
  workId: string,
  characterId: string,
  kind: BirthdayImageKind
): Promise<BirthdayImageResult> => {
  const sourceFile = path.resolve(normalizeWindowsPath(sourcePath.trim()));
  const stat = await fs.stat(sourceFile);
  assertValid(stat.isFile(), "Source path must be a file.");

  const destinationPath = getImageDestination(workId, characterId, kind);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourceFile, destinationPath);

  return toPublicUrl(destinationPath);
};

export const saveUploadedBirthdayImage = async (
  buffer: Buffer,
  workId: string,
  characterId: string,
  kind: BirthdayImageKind
): Promise<BirthdayImageResult> => {
  const destinationPath = getImageDestination(workId, characterId, kind);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.writeFile(destinationPath, buffer);

  return toPublicUrl(destinationPath);
};

export const cropBirthdayAvatar = async (
  sourceUrl: string,
  workId: string,
  characterId: string,
  crop: BirthdayAvatarCrop
): Promise<BirthdayImageResult> => {
  const sourcePath = path.resolve(publicRoot, sourceUrl.replace(/^\/+/, ""));
  assertValid(isWithinDirectory(publicRoot, sourcePath), "Invalid sourceUrl path.");
  assertValid(Number.isFinite(crop.x), "crop x must be a finite number.");
  assertValid(Number.isFinite(crop.y), "crop y must be a finite number.");
  assertValid(Number.isFinite(crop.size) && crop.size > 0, "crop size must be a positive number.");

  const destinationPath = getImageDestination(workId, characterId, "avatar");
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await execFileAsync("python3", [
    cropScriptPath,
    sourcePath,
    destinationPath,
    String(crop.x),
    String(crop.y),
    String(crop.size)
  ]);

  return toPublicUrl(destinationPath);
};
