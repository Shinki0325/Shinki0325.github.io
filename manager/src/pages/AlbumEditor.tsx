import { useEffect, useState } from "react";
import { cropAssetImage, getContentEntry, getContentList, getImageHostStatus, saveContentEntry, uploadAssetImage } from "../api";
import { ImageUploadCropper } from "../components/ImageUploadCropper";
import { MarkdownPreview } from "../components/MarkdownPreview";
import type { AssetImageCrop, ImageHostStatus } from "../types";
import type { ContentListItem } from "../types";

type AlbumEditorProps = {
  selectedEntry: ContentListItem | null;
};

type AlbumPhoto = {
  url: string;
  originalUrl?: string;
  alt: string;
  caption?: string;
  credit?: string;
  relatedReferences?: string[];
  relatedArticles?: string[];
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

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

const toLineList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";

const parseLineList = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const stringifyLineList = (value: string[] | undefined) => (value ?? []).join("\n");

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
    if (typeof photo.url !== "string" || !photo.url.trim()) {
      throw new Error("每张照片都需要 url。");
    }
    if (typeof photo.alt !== "string" || !photo.alt.trim()) {
      throw new Error("每张照片都需要 alt。");
    }

      return {
        url: photo.url.trim(),
        originalUrl: typeof photo.originalUrl === "string" && photo.originalUrl.trim() ? photo.originalUrl.trim() : undefined,
        alt: photo.alt.trim(),
        caption: typeof photo.caption === "string" && photo.caption.trim() ? photo.caption.trim() : undefined,
        credit: typeof photo.credit === "string" && photo.credit.trim() ? photo.credit.trim() : undefined,
        relatedReferences: Array.isArray(photo.relatedReferences)
          ? photo.relatedReferences.map((item) => String(item))
          : [],
        relatedArticles: Array.isArray(photo.relatedArticles)
          ? photo.relatedArticles.map((item) => String(item))
          : []
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

const sanitizePhotos = (items: AlbumPhoto[]) =>
  items.map((photo) => ({
    url: photo.url.trim(),
    ...(photo.originalUrl?.trim() ? { originalUrl: photo.originalUrl.trim() } : {}),
    alt: photo.alt.trim(),
    ...(photo.caption?.trim() ? { caption: photo.caption.trim() } : {}),
    ...(photo.credit?.trim() ? { credit: photo.credit.trim() } : {}),
    ...(photo.relatedReferences?.length ? { relatedReferences: photo.relatedReferences } : {}),
    ...(photo.relatedArticles?.length ? { relatedArticles: photo.relatedArticles } : {})
  }));

const NEW_ALBUM_VALUE = "__new_album__";

export default function AlbumEditor({ selectedEntry }: AlbumEditorProps) {
  const [albumItems, setAlbumItems] = useState<ContentListItem[]>([]);
  const [activeAlbumSlug, setActiveAlbumSlug] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [cover, setCover] = useState("");
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [tags, setTags] = useState("");
  const [relatedArticles, setRelatedArticles] = useState("");
  const [relatedReferences, setRelatedReferences] = useState("");
  const [draft, setDraft] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "hidden">("public");
  const [body, setBody] = useState("");
  const [extras, setExtras] = useState("{}");
  const [imageHostStatus, setImageHostStatus] = useState<ImageHostStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getImageHostStatus().then(setImageHostStatus).catch(() => setImageHostStatus(null));
  }, []);

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setSummary("");
    setDate("");
    setLocation("");
    setCover("");
    setPhotos([]);
    setTags("");
    setRelatedArticles("");
    setRelatedReferences("");
    setDraft(false);
    setPinned(false);
    setVisibility("public");
    setBody("");
    setExtras("{}");
  };

  const loadAlbumList = async () => {
    const items = await getContentList("albums");
    setAlbumItems(items);
    return items;
  };

  const loadAlbumEntry = async (albumSlug: string) => {
    const entry = await getContentEntry("albums", albumSlug);
    const frontmatter = entry.frontmatter;
    setSlug(entry.slug);
    setTitle(String(frontmatter.title ?? ""));
    setSummary(String(frontmatter.summary ?? ""));
    setDate(
      typeof frontmatter.date === "string"
        ? frontmatter.date.slice(0, 10)
        : albumItems.find((item) => item.slug === albumSlug)?.date?.slice(0, 10) ?? ""
    );
    setLocation(String(frontmatter.location ?? ""));
    setCover(String(frontmatter.cover ?? ""));
    setPhotos(parsePhotos(toJsonString(Array.isArray(frontmatter.photos) ? frontmatter.photos : [])));
    setTags(toLineList(frontmatter.tags));
    setRelatedArticles(toLineList(frontmatter.relatedArticles));
    setRelatedReferences(toLineList(frontmatter.relatedReferences));
    setDraft(frontmatter.draft === true);
    setPinned(frontmatter.pinned === true);
    setVisibility(frontmatter.visibility === "hidden" ? "hidden" : "public");
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
          "relatedArticles",
          "relatedReferences",
          "draft",
          "pinned",
          "visibility"
        ])
      )
    );
  };

  useEffect(() => {
    void loadAlbumList().catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!selectedEntry || selectedEntry.kind !== "albums") {
      return;
    }

    setActiveAlbumSlug(selectedEntry.slug);
  }, [selectedEntry]);

  useEffect(() => {
    if (!activeAlbumSlug) {
      return;
    }

    void loadAlbumEntry(activeAlbumSlug).catch((error: Error) => setMessage(error.message));
  }, [activeAlbumSlug]);

  const handleSelectAlbum = (value: string) => {
    if (value === NEW_ALBUM_VALUE) {
      setActiveAlbumSlug("");
      resetForm();
      setMessage("已切换到新建相册。");
      return;
    }

    setActiveAlbumSlug(value);
  };

  const handleSave = async () => {
    try {
      const parsedExtras = extras.trim() ? (JSON.parse(extras) as Record<string, unknown>) : {};
      const nextSlug = slug || slugify(title);
      const frontmatter: Record<string, unknown> = {
        ...parsedExtras,
        title,
        summary,
        date,
        visibility,
        draft,
        pinned,
        photos: sanitizePhotos(photos)
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
      if (relatedArticles.trim()) {
        frontmatter.relatedArticles = parseLineList(relatedArticles);
      }
      if (relatedReferences.trim()) {
        frontmatter.relatedReferences = parseLineList(relatedReferences);
      }

      const saved = await saveContentEntry({
        kind: "albums",
        slug: nextSlug,
        frontmatter,
        body
      });

      setSlug(saved.slug);
      setActiveAlbumSlug(saved.slug);
      void loadAlbumList().catch(() => undefined);
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
            "relatedArticles",
            "relatedReferences",
            "draft",
            "pinned",
            "visibility"
          ])
        )
      );
      setMessage(`已保存到 ${saved.slug}.md`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleUploadCover = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const item = await uploadAssetImage(dataUrl, "albums", `${slug || slugify(title)}-cover`);
      setCover(item.url);
      setMessage(`已上传封面 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCropCover = async (crop: AssetImageCrop) => {
    if (!cover) {
      return;
    }

    try {
      const item = await cropAssetImage(cover, "albums", `${slug || slugify(title)}-cover`, crop, 1200, 800);
      setCover(item.url);
      setMessage(`已裁切封面 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const item = await uploadAssetImage(dataUrl, "albums/photos", `${slug || slugify(title)}-${Date.now()}`);
      const nextPhotos = [
        ...photos,
        {
          url: item.url,
          originalUrl: item.originalUrl,
          alt: title || slug || "相册照片",
          relatedReferences: [],
          relatedArticles: []
        } satisfies AlbumPhoto
      ];
      setPhotos(nextPhotos);
      setMessage(`已追加照片 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const updatePhoto = (index: number, key: keyof AlbumPhoto, value: string) => {
    setPhotos((current) =>
      current.map((photo, photoIndex) =>
        photoIndex === index
          ? {
              ...photo,
              [key]: value
            }
          : photo
      )
    );
  };

  const updatePhotoLineList = (index: number, key: "relatedReferences" | "relatedArticles", value: string) => {
    setPhotos((current) =>
      current.map((photo, photoIndex) =>
        photoIndex === index
          ? {
              ...photo,
              [key]: parseLineList(value)
            }
          : photo
      )
    );
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <main className="page editor-layout">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">相册编辑</p>
            <h1>相册编辑器</h1>
          </div>
          <div className="actions">
            <button className="primary-button" onClick={handleSave} type="button">
              保存
            </button>
          </div>
        </div>

        <div className="album-editor__selector">
          <label className="field">
            <span>选择相册</span>
            <select value={activeAlbumSlug || NEW_ALBUM_VALUE} onChange={(event) => handleSelectAlbum(event.target.value)}>
              <option value={NEW_ALBUM_VALUE}>新建相册</option>
              {albumItems.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title || item.slug}
                </option>
              ))}
            </select>
          </label>
          <p className="hint">
            共 {albumItems.length} 个相册；选择后会载入对应内容，也可以切到“新建相册”从空白开始。
          </p>
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
              onChange={(event) => setVisibility(event.target.value === "hidden" ? "hidden" : "public")}
            >
              <option value="public">公开</option>
              <option value="hidden">隐藏</option>
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
          <div className="field-span album-editor__image-workbench">
            <ImageUploadCropper
              aspectRatio={1.5}
              cropLabel="裁切封面"
              hint="上传封面后可直接拖框裁切，输出为 1200x800 WebP。"
              imageUrl={cover}
              onCrop={handleCropCover}
              onUpload={handleUploadCover}
              title="封面上传 / 裁切"
              uploadLabel="上传封面"
            />
            <div className="image-cropper">
              <div className="toolbar">
                <div>
                  <dt>照片上传</dt>
                  <p className="hint">
                    上传后自动追加到照片列表；
                    {imageHostStatus?.enabled ? "图床原图会写入 originalUrl。" : "未配置图床时只生成本地 WebP。"}
                  </p>
                </div>
                <label className="secondary-button birthday-manager__upload-button">
                  上传照片
                  <input accept="image/webp,image/png,image/jpeg" type="file" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUploadPhoto(file);
                    }
                  }} />
                </label>
              </div>
              <dd>{photos.length} 张照片</dd>
            </div>
          </div>
          <label className="field field-span">
            <span>标签</span>
            <textarea className="meta-area" value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>关联文稿</span>
            <textarea
              className="meta-area"
              value={relatedArticles}
              onChange={(event) => setRelatedArticles(event.target.value)}
            />
          </label>
          <label className="field field-span">
            <span>关联资料页</span>
            <textarea
              className="meta-area"
              value={relatedReferences}
              onChange={(event) => setRelatedReferences(event.target.value)}
            />
          </label>
          <label className="checkbox-field">
            <input checked={draft} onChange={(event) => setDraft(event.target.checked)} type="checkbox" />
            <span>设为草稿</span>
          </label>
          <label className="checkbox-field">
            <input checked={pinned} onChange={(event) => setPinned(event.target.checked)} type="checkbox" />
            <span>置顶展示</span>
          </label>
        </div>

        <section className="stack">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Photos</p>
              <h2>照片列表</h2>
            </div>
            <span className="pill muted">{photos.length} 张</span>
          </div>
          <div className="album-editor__photo-grid">
            {photos.map((photo, index) => (
              <article className="content-item album-editor__photo-card" key={`${photo.url}-${index}`}>
                {photo.url ? <img alt={photo.alt || `照片 ${index + 1}`} src={photo.url} /> : null}
                <div className="grid-form">
                  <label className="field field-span">
                    <span>预览 URL</span>
                    <input value={photo.url} onChange={(event) => updatePhoto(index, "url", event.target.value)} />
                  </label>
                  <label className="field field-span">
                    <span>图床原图 URL</span>
                    <input
                      value={photo.originalUrl ?? ""}
                      onChange={(event) => updatePhoto(index, "originalUrl", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Alt</span>
                    <input value={photo.alt} onChange={(event) => updatePhoto(index, "alt", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Caption</span>
                    <input
                      value={photo.caption ?? ""}
                      onChange={(event) => updatePhoto(index, "caption", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Credit</span>
                    <input
                      value={photo.credit ?? ""}
                      onChange={(event) => updatePhoto(index, "credit", event.target.value)}
                    />
                  </label>
                  <label className="field field-span">
                    <span>关联文稿</span>
                    <textarea
                      className="meta-area meta-area--compact"
                      value={stringifyLineList(photo.relatedArticles)}
                      onChange={(event) => updatePhotoLineList(index, "relatedArticles", event.target.value)}
                    />
                    <small>每行一个文章 slug。</small>
                  </label>
                  <label className="field field-span">
                    <span>关联资料页</span>
                    <textarea
                      className="meta-area meta-area--compact"
                      value={stringifyLineList(photo.relatedReferences)}
                      onChange={(event) => updatePhotoLineList(index, "relatedReferences", event.target.value)}
                    />
                    <small>每行一个资料页 slug。</small>
                  </label>
                </div>
                <button className="secondary-button" onClick={() => removePhoto(index)} type="button">
                  删除照片
                </button>
              </article>
            ))}
          </div>
          {photos.length === 0 ? <p className="hint">暂无照片，使用上方“上传照片”添加。</p> : null}
        </section>

        <label className="field">
          <span>正文</span>
          <textarea className="editor-area" value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <details className="advanced-panel">
          <summary>高级 frontmatter</summary>
          <p className="hint">常用字段已经在上面拆成表单；只有需要保留额外字段时再改这里。</p>
          <label className="field">
            <span>额外字段 JSON</span>
            <textarea className="meta-area" value={extras} onChange={(event) => setExtras(event.target.value)} />
          </label>
        </details>

        {message ? <p className="hint">{message}</p> : null}
      </section>

      <MarkdownPreview body={body} />
    </main>
  );
}
