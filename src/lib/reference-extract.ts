import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const publicRoot = path.join(projectRoot, "public");

const toAttachmentPath = (href: string) => {
  if (!href.startsWith("/")) {
    return null;
  }

  return path.join(publicRoot, href.slice(1));
};

const normalizeExtract = (value: string) =>
  value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const getTextExtractFromAttachments = (attachments: string[] = [], limit = 1200) => {
  const textAttachment = attachments.find((attachment) => /\.txt$/i.test(attachment));

  if (!textAttachment) {
    return null;
  }

  const filePath = toAttachmentPath(textAttachment);

  if (!filePath || !existsSync(filePath)) {
    return null;
  }

  const text = normalizeExtract(readFileSync(filePath, "utf-8"));

  if (!text) {
    return null;
  }

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
};
