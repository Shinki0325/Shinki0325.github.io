import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const readAttribute = (tag, name) => {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i"),
  );

  return match?.[1] ?? match?.[2] ?? match?.[3];
};

const findTag = (html, tagName, predicate) => {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  return tags.find(predicate);
};

export const DEFAULT_PUBLIC_ORIGIN = "https://shinki0325.github.io";

const assertRefreshTarget = (value) => {
  if (!value) {
    throw new Error("Missing notes redirect target; expected /portal/.");
  }

  if (value !== "/portal/") {
    throw new Error(`Notes redirect target must be exactly /portal/: ${value}`);
  }
};

const assertCanonicalTarget = (value, publicOrigin) => {
  if (!value) {
    throw new Error("Missing notes canonical target; expected /portal/.");
  }

  let origin;
  try {
    origin = new URL(publicOrigin);
  } catch {
    throw new Error(`Invalid public origin: ${publicOrigin}`);
  }

  if (origin.protocol !== "https:" || origin.origin !== publicOrigin) {
    throw new Error(`Public origin must be an exact HTTPS origin: ${publicOrigin}`);
  }

  const expectedTarget = `${publicOrigin}/portal/`;
  if (value !== expectedTarget) {
    throw new Error(`Notes canonical target must be exactly ${expectedTarget}: ${value}`);
  }
};

const listUnexpectedArtifacts = async (notesRoot) => {
  const entries = await readdir(notesRoot, { withFileTypes: true });
  const unexpected = [];

  const visitDirectory = async (directory, relativeDirectory) => {
    unexpected.push(`${relativeDirectory}/`);
    const children = await readdir(directory, { withFileTypes: true });

    for (const child of children) {
      const childPath = path.join(directory, child.name);
      const relativePath = `${relativeDirectory}/${child.name}`;
      if (child.isDirectory()) {
        await visitDirectory(childPath, relativePath);
      } else if (child.name.toLowerCase().endsWith(".html")) {
        unexpected.push(relativePath);
      }
    }
  };

  for (const entry of entries) {
    const entryPath = path.join(notesRoot, entry.name);
    const relativePath = `notes/${entry.name}`;
    if (entry.isDirectory()) {
      await visitDirectory(entryPath, relativePath);
    } else if (entry.name.toLowerCase().endsWith(".html") && entry.name !== "index.html") {
      unexpected.push(relativePath);
    }
  }

  return unexpected;
};

export const assertNotesRouteArtifacts = async (
  distRoot,
  publicOrigin = DEFAULT_PUBLIC_ORIGIN,
) => {
  const notesRoot = path.join(distRoot, "notes");
  const indexPath = path.join(notesRoot, "index.html");

  let html;
  try {
    html = await readFile(indexPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      throw new Error("Missing notes/index.html redirect artifact.");
    }
    throw error;
  }

  const refreshTag = findTag(
    html,
    "meta",
    (tag) => readAttribute(tag, "http-equiv")?.toLowerCase() === "refresh",
  );
  const refreshContent = refreshTag ? readAttribute(refreshTag, "content") : undefined;
  const refreshTarget = refreshContent?.match(/\burl\s*=\s*(.+?)\s*$/i)?.[1]?.replace(/^['"]|['"]$/g, "");
  assertRefreshTarget(refreshTarget);

  const canonicalTag = findTag(
    html,
    "link",
    (tag) => readAttribute(tag, "rel")?.toLowerCase().split(/\s+/).includes("canonical") ?? false,
  );
  assertCanonicalTarget(
    canonicalTag ? readAttribute(canonicalTag, "href") : undefined,
    publicOrigin,
  );

  const unexpected = await listUnexpectedArtifacts(notesRoot);
  if (unexpected.length > 0) {
    throw new Error(`Unexpected notes route artifacts: ${unexpected.join(", ")}`);
  }
};
