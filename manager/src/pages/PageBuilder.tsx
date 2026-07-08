import { useEffect, useState } from "react";
import { getPageConfig, savePageConfig } from "../api";
import {
  parseHomePageConfig,
  serializeHomePageConfig,
  type HomePageConfigForm,
} from "../lib/homePageConfig";
import type { PageConfigName } from "../types";

const PAGE_OPTIONS: PageConfigName[] = ["home", "references"];

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
  backgroundImageText: "",
  musicTracksJson: "[]",
  fallbackCover: "",
  idleLyric: "",
};

export default function PageBuilder() {
  const [name, setName] = useState<PageConfigName>("home");
  const [json, setJson] = useState("");
  const [homeSource, setHomeSource] = useState<Record<string, unknown> | null>(null);
  const [homeForm, setHomeForm] = useState<HomePageConfigForm>(EMPTY_HOME_FORM);
  const [isRawMode, setIsRawMode] = useState(false);
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
                <p className="eyebrow">Content</p>
                <h2>公告与背景图</h2>
              </div>
              <div className="grid-form">
                <label className="field field-span">
                  <span>公告列表</span>
                  <textarea
                    className="meta-area"
                    value={homeForm.announcementText}
                    onChange={(event) => updateHomeForm("announcementText", event.target.value)}
                  />
                  <small>每行一条公告，保存时会自动整理成数组。</small>
                </label>
                <label className="field field-span">
                  <span>背景图片 URL 列表</span>
                  <textarea
                    className="meta-area"
                    value={homeForm.backgroundImageText}
                    onChange={(event) => updateHomeForm("backgroundImageText", event.target.value)}
                  />
                  <small>每行一个 URL，支持本地 `/uploads/...` 路径或外链。</small>
                </label>
              </div>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Music Library</p>
                <h2>静态音乐曲库</h2>
              </div>
              <div className="grid-form">
                <label className="field field-span">
                  <span>曲库 JSON</span>
                  <textarea
                    className="meta-area"
                    value={homeForm.musicTracksJson}
                    onChange={(event) => updateHomeForm("musicTracksJson", event.target.value)}
                  />
                  <small>数组内每首歌支持 id、title、artist、coverUrl、audioUrl、lrc；首页运行时不会请求云音乐 API。</small>
                </label>
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
          </>
        ) : (
          <label className="field">
            <span>配置内容</span>
            <textarea className="code-area" value={json} onChange={(event) => handleJsonChange(event.target.value)} />
          </label>
        )}

        {message ? <p className="hint">{message}</p> : null}
      </section>
    </main>
  );
}
