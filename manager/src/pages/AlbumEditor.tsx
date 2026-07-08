import { useEffect, useState } from "react";
import { getContentEntry, saveContentEntry } from "../api";
import { MarkdownPreview } from "../components/MarkdownPreview";
import type { ContentListItem } from "../types";

type AlbumEditorProps = {
  selectedEntry: ContentListItem | null;
};

type AlbumPhoto = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  featured?: boolean;
};

const slugify = (value: string) => {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || `album-${Date.now()}`;
};

const toJsonString = (value: unknown) => JSON.stringify(value, null, 2);

const toLineList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";

const parseLineList = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const parsePhotos = (value: string) => {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("照片列表必须是 JSON 数组。");
  }

  return parsed.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("每张照片都必须是对象。");
    }

    const photo = item as Record<string, unknown>;
    if (typeof photo.src !== "string" || !photo.src.trim()) {
      throw new Error("每张照片都需要 src。");
    }
    if (typeof photo.alt !== "string" || !photo.alt.trim()) {
      throw new Error("每张照片都需要 alt。");
    }

    return {
      src: photo.src.trim(),
      alt: photo.alt.trim(),
      caption: typeof photo.caption === "string" && photo.caption.trim() ? photo.caption.trim() : undefined,
      width: typeof photo.width === "number" ? photo.width : undefined,
      height: typeof photo.height === "number" ? photo.height : undefined,
      featured: photo.featured === true
    } satisfies AlbumPhoto;
  });
};

const removeKnownKeys = (record: Record<string, unknown>, keys: string[]) => {
  const copy = { ...record };
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};

export default function AlbumEditor({ selectedEntry }: AlbumEditorProps) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [cover, setCover] = useState("");
  const [photos, setPhotos] = useState("[]");
  const [tags, setTags] = useState("");
  const [draft, setDraft] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [body, setBody] = useState("");
  const [extras, setExtras] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEntry || selectedEntry.kind !== "albums") {
      return;
    }

    void getContentEntry(selectedEntry.kind, selectedEntry.slug).then((entry) => {
      const frontmatter = entry.frontmatter;
      setSlug(entry.slug);
      setTitle(String(frontmatter.title ?? ""));
      setSummary(String(frontmatter.summary ?? ""));
      setDate(
        typeof frontmatter.date === "string"
          ? frontmatter.date.slice(0, 10)
          : selectedEntry.date?.slice(0, 10) ?? ""
      );
      setLocation(String(frontmatter.location ?? ""));
      setCover(String(frontmatter.cover ?? ""));
      setPhotos(toJsonString(Array.isArray(frontmatter.photos) ? frontmatter.photos : []));
      setTags(toLineList(frontmatter.tags));
      setDraft(frontmatter.draft === true);
      setVisibility(frontmatter.visibility === "private" ? "private" : "public");
      setBody(entry.body.trim());
      setExtras(
        toJsonString(
          removeKnownKeys(frontmatter, [
            "title",
            "summary",
            "date",
            "location",
            "cover",
            "photos",
            "tags",
            "draft",
            "visibility"
          ])
        )
      );
    });
  }, [selectedEntry]);

  const handleSave = async () => {
    try {
      const parsedExtras = extras.trim() ? (JSON.parse(extras) as Record<string, unknown>) : {};
      const parsedPhotos = parsePhotos(photos);
      const nextSlug = slug || slugify(title);
      const frontmatter: Record<string, unknown> = {
        ...parsedExtras,
        title,
        summary,
        date,
        visibility,
        draft,
        photos: parsedPhotos
      };

      if (location.trim()) {
        frontmatter.location = location.trim();
      }
      if (cover.trim()) {
        frontmatter.cover = cover.trim();
      }
      if (tags.trim()) {
        frontmatter.tags = parseLineList(tags);
      }

      const saved = await saveContentEntry({
        kind: "albums",
        slug: nextSlug,
        frontmatter,
        body
      });

      setSlug(saved.slug);
      setExtras(
        toJsonString(
          removeKnownKeys(saved.frontmatter, [
            "title",
            "summary",
            "date",
            "location",
            "cover",
            "photos",
            "tags",
            "draft",
            "visibility"
          ])
        )
      );
      setMessage(`已保存到 ${saved.slug}.md`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page editor-layout">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Album Editor</p>
            <h1>相册编辑器</h1>
          </div>
          <div className="actions">
            <button className="primary-button" onClick={handleSave} type="button">
              保存
            </button>
          </div>
        </div>

        <div className="grid-form">
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="auto-from-title" />
          </label>
          <label className="field">
            <span>标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>日期</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>可见性</span>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value === "private" ? "private" : "public")}
            >
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
          </label>
          <label className="field field-span">
            <span>摘要</span>
            <input value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          <label className="field">
            <span>地点</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="field">
            <span>封面</span>
            <input
              value={cover}
              onChange={(event) => setCover(event.target.value)}
              placeholder="/uploads/albums/cover.jpg"
            />
          </label>
          <label className="field field-span">
            <span>标签</span>
            <textarea className="meta-area" value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input checked={draft} onChange={(event) => setDraft(event.target.checked)} type="checkbox" />
            <span>设为草稿</span>
          </label>
        </div>

        <label className="field">
          <span>照片列表（JSON）</span>
          <textarea className="meta-area" value={photos} onChange={(event) => setPhotos(event.target.value)} />
        </label>

        <label className="field">
          <span>正文</span>
          <textarea className="editor-area" value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <label className="field">
          <span>附加 frontmatter（JSON）</span>
          <textarea className="meta-area" value={extras} onChange={(event) => setExtras(event.target.value)} />
        </label>

        {message ? <p className="hint">{message}</p> : null}
      </section>

      <MarkdownPreview body={body} />
    </main>
  );
}
