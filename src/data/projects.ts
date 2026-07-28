export const PROJECT_TERMINAL_URL =
  "https://shinki0325.github.io/bishoujo-game-data-terminal/" as const;

export type ProjectEntry = Readonly<{
  id: string;
  title: string;
  summary: string;
  href: `https://${string}`;
  status: "live";
  tags: readonly string[];
  image?: string;
  external: true;
}>;

const requireText = (value: string, field: keyof ProjectEntry) => {
  if (!value.trim()) {
    throw new Error(`Project ${field} must not be empty.`);
  }
};

export const validateProjectRegistry = (
  entries: readonly ProjectEntry[],
): readonly ProjectEntry[] => {
  if (entries.length === 0) {
    throw new Error("Project registry must not be empty.");
  }

  const ids = new Set<string>();

  for (const entry of entries) {
    requireText(entry.id, "id");
    requireText(entry.title, "title");
    requireText(entry.summary, "summary");
    requireText(entry.href, "href");

    if (entry.external !== true) {
      throw new Error(`Project ${entry.id || "entry"} must be external.`);
    }

    if (ids.has(entry.id)) {
      throw new Error(`Duplicate project id: ${entry.id}`);
    }
    ids.add(entry.id);

    let url: URL;
    try {
      url = new URL(entry.href);
    } catch {
      throw new Error(`Invalid project href: ${entry.href}`);
    }

    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:") {
      throw new Error(`Project href must use HTTPS: ${entry.href}`);
    }
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
      throw new Error(`Project href must not use localhost: ${entry.href}`);
    }
  }

  return entries;
};

const registry = validateProjectRegistry([
  {
    id: "bishoujo-game-data-terminal",
    title: "美少女游戏数据终端",
    summary: "以作品数据、筛选与分层视图整理美少女游戏资料。",
    href: PROJECT_TERMINAL_URL,
    status: "live",
    tags: ["数据终端", "美少女游戏"],
    external: true,
  },
] satisfies readonly ProjectEntry[]);

export const projects: readonly ProjectEntry[] = Object.freeze(
  registry.map((entry) =>
    Object.freeze({
      ...entry,
      tags: Object.freeze([...entry.tags]),
    }),
  ),
);
