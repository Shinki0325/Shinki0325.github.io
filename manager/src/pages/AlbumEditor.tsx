import { useEffect, useState } from "react";
import { getContentEntry, saveContentEntry } from "../api";
import { MarkdownPreview } from "../components/MarkdownPreview";
import type { ContentListItem } from "../types";

type AlbumEditorProps = {
  selectedEntry: ContentListItem | null;
};

const slugify = (value: string) => {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || `album-${Date.now()}`;
};

const toMultilineList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";

const parseMultilineList = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

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
  const [cover, setCover] = useState("");
  const [photos, setPhotos] = useState("");
  const [tags, setTags] = useState("");
  const [draft, setDraft] = useState(false);
  const [visibility, setVisibility] = useState("public");
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
      setCover(String(frontmatter.cover ?? ""));
      setPhotos(toMultilineList(frontmatter.photos));
      setTags(toMultilineList(frontmatter.tags));
      setDraft(frontmatter.draft === true);
      setVisibility(typeof frontmatter.visibility === "string" ? frontmatter.visibility : "public");
      setBody(entry.body.trim());
      setExtras(
        JSON.stringify(
          removeKnownKeys(frontmatter, [
            "title",
            "summary",
            "date",
            "cover",
            "photos",
            "tags",
            "draft",
            "visibility"
          ]),
          null,
          2
        )
      );
    });
  }, [selectedEntry]);

  const handleSave = async () => {
    try {
      const parsedExtras = extras.trim() ? (JSON.parse(extras) as Record<string, unknown>) : {};
      const nextSlug = slug || slugify(title);
      const frontmatter: Record<string, unknown> = {
        ...parsedExtras,
        title,
        draft,
        visibility
      };

      if (summary.trim()) {
        frontmatter.summary = summary.trim();
      }
      if (date) {
        frontmatter.date = date;
      }
      if (cover.trim()) {
        frontmatter.cover = cover.trim();
      }
      if (photos.trim()) {
        frontmatter.photos = parseMultilineList(photos);
      }
      if (tags.trim()) {
        frontmatter.tags = parseMultilineList(tags);
      }

      const saved = await saveContentEntry({
        kind: "albums",
        slug: nextSlug,
        frontmatter,
        body
      });

      setSlug(saved.slug);
      setMessage(`Saved to ${saved.slug}.md`);
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
            <h1>Album Editor</h1>
          </div>
          <div className="actions">
            <button className="primary-button" onClick={handleSave} type="button">
              Save
            </button>
          </div>
        </div>

        <div className="grid-form">
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="auto-from-title" />
          </label>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Visibility</span>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="unlisted">unlisted</option>
            </select>
          </label>
          <label className="field field-span">
            <span>Summary</span>
            <input value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>Cover</span>
            <input
              value={cover}
              onChange={(event) => setCover(event.target.value)}
              placeholder="/uploads/albums/cover.jpg"
            />
          </label>
          <label className="field field-span">
            <span>Photos</span>
            <textarea
              className="meta-area"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
              placeholder="/uploads/albums/1.jpg"
            />
          </label>
          <label className="field field-span">
            <span>Tags</span>
            <textarea
              className="meta-area"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder={"travel\nfilm"}
            />
          </label>
          <label className="checkbox-field">
            <input checked={draft} onChange={(event) => setDraft(event.target.checked)} type="checkbox" />
            <span>Mark as draft</span>
          </label>
        </div>

        <label className="field">
          <span>Body</span>
          <textarea className="editor-area" value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <label className="field">
          <span>Extra frontmatter (JSON)</span>
          <textarea className="meta-area" value={extras} onChange={(event) => setExtras(event.target.value)} />
        </label>

        {message ? <p className="hint">{message}</p> : null}
      </section>

      <MarkdownPreview body={body} />
    </main>
  );
}
