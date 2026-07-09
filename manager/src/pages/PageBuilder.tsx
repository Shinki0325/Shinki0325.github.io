import { useEffect, useState } from "react";
import { cropAssetImage, fetchCloudMusicTrack, getPageConfig, savePageConfig, uploadAssetImage } from "../api";
import { ImageUploadCropper } from "../components/ImageUploadCropper";
import {
  parseHomePageConfig,
  serializeHomePageConfig,
  type HomePageConfigForm,
} from "../lib/homePageConfig";
import type { AssetImageCrop } from "../types";
import type { PageConfigName } from "../types";

const PAGE_OPTIONS: PageConfigName[] = ["home", "references"];
const CONFIG_TABS = [
  { id: "basic", label: "基础信息", description: "品牌、首页文案、社交链接和公告" },
  { id: "background", label: "背景图", description: "主页视频背景和其他页面背景" },
  { id: "music", label: "音乐盒", description: "静态曲库、歌词和封面" }
] as const;

type ConfigTab = (typeof CONFIG_TABS)[number]["id"];

const EMPTY_HOME_FORM: HomePageConfigForm = {
  brandTitle: "",
  brandSuffix: "",
  brandAfter: "",
  heroEyebrow: "",
  heroTitle: "",
  heroDescription: "",
  profileDisplayName: "",
  profileBio: "",
  profileAvatarUrl: "",
  socialGithub: "",
  socialBilibili: "",
  socialEmail: "",
  searchPlaceholder: "",
  announcementText: "",
  homeBackgroundEnabled: true,
  homeBackgroundVideoSrc: "/uploads/backgrounds/home-loop-h264.mp4",
  homeBackgroundPoster: "/uploads/backgrounds/home-loop-poster.jpg",
  backgroundImageText: "",
  musicTracks: [],
  fallbackCover: "",
  idleLyric: "",
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

const toLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const toEditableLines = (value: string) =>
  value.trim()
    ? value.split(/\r?\n/).map((item) => item.trim())
    : [];

const getFilenameFromUrl = (url: string, fallback: string) => {
  const lastPart = url.split("/").filter(Boolean).at(-1) ?? fallback;
  return lastPart.replace(/\.[a-z0-9]+$/i, "") || fallback;
};

const lineListToText = (items: string[]) => items.join("\n");

export default function PageBuilder() {
  const [name, setName] = useState<PageConfigName>("home");
  const [json, setJson] = useState("");
  const [homeSource, setHomeSource] = useState<Record<string, unknown> | null>(null);
  const [homeForm, setHomeForm] = useState<HomePageConfigForm>(EMPTY_HOME_FORM);
  const [isRawMode, setIsRawMode] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<ConfigTab>("basic");
  const [selectedBackgroundUrl, setSelectedBackgroundUrl] = useState("");
  const [manualBackgroundUrl, setManualBackgroundUrl] = useState("");
  const [musicFetchId, setMusicFetchId] = useState("");
  const [fetchingMusicId, setFetchingMusicId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isHomePage = name === "home";

  useEffect(() => {
    void getPageConfig(name)
      .then((config) => {
        setJson(config.json);
        setMessage(null);

        if (config.name !== "home") {
          setHomeSource(null);
          setHomeForm(EMPTY_HOME_FORM);
          setIsRawMode(false);
          return;
        }

        try {
          const parsed = parseHomePageConfig(config.json);
          setHomeSource(parsed.source);
          setHomeForm(parsed.form);
          setSelectedBackgroundUrl(toLines(parsed.form.backgroundImageText)[0] ?? "");
          setIsRawMode(false);
        } catch {
          setHomeSource(null);
          setHomeForm(EMPTY_HOME_FORM);
          setIsRawMode(true);
        }
      })
      .catch((error: Error) => setMessage(error.message));
  }, [name]);

  const updateHomeForm = <K extends keyof HomePageConfigForm>(key: K, value: HomePageConfigForm[K]) => {
    setHomeForm((current) => {
      const next = { ...current, [key]: value };

      if (homeSource) {
        setJson(serializeHomePageConfig(homeSource, next));
      }

      return next;
    });
  };

  const updateMusicTrack = (
    index: number,
    key: keyof HomePageConfigForm["musicTracks"][number],
    value: string
  ) => {
    const nextTracks = homeForm.musicTracks.map((track, trackIndex) =>
      trackIndex === index ? { ...track, [key]: value } : track
    );
    updateHomeForm("musicTracks", nextTracks);
  };

  const addMusicTrack = () => {
    updateHomeForm("musicTracks", [
      ...homeForm.musicTracks,
      {
        id: "",
        title: "",
        artist: "",
        coverUrl: homeForm.fallbackCover,
        audioUrl: "",
        lrc: ""
      }
    ]);
  };

  const removeMusicTrack = (index: number) => {
    updateHomeForm(
      "musicTracks",
      homeForm.musicTracks.filter((_, trackIndex) => trackIndex !== index)
    );
  };

  const fetchMusicTrackById = async (id: string) => {
    const normalizedId = id.trim();
    if (!/^\d+$/.test(normalizedId)) {
      throw new Error("请输入数字歌曲 ID。");
    }

    setFetchingMusicId(normalizedId);
    try {
      return await fetchCloudMusicTrack(normalizedId, homeForm.fallbackCover);
    } finally {
      setFetchingMusicId(null);
    }
  };

  const handleFetchAndAddMusicTrack = async () => {
    try {
      const track = await fetchMusicTrackById(musicFetchId);
      updateHomeForm("musicTracks", [...homeForm.musicTracks, track]);
      setMusicFetchId("");
      setMessage(`已抓取《${track.title}》，检查无误后保存首页配置即可写入本地。`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleRefreshMusicTrack = async (index: number) => {
    try {
      const trackId = homeForm.musicTracks[index]?.id ?? "";
      const track = await fetchMusicTrackById(trackId);
      const nextTracks = homeForm.musicTracks.map((item, itemIndex) => (itemIndex === index ? track : item));
      updateHomeForm("musicTracks", nextTracks);
      setMessage(`已刷新《${track.title}》，检查无误后保存首页配置即可写入本地。`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const updateBackgroundImage = (index: number, value: string) => {
    const nextBackgrounds = toEditableLines(homeForm.backgroundImageText);
    nextBackgrounds[index] = value;
    updateHomeForm("backgroundImageText", lineListToText(nextBackgrounds));
  };

  const handleAddManualBackgroundImage = () => {
    const nextUrl = manualBackgroundUrl.trim();
    if (!nextUrl) {
      setMessage("请先输入背景图 URL。");
      return;
    }

    const nextBackgrounds = [...toLines(homeForm.backgroundImageText), nextUrl];
    updateHomeForm("backgroundImageText", lineListToText(nextBackgrounds));
    setSelectedBackgroundUrl(nextUrl);
    setManualBackgroundUrl("");
    setMessage(`已添加背景图 ${nextUrl}`);
  };

  const removeBackgroundImage = (index: number) => {
    const removed = toEditableLines(homeForm.backgroundImageText)[index];
    const nextBackgrounds = toEditableLines(homeForm.backgroundImageText).filter((_, itemIndex) => itemIndex !== index);
    updateHomeForm("backgroundImageText", lineListToText(nextBackgrounds));
    if (selectedBackgroundUrl === removed) {
      setSelectedBackgroundUrl(nextBackgrounds[0] ?? "");
    }
  };

  const handleUploadMusicCover = async (index: number, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const track = homeForm.musicTracks[index];
      const item = await uploadAssetImage(dataUrl, "music/covers", `music-cover-${track?.id || Date.now()}`);
      updateMusicTrack(index, "coverUrl", item.url);
      setMessage(`已上传曲目封面 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleUploadBackground = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const item = await uploadAssetImage(dataUrl, "ui/backgrounds", `home-background-${Date.now()}`);
      const nextBackgrounds = [...toLines(homeForm.backgroundImageText), item.url];
      updateHomeForm("backgroundImageText", nextBackgrounds.join("\n"));
      setSelectedBackgroundUrl(item.url);
      setMessage(`已上传背景图 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleUploadHomeBackgroundPoster = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const item = await uploadAssetImage(dataUrl, "backgrounds", "home-loop-poster");
      updateHomeForm("homeBackgroundPoster", item.url);
      setMessage(`已上传首页背景海报 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCropHomeBackgroundPoster = async (crop: AssetImageCrop) => {
    if (!homeForm.homeBackgroundPoster) {
      return;
    }

    try {
      const item = await cropAssetImage(
        homeForm.homeBackgroundPoster,
        "backgrounds",
        "home-loop-poster",
        crop,
        1920,
        1080
      );
      updateHomeForm("homeBackgroundPoster", item.url);
      setMessage(`已裁切首页背景海报 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCropBackground = async (crop: AssetImageCrop) => {
    if (!selectedBackgroundUrl) {
      return;
    }

    try {
      const item = await cropAssetImage(
        selectedBackgroundUrl,
        "ui/backgrounds",
        getFilenameFromUrl(selectedBackgroundUrl, `home-background-${Date.now()}`),
        crop,
        1920,
        1080
      );
      const nextBackgrounds = toLines(homeForm.backgroundImageText).map((url) =>
        url === selectedBackgroundUrl ? item.url : url
      );
      updateHomeForm("backgroundImageText", nextBackgrounds.join("\n"));
      setSelectedBackgroundUrl(item.url);
      setMessage(`已裁切背景图 ${item.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleJsonChange = (value: string) => {
    setJson(value);

    if (!isHomePage || !isRawMode) {
      return;
    }

    try {
      const parsed = parseHomePageConfig(value);
      setHomeSource(parsed.source);
      setHomeForm(parsed.form);
      setMessage(null);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleSave = async () => {
    try {
      const nextJson =
        isHomePage && !isRawMode && homeSource ? serializeHomePageConfig(homeSource, homeForm) : json;
      const saved = await savePageConfig(name, nextJson);
      setJson(saved.json);

      if (saved.name === "home") {
        try {
          const parsed = parseHomePageConfig(saved.json);
          setHomeSource(parsed.source);
          setHomeForm(parsed.form);
        } catch {
          setHomeSource(null);
        }
      }

      setMessage(`已保存 ${name}.json`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Page Config</p>
            <h1>页面配置编辑</h1>
          </div>
          <div className="actions">
            {isHomePage ? (
              <button className="secondary-button" onClick={() => setIsRawMode((current) => !current)} type="button">
                {isRawMode ? "切回结构化表单" : "切换到原始 JSON"}
              </button>
            ) : null}
            <button className="primary-button" onClick={handleSave} type="button">
              {isHomePage && !isRawMode ? "保存首页配置" : "保存 JSON"}
            </button>
          </div>
        </div>

        <label className="field">
          <span>页面</span>
          <select value={name} onChange={(event) => setName(event.target.value as PageConfigName)}>
            {PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {isHomePage && !isRawMode ? (
          <>
            <p className="hint">首页支持结构化编辑；如需调整未暴露字段或排查问题，可切回原始 JSON。</p>

            <nav className="page-builder__tabs" aria-label="页面配置模块">
              {CONFIG_TABS.map((tab) => (
                <button
                  className={`page-builder__tab${activeConfigTab === tab.id ? " is-active" : ""}`}
                  key={tab.id}
                  onClick={() => setActiveConfigTab(tab.id)}
                  type="button"
                >
                  <span>{tab.label}</span>
                  <small>{tab.description}</small>
                </button>
              ))}
            </nav>

            {activeConfigTab === "basic" ? (
              <>
            <section className="panel stack">
              <div>
                <p className="eyebrow">Brand</p>
                <h2>品牌标题</h2>
              </div>
              <div className="grid-form">
                <label className="field">
                  <span>标题</span>
                  <input value={homeForm.brandTitle} onChange={(event) => updateHomeForm("brandTitle", event.target.value)} />
                </label>
                <label className="field">
                  <span>连接词</span>
                  <input value={homeForm.brandSuffix} onChange={(event) => updateHomeForm("brandSuffix", event.target.value)} />
                </label>
                <label className="field">
                  <span>尾部文案</span>
                  <input value={homeForm.brandAfter} onChange={(event) => updateHomeForm("brandAfter", event.target.value)} />
                </label>
              </div>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Hero</p>
                <h2>首页主视觉</h2>
              </div>
              <div className="grid-form">
                <label className="field">
                  <span>眉标</span>
                  <input value={homeForm.heroEyebrow} onChange={(event) => updateHomeForm("heroEyebrow", event.target.value)} />
                </label>
                <label className="field field-span">
                  <span>主标题</span>
                  <input value={homeForm.heroTitle} onChange={(event) => updateHomeForm("heroTitle", event.target.value)} />
                </label>
                <label className="field field-span">
                  <span>说明</span>
                  <textarea
                    className="meta-area"
                    value={homeForm.heroDescription}
                    onChange={(event) => updateHomeForm("heroDescription", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>个人卡片</h2>
              </div>
              <div className="grid-form">
                <label className="field">
                  <span>显示名称</span>
                  <input value={homeForm.profileDisplayName} onChange={(event) => updateHomeForm("profileDisplayName", event.target.value)} />
                </label>
                <label className="field">
                  <span>头像链接</span>
                  <input value={homeForm.profileAvatarUrl} onChange={(event) => updateHomeForm("profileAvatarUrl", event.target.value)} />
                </label>
                <label className="field field-span">
                  <span>简介</span>
                  <textarea
                    className="meta-area"
                    value={homeForm.profileBio}
                    onChange={(event) => updateHomeForm("profileBio", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Links</p>
                <h2>搜索栏与社交按钮</h2>
              </div>
              <div className="grid-form">
                <label className="field field-span">
                  <span>搜索框占位文案</span>
                  <input value={homeForm.searchPlaceholder} onChange={(event) => updateHomeForm("searchPlaceholder", event.target.value)} />
                </label>
                <label className="field">
                  <span>GitHub</span>
                  <input value={homeForm.socialGithub} onChange={(event) => updateHomeForm("socialGithub", event.target.value)} />
                </label>
                <label className="field">
                  <span>Bilibili</span>
                  <input value={homeForm.socialBilibili} onChange={(event) => updateHomeForm("socialBilibili", event.target.value)} />
                </label>
                <label className="field field-span">
                  <span>邮箱</span>
                  <input value={homeForm.socialEmail} onChange={(event) => updateHomeForm("socialEmail", event.target.value)} />
                </label>
              </div>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Announcement</p>
                <h2>公告</h2>
              </div>
              <label className="field">
                <span>公告列表</span>
                <textarea
                  className="meta-area"
                  value={homeForm.announcementText}
                  onChange={(event) => updateHomeForm("announcementText", event.target.value)}
                />
                <small>每行一条公告，保存时会自动整理成数组。</small>
              </label>
            </section>
              </>
            ) : null}

            {activeConfigTab === "background" ? (
            <section className="panel stack">
              <div>
                <p className="eyebrow">Content</p>
                <h2>背景图</h2>
              </div>
              <div className="grid-form">
                <div className="field-span page-builder__home-background">
                  <div className="stack">
                    <div>
                      <span className="field-title">主页背景</span>
                      <p className="hint">首页继续使用当前的视频背景；这里控制视频地址和回退海报。</p>
                    </div>
                    <label className="checkbox-field">
                      <input
                        checked={homeForm.homeBackgroundEnabled}
                        onChange={(event) => updateHomeForm("homeBackgroundEnabled", event.target.checked)}
                        type="checkbox"
                      />
                      <span>启用首页视频背景</span>
                    </label>
                    <label className="field">
                      <span>首页视频 URL</span>
                      <input
                        value={homeForm.homeBackgroundVideoSrc}
                        onChange={(event) => updateHomeForm("homeBackgroundVideoSrc", event.target.value)}
                        placeholder="/uploads/backgrounds/home-loop-h264.mp4"
                      />
                    </label>
                    <label className="field">
                      <span>回退海报 URL</span>
                      <input
                        value={homeForm.homeBackgroundPoster}
                        onChange={(event) => updateHomeForm("homeBackgroundPoster", event.target.value)}
                        placeholder="/uploads/backgrounds/home-loop-poster.jpg"
                      />
                    </label>
                  </div>
                  <ImageUploadCropper
                    aspectRatio={16 / 9}
                    cropLabel="裁切首页海报"
                    hint="海报会作为视频未加载时的回退层，也会参与移动端首屏观感。"
                    imageUrl={homeForm.homeBackgroundPoster}
                    onCrop={handleCropHomeBackgroundPoster}
                    onUpload={handleUploadHomeBackgroundPoster}
                    title="首页背景海报上传 / 裁切"
                    uploadLabel="上传海报"
                  />
                </div>
                <div className="field-span stack">
                  <div className="toolbar">
                    <div>
                      <span className="field-title">其他页面背景图片</span>
                      <p className="hint">只用于非首页页面背景；支持本地 `/uploads/...` 路径或外链。</p>
                    </div>
                  </div>
                  <div className="page-builder__manual-url">
                    <label className="field">
                      <span>手动添加 URL</span>
                      <input
                        value={manualBackgroundUrl}
                        onChange={(event) => setManualBackgroundUrl(event.target.value)}
                        placeholder="/uploads/ui/backgrounds/example.webp 或 https://..."
                      />
                    </label>
                    <button className="secondary-button" onClick={handleAddManualBackgroundImage} type="button">
                      添加 URL
                    </button>
                  </div>
                  <div className="page-builder__background-list">
                    {toEditableLines(homeForm.backgroundImageText).map((url, index) => (
                      <article className="content-item page-builder__background-card" key={`${url}-${index}`}>
                        {url ? <img alt={`背景图 ${index + 1}`} src={url} /> : null}
                        <label className="field">
                          <span>背景 URL</span>
                          <input value={url} onChange={(event) => updateBackgroundImage(index, event.target.value)} />
                        </label>
                        <div className="actions">
                          <button className="secondary-button" onClick={() => setSelectedBackgroundUrl(url)} type="button">
                            选中裁切
                          </button>
                          <button className="secondary-button" onClick={() => removeBackgroundImage(index)} type="button">
                            删除
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {toEditableLines(homeForm.backgroundImageText).length === 0 ? <p className="hint">暂无背景图，可直接上传。</p> : null}
                </div>
                <div className="field-span page-builder__background-workbench">
                  <div className="image-cropper">
                    <label className="field">
                      <span>选择要裁切的背景图</span>
                      <select
                        value={selectedBackgroundUrl}
                        onChange={(event) => setSelectedBackgroundUrl(event.target.value)}
                      >
                        <option value="">未选择</option>
                        {toLines(homeForm.backgroundImageText).map((url) => (
                          <option key={url} value={url}>
                            {url}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <ImageUploadCropper
                    aspectRatio={16 / 9}
                    cropLabel="裁切背景图"
                    hint="上传后追加到背景图列表；选中已有背景图也可以重新裁切。"
                    imageUrl={selectedBackgroundUrl}
                    onCrop={handleCropBackground}
                    onUpload={handleUploadBackground}
                    title="其他页面背景图上传 / 裁切"
                    uploadLabel="上传背景图"
                  />
                </div>
              </div>
            </section>
            ) : null}

            {activeConfigTab === "music" ? (
            <section className="panel stack">
              <div>
                <p className="eyebrow">Music Library</p>
                <h2>静态音乐曲库</h2>
              </div>
              <div className="stack">
                <div className="toolbar">
                  <p className="hint">后台按 ID 抓一次信息；保存后前台只读取本地静态曲库。</p>
                  <button className="secondary-button" onClick={addMusicTrack} type="button">
                    新增曲目
                  </button>
                </div>
                <div className="page-builder__music-fetcher">
                  <label className="field">
                    <span>网易云歌曲 ID</span>
                    <input
                      inputMode="numeric"
                      placeholder="例如 2050292874"
                      value={musicFetchId}
                      onChange={(event) => setMusicFetchId(event.target.value)}
                    />
                  </label>
                  <button
                    className="primary-button"
                    disabled={Boolean(fetchingMusicId)}
                    onClick={handleFetchAndAddMusicTrack}
                    type="button"
                  >
                    {fetchingMusicId === musicFetchId.trim() ? "抓取中..." : "抓取并添加"}
                  </button>
                </div>
                <div className="page-builder__music-grid">
                  {homeForm.musicTracks.map((track, index) => (
                    <article className="content-item page-builder__music-card" key={`${track.id}-${index}`}>
                      <div className="toolbar">
                        <div className="page-builder__music-title">
                          {track.coverUrl ? <img alt={track.title || `曲目 ${index + 1}`} src={track.coverUrl} /> : null}
                          <strong>{track.title || `曲目 ${index + 1}`}</strong>
                        </div>
                        <button className="secondary-button" onClick={() => removeMusicTrack(index)} type="button">
                          删除
                        </button>
                      </div>
                      <div className="actions">
                        <button
                          className="secondary-button"
                          disabled={fetchingMusicId === track.id}
                          onClick={() => handleRefreshMusicTrack(index)}
                          type="button"
                        >
                          {fetchingMusicId === track.id ? "刷新中..." : "按 ID 刷新信息"}
                        </button>
                      </div>
                      <div className="grid-form">
                        <label className="field">
                          <span>歌曲 ID</span>
                          <input value={track.id} onChange={(event) => updateMusicTrack(index, "id", event.target.value)} />
                        </label>
                        <label className="field">
                          <span>标题</span>
                          <input value={track.title} onChange={(event) => updateMusicTrack(index, "title", event.target.value)} />
                        </label>
                        <label className="field">
                          <span>歌手</span>
                          <input value={track.artist} onChange={(event) => updateMusicTrack(index, "artist", event.target.value)} />
                        </label>
                        <label className="field field-span">
                          <span>封面 URL</span>
                          <input value={track.coverUrl} onChange={(event) => updateMusicTrack(index, "coverUrl", event.target.value)} />
                        </label>
                        <label className="secondary-button birthday-manager__upload-button page-builder__music-cover-upload">
                          上传封面
                          <input accept="image/webp,image/png,image/jpeg" type="file" onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleUploadMusicCover(index, file);
                            }
                          }} />
                        </label>
                        <label className="field field-span">
                          <span>音频 URL</span>
                          <input value={track.audioUrl} onChange={(event) => updateMusicTrack(index, "audioUrl", event.target.value)} />
                        </label>
                        <label className="field field-span">
                          <span>歌词 LRC</span>
                          <textarea
                            className="meta-area"
                            value={track.lrc}
                            onChange={(event) => updateMusicTrack(index, "lrc", event.target.value)}
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
                {homeForm.musicTracks.length === 0 ? <p className="hint">暂无曲目，点击“新增曲目”开始。</p> : null}
              </div>
              <div className="grid-form">
                <label className="field">
                  <span>兜底封面</span>
                  <input value={homeForm.fallbackCover} onChange={(event) => updateHomeForm("fallbackCover", event.target.value)} />
                </label>
                <label className="field">
                  <span>待机歌词</span>
                  <input value={homeForm.idleLyric} onChange={(event) => updateHomeForm("idleLyric", event.target.value)} />
                </label>
              </div>
            </section>
            ) : null}
          </>
        ) : (
          <details className="advanced-panel" open={!isHomePage}>
            <summary>高级原始 JSON</summary>
            <p className="hint">只有需要处理未暴露字段或排查问题时再改这里。</p>
            <label className="field">
              <span>配置内容</span>
              <textarea className="code-area" value={json} onChange={(event) => handleJsonChange(event.target.value)} />
            </label>
          </details>
        )}

        {message ? <p className="hint">{message}</p> : null}
      </section>
    </main>
  );
}
