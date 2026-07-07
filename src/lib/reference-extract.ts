import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { stripUtf8Bom } from "./text-encoding";

// Static builds bundle server modules into a different directory, so resolve
// attachments from the project working directory instead of import.meta.url.
const publicRoot = path.resolve(process.cwd(), "public");

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

export const getTextExtractFromAttachments = (attachments: string[] = [], limit?: number) => {
  const textAttachments = attachments.filter((attachment) => /\.txt$/i.test(attachment));

  if (textAttachments.length === 0) {
    return null;
  }

  const text = normalizeExtract(
    textAttachments
      .map((attachment) => {
        const filePath = toAttachmentPath(attachment);

        if (!filePath || !existsSync(filePath)) {
          return "";
        }

        return normalizeExtract(stripUtf8Bom(readFileSync(filePath, "utf-8")));
      })
      .filter(Boolean)
      .join("\n\n")
  );

  if (!text) {
    return null;
  }

  if (typeof limit === "number" && limit > 0 && text.length > limit) {
    return `${text.slice(0, limit).trimEnd()}...`;
  }

  return text;
};
