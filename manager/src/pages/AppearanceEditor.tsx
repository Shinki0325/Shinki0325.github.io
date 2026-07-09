import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getPageConfig, savePageConfig } from "../api";
import {
  type AppearanceConfigForm,
  type AppearanceFontPreset,
  type AppearancePreviewCard,
  type AppearancePreviewCardVariant,
  appearanceDefaults,
  fontPresetOptions,
  getPresetFontFamily,
  parseAppearanceConfig,
  serializeAppearanceConfig,
} from "../lib/appearanceConfig";

type PreviewStyle = CSSProperties & Record<`--${string}`, string | number>;
type SelectedModule =
  | "global"
  | "layout"
  | "navigation"
  | "search"
  | "profile"
  | "music"
  | "lyric"
  | "cards"
  | "typography";

const moduleOptions: { id: SelectedModule; label: string; hint: string }[] = [
  { id: "global", label: "全局质感", hint: "透明度 / 背景" },
  { id: "layout", label: "页面尺度", hint: "页边距 / 卡片缩放" },
  { id: "navigation", label: "导航栏", hint: "顶部胶囊导航" },
  { id: "search", label: "搜索栏", hint: "首页搜索框" },
  { id: "profile", label: "个人卡", hint: "头像 / 简介" },
  { id: "music", label: "音乐盒", hint: "首页播放器" },
  { id: "lyric", label: "歌词栏", hint: "横向歌词条" },
  { id: "cards", label: "内容卡片", hint: "下方卡片组" },
  { id: "typography", label: "字体", hint: "站点字体栈" },
];

const numberValue = (value: string) => Number.parseFloat(value);
const rounded = (value: number, digits = 2) => Number(value.toFixed(digits));

const buildPreviewStyle = (form: AppearanceConfigForm): PreviewStyle => {
  const radius = (base: number) => `${Math.round(base * form.radiusScale)}px`;

  return {
    "--preview-panel": `rgba(8, 15, 34, ${form.panelOpacity})`,
    "--preview-panel-strong": `rgba(12, 20, 43, ${form.panelStrongOpacity})`,
    "--preview-panel-soft": `rgba(255, 255, 255, ${form.panelSoftOpacity})`,
    "--preview-bg-video": String(form.backgroundVideoOpacity),
    "--preview-bg-image": String(form.backgroundImageOpacity),
    "--preview-veil": String(form.veilOpacity),
    "--preview-card-scale": String(form.cardScale),
    "--preview-radius-xl": radius(27),
    "--preview-radius-lg": radius(22),
    "--preview-radius-md": radius(18),
    "--preview-max-width": `${Math.round(form.maxWidth)}px`,
    "--preview-gutter-min": `${Math.round(form.pageGutterMin)}px`,
    "--preview-gutter-vw": `${form.pageGutterVw}vw`,
    "--preview-gutter-max": `${Math.round(form.pageGutterMax)}px`,
    "--preview-nav-height": `${form.navigation.height}px`,
    "--preview-nav-max-width": `${form.navigation.maxWidth}px`,
    "--preview-nav-padding-x": `${form.navigation.paddingX}px`,
    "--preview-nav-blur": `${form.navigation.blur}px`,
    "--preview-nav-link-gap": `${form.navigation.linkGap}px`,
    "--preview-search-width": `${form.searchBar.width}px`,
    "--preview-search-height": `${form.searchBar.height}px`,
    "--preview-search-margin-bottom": `${form.searchBar.marginBottom}px`,
    "--preview-search-icon-size": `${form.searchBar.iconSize}px`,
    "--preview-profile-padding-x": `${form.profileCard.paddingX}px`,
    "--preview-profile-padding-y": `${form.profileCard.paddingY}px`,
    "--preview-profile-avatar-size": `${form.profileCard.avatarSize}px`,
    "--preview-profile-title-size": `${form.profileCard.titleSize}px`,
    "--preview-profile-min-height": `${form.profileCard.minHeight}px`,
    "--preview-profile-social-button-size": `${form.profileCard.socialButtonSize}px`,
    "--preview-player-padding": `${form.musicPlayer.cardPadding}px`,
    "--preview-player-cover-size": `${form.musicPlayer.coverSize}px`,
    "--preview-player-control-size": `${form.musicPlayer.controlSize}px`,
    "--preview-player-primary-control-size": `${form.musicPlayer.primaryControlSize}px`,
    "--preview-floating-width": `${form.musicPlayer.floatingWidth}px`,
    "--preview-floating-height": `${form.musicPlayer.floatingHeight}px`,
    "--preview-floating-cover-size": `${form.musicPlayer.floatingCoverSize}px`,
    "--preview-lyric-height": `${form.lyricBar.height}px`,
    "--preview-lyric-padding-x": `${form.lyricBar.paddingX}px`,
    "--preview-lyric-radius": `${form.lyricBar.radius}px`,
    "--preview-lyric-opacity": String(form.lyricBar.opacity),
    "--preview-lyric-font-size": `${form.lyricBar.fontSize}px`,
    fontFamily: form.fontFamily,
  };
};

type RangeControlProps = {
  label: string;
  max: number;
  min: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
};

const RangeControl = ({ label, max, min, step, suffix = "", value, onChange }: RangeControlProps) => (
  <label className="appearance-field">
    <span>
      {label}
      <strong>
        {value}
        {suffix}
      </strong>
    </span>
    <input
      max={max}
      min={min}
      onChange={(event) => onChange(numberValue(event.target.value))}
      step={step}
      type="range"
      value={value}
    />
  </label>
);

const makePreviewCard = (index: number): AppearancePreviewCard => ({
  id: `custom-${Date.now()}-${index}`,
  eyebrow: "新增卡片",
  title: `自定义卡片 ${index}`,
  description: "用来测试整页预览里的卡片比例、透明度和排布。",
  meta: "Preview",
  actionLabel: "查看",
  variant: "soft",
  widthUnits: 4,
  minHeight: 180,
});

const getCardGridStyle = (card: AppearancePreviewCard): PreviewStyle => ({
  "--card-min-height": `${card.minHeight}px`,
  gridColumn: `span ${card.widthUnits}`,
});

export default function AppearanceEditor() {
  const [source, setSource] = useState<Record<string, unknown>>({});
  const [form, setForm] = useState<AppearanceConfigForm>(appearanceDefaults);
  const [selectedCardId, setSelectedCardId] = useState(appearanceDefaults.previewCards[0]?.id ?? "");
  const [selectedModule, setSelectedModule] = useState<SelectedModule>("navigation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getPageConfig("appearance")
      .then((config) => {
        const parsed = parseAppearanceConfig(config.json);
        setSource(parsed.source);
        setForm(parsed.form);
        setSelectedCardId(parsed.form.previewCards[0]?.id ?? "");
        setError(null);
      })
      .catch((nextError: Error) => {
        setError(nextError.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const previewStyle = useMemo(() => buildPreviewStyle(form), [form]);
  const selectedCard = form.previewCards.find((card) => card.id === selectedCardId) ?? form.previewCards[0];
  const selectedModuleMeta = moduleOptions.find((option) => option.id === selectedModule) ?? moduleOptions[0];

  const updateField = <Key extends keyof AppearanceConfigForm>(key: Key, value: AppearanceConfigForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const updatePreviewCards = (cards: AppearancePreviewCard[]) => {
    updateField("previewCards", cards);
  };

  const updateNavigation = <Key extends keyof AppearanceConfigForm["navigation"]>(
    key: Key,
    value: AppearanceConfigForm["navigation"][Key]
  ) => {
    updateField("navigation", { ...form.navigation, [key]: value });
  };

  const updateSearchBar = <Key extends keyof AppearanceConfigForm["searchBar"]>(
    key: Key,
    value: AppearanceConfigForm["searchBar"][Key]
  ) => {
    updateField("searchBar", { ...form.searchBar, [key]: value });
  };

  const updateProfileCard = <Key extends keyof AppearanceConfigForm["profileCard"]>(
    key: Key,
    value: AppearanceConfigForm["profileCard"][Key]
  ) => {
    updateField("profileCard", { ...form.profileCard, [key]: value });
  };

  const updateMusicPlayer = <Key extends keyof AppearanceConfigForm["musicPlayer"]>(
    key: Key,
    value: AppearanceConfigForm["musicPlayer"][Key]
  ) => {
    updateField("musicPlayer", { ...form.musicPlayer, [key]: value });
  };

  const updateLyricBar = <Key extends keyof AppearanceConfigForm["lyricBar"]>(
    key: Key,
    value: AppearanceConfigForm["lyricBar"][Key]
  ) => {
    updateField("lyricBar", { ...form.lyricBar, [key]: value });
  };

  const updateSelectedCard = <Key extends keyof AppearancePreviewCard>(
    key: Key,
    value: AppearancePreviewCard[Key]
  ) => {
    updatePreviewCards(
      form.previewCards.map((card) => (card.id === selectedCard?.id ? { ...card, [key]: value } : card))
    );
  };

  const updateFontPreset = (fontPreset: AppearanceFontPreset) => {
    setForm((current) => ({
      ...current,
      fontPreset,
      fontFamily: fontPreset === "custom" ? current.fontFamily : getPresetFontFamily(fontPreset),
    }));
    setMessage(null);
  };

  const addPreviewCard = () => {
    const nextCard = makePreviewCard(form.previewCards.length + 1);
    updatePreviewCards([...form.previewCards, nextCard]);
    setSelectedCardId(nextCard.id);
    setSelectedModule("cards");
  };

  const removeSelectedCard = () => {
    if (!selectedCard || form.previewCards.length <= 1) {
      return;
    }

    const nextCards = form.previewCards.filter((card) => card.id !== selectedCard.id);
    updatePreviewCards(nextCards);
    setSelectedCardId(nextCards[0]?.id ?? "");
  };

  const resetToDefaults = () => {
    setForm(appearanceDefaults);
    setSelectedCardId(appearanceDefaults.previewCards[0]?.id ?? "");
    setSelectedModule("navigation");
    setMessage("已恢复默认外观，保存后生效。");
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const saved = await savePageConfig("appearance", serializeAppearanceConfig(source, form));
      const parsed = parseAppearanceConfig(saved.json);
      setSource(parsed.source);
      setForm(parsed.form);
      setSelectedCardId(parsed.form.previewCards[0]?.id ?? "");
      setMessage("外观设置已保存，主站刷新后会使用这套参数。");
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const selectModule = (module: SelectedModule) => {
    setSelectedModule(module);
  };

  const selectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setSelectedModule("cards");
  };

  const renderModuleControls = () => {
    if (selectedModule === "global") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="普通卡片" max={0.9} min={0.18} onChange={(value) => updateField("panelOpacity", rounded(value))} step={0.01} value={form.panelOpacity} />
          <RangeControl label="重点卡片" max={0.95} min={0.28} onChange={(value) => updateField("panelStrongOpacity", rounded(value))} step={0.01} value={form.panelStrongOpacity} />
          <RangeControl label="柔光层" max={0.28} min={0.02} onChange={(value) => updateField("panelSoftOpacity", rounded(value))} step={0.01} value={form.panelSoftOpacity} />
          <RangeControl label="视频背景" max={0.9} min={0.18} onChange={(value) => updateField("backgroundVideoOpacity", rounded(value))} step={0.01} value={form.backgroundVideoOpacity} />
          <RangeControl label="图片背景" max={0.9} min={0.18} onChange={(value) => updateField("backgroundImageOpacity", rounded(value))} step={0.01} value={form.backgroundImageOpacity} />
          <RangeControl label="暗色遮罩" max={1} min={0.35} onChange={(value) => updateField("veilOpacity", rounded(value))} step={0.01} value={form.veilOpacity} />
        </div>
      );
    }

    if (selectedModule === "layout") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="卡片整体" max={1.08} min={0.86} onChange={(value) => updateField("cardScale", rounded(value))} step={0.01} value={form.cardScale} />
          <RangeControl label="圆角比例" max={1.18} min={0.72} onChange={(value) => updateField("radiusScale", rounded(value))} step={0.01} value={form.radiusScale} />
          <RangeControl label="最大宽度" max={1320} min={880} onChange={(value) => updateField("maxWidth", Math.round(value))} step={4} suffix="px" value={form.maxWidth} />
          <RangeControl label="最小页边距" max={84} min={24} onChange={(value) => updateField("pageGutterMin", Math.round(value))} step={2} suffix="px" value={form.pageGutterMin} />
          <RangeControl label="响应式页边距" max={12} min={4} onChange={(value) => updateField("pageGutterVw", rounded(value, 1))} step={0.1} suffix="vw" value={form.pageGutterVw} />
          <RangeControl label="最大页边距" max={180} min={72} onChange={(value) => updateField("pageGutterMax", Math.round(value))} step={2} suffix="px" value={form.pageGutterMax} />
        </div>
      );
    }

    if (selectedModule === "navigation") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="导航高度" max={76} min={46} onChange={(value) => updateNavigation("height", Math.round(value))} step={1} suffix="px" value={form.navigation.height} />
          <RangeControl label="导航宽度" max={1320} min={880} onChange={(value) => updateNavigation("maxWidth", Math.round(value))} step={4} suffix="px" value={form.navigation.maxWidth} />
          <RangeControl label="左右内距" max={30} min={10} onChange={(value) => updateNavigation("paddingX", Math.round(value))} step={1} suffix="px" value={form.navigation.paddingX} />
          <RangeControl label="导航模糊" max={36} min={8} onChange={(value) => updateNavigation("blur", Math.round(value))} step={1} suffix="px" value={form.navigation.blur} />
          <RangeControl label="链接间距" max={24} min={6} onChange={(value) => updateNavigation("linkGap", Math.round(value))} step={1} suffix="px" value={form.navigation.linkGap} />
        </div>
      );
    }

    if (selectedModule === "search") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="搜索宽度" max={820} min={520} onChange={(value) => updateSearchBar("width", Math.round(value))} step={4} suffix="px" value={form.searchBar.width} />
          <RangeControl label="搜索高度" max={76} min={48} onChange={(value) => updateSearchBar("height", Math.round(value))} step={1} suffix="px" value={form.searchBar.height} />
          <RangeControl label="下方间距" max={44} min={0} onChange={(value) => updateSearchBar("marginBottom", Math.round(value))} step={1} suffix="px" value={form.searchBar.marginBottom} />
          <RangeControl label="图标大小" max={30} min={16} onChange={(value) => updateSearchBar("iconSize", Math.round(value))} step={1} suffix="px" value={form.searchBar.iconSize} />
        </div>
      );
    }

    if (selectedModule === "profile") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="水平内距" max={42} min={18} onChange={(value) => updateProfileCard("paddingX", Math.round(value))} step={1} suffix="px" value={form.profileCard.paddingX} />
          <RangeControl label="顶部内距" max={46} min={20} onChange={(value) => updateProfileCard("paddingY", Math.round(value))} step={1} suffix="px" value={form.profileCard.paddingY} />
          <RangeControl label="头像大小" max={160} min={96} onChange={(value) => updateProfileCard("avatarSize", Math.round(value))} step={1} suffix="px" value={form.profileCard.avatarSize} />
          <RangeControl label="标题字号" max={72} min={40} onChange={(value) => updateProfileCard("titleSize", Math.round(value))} step={1} suffix="px" value={form.profileCard.titleSize} />
          <RangeControl label="卡片高度" max={380} min={220} onChange={(value) => updateProfileCard("minHeight", Math.round(value))} step={2} suffix="px" value={form.profileCard.minHeight} />
          <RangeControl label="社交按钮" max={58} min={36} onChange={(value) => updateProfileCard("socialButtonSize", Math.round(value))} step={1} suffix="px" value={form.profileCard.socialButtonSize} />
        </div>
      );
    }

    if (selectedModule === "music") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="音乐盒内距" max={42} min={18} onChange={(value) => updateMusicPlayer("cardPadding", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.cardPadding} />
          <RangeControl label="音乐盒封面" max={132} min={72} onChange={(value) => updateMusicPlayer("coverSize", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.coverSize} />
          <RangeControl label="按钮大小" max={52} min={30} onChange={(value) => updateMusicPlayer("controlSize", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.controlSize} />
          <RangeControl label="主按钮大小" max={68} min={40} onChange={(value) => updateMusicPlayer("primaryControlSize", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.primaryControlSize} />
          <RangeControl label="浮动播放器宽" max={460} min={280} onChange={(value) => updateMusicPlayer("floatingWidth", Math.round(value))} step={4} suffix="px" value={form.musicPlayer.floatingWidth} />
          <RangeControl label="浮动播放器高" max={92} min={54} onChange={(value) => updateMusicPlayer("floatingHeight", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.floatingHeight} />
          <RangeControl label="浮动封面" max={88} min={52} onChange={(value) => updateMusicPlayer("floatingCoverSize", Math.round(value))} step={1} suffix="px" value={form.musicPlayer.floatingCoverSize} />
        </div>
      );
    }

    if (selectedModule === "lyric") {
      return (
        <div className="appearance-control-grid">
          <RangeControl label="歌词栏高度" max={104} min={54} onChange={(value) => updateLyricBar("height", Math.round(value))} step={1} suffix="px" value={form.lyricBar.height} />
          <RangeControl label="左右内距" max={44} min={14} onChange={(value) => updateLyricBar("paddingX", Math.round(value))} step={1} suffix="px" value={form.lyricBar.paddingX} />
          <RangeControl label="圆角" max={40} min={14} onChange={(value) => updateLyricBar("radius", Math.round(value))} step={1} suffix="px" value={form.lyricBar.radius} />
          <RangeControl label="背景透明度" max={0.96} min={0.38} onChange={(value) => updateLyricBar("opacity", rounded(value))} step={0.01} value={form.lyricBar.opacity} />
          <RangeControl label="字体大小" max={22} min={13} onChange={(value) => updateLyricBar("fontSize", Math.round(value))} step={1} suffix="px" value={form.lyricBar.fontSize} />
        </div>
      );
    }

    if (selectedModule === "typography") {
      return (
        <div className="grid-form">
          <label className="field">
            字体方案
            <select onChange={(event) => updateFontPreset(event.target.value as AppearanceFontPreset)} value={form.fontPreset}>
              {fontPresetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field field-span">
            字体栈
            <input disabled={form.fontPreset !== "custom"} onChange={(event) => updateField("fontFamily", event.target.value)} value={form.fontFamily} />
          </label>
        </div>
      );
    }

    return (
      <div className="appearance-card-form">
        <div className="appearance-card-list">
          {form.previewCards.map((card) => (
            <button
              className={selectedCardId === card.id ? "appearance-card-chip is-active" : "appearance-card-chip"}
              key={card.id}
              onClick={() => selectCard(card.id)}
              type="button"
            >
              <strong>{card.title}</strong>
              <span>
                {card.widthUnits}/12 · {card.minHeight}px
              </span>
            </button>
          ))}
        </div>

        {selectedCard ? (
          <>
            <div className="grid-form">
              <label className="field">
                小标题
                <input onChange={(event) => updateSelectedCard("eyebrow", event.target.value)} value={selectedCard.eyebrow} />
              </label>
              <label className="field">
                标签
                <input onChange={(event) => updateSelectedCard("meta", event.target.value)} value={selectedCard.meta} />
              </label>
              <label className="field field-span">
                标题
                <input onChange={(event) => updateSelectedCard("title", event.target.value)} value={selectedCard.title} />
              </label>
              <label className="field field-span">
                描述
                <input onChange={(event) => updateSelectedCard("description", event.target.value)} value={selectedCard.description} />
              </label>
              <label className="field">
                按钮文字
                <input onChange={(event) => updateSelectedCard("actionLabel", event.target.value)} value={selectedCard.actionLabel} />
              </label>
              <label className="field">
                样式
                <select onChange={(event) => updateSelectedCard("variant", event.target.value as AppearancePreviewCardVariant)} value={selectedCard.variant}>
                  <option value="strong">重点玻璃</option>
                  <option value="soft">柔和卡片</option>
                  <option value="outline">描边卡片</option>
                </select>
              </label>
            </div>

            <div className="appearance-control-grid">
              <RangeControl label="卡片宽度" max={12} min={3} onChange={(value) => updateSelectedCard("widthUnits", Math.round(value))} step={1} suffix="/12" value={selectedCard.widthUnits} />
              <RangeControl label="最小高度" max={360} min={120} onChange={(value) => updateSelectedCard("minHeight", Math.round(value))} step={10} suffix="px" value={selectedCard.minHeight} />
            </div>

            <button className="secondary-button appearance-danger" disabled={form.previewCards.length <= 1} onClick={removeSelectedCard} type="button">
              删除当前卡片
            </button>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <section className="page appearance-editor">
      <div className="panel appearance-hero">
        <div>
          <p className="eyebrow">Global Theme</p>
          <h1>外观设置</h1>
          <p className="appearance-muted">
            右侧是接近主站比例的实时整页预览；点击预览里的导航栏、搜索栏、个人卡、播放器、歌词栏或内容卡片，左侧会切换到对应控件。
          </p>
        </div>
        <div className="actions">
          <button className="secondary-button" onClick={resetToDefaults} type="button">
            恢复默认
          </button>
          <button className="primary-button" disabled={saving || loading} onClick={handleSave} type="button">
            {saving ? "保存中..." : "保存设置"}
          </button>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="hint">{message}</p> : null}

      <div className="appearance-workbench">
        <aside className="panel appearance-inspector">
          <div className="appearance-section-head appearance-section-head--split">
            <div>
              <p className="eyebrow">Inspector</p>
              <h2>{selectedModuleMeta.label}</h2>
            </div>
            {selectedModule === "cards" ? (
              <button className="secondary-button" onClick={addPreviewCard} type="button">
                添加卡片
              </button>
            ) : null}
          </div>

          <div className="appearance-module-tabs" aria-label="外观模块">
            {moduleOptions.map((option) => (
              <button
                className={selectedModule === option.id ? "appearance-module-tab is-active" : "appearance-module-tab"}
                key={option.id}
                onClick={() => selectModule(option.id)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </button>
            ))}
          </div>

          <section className="appearance-context-card">
            <p className="eyebrow">{selectedModuleMeta.hint}</p>
            {renderModuleControls()}
          </section>
        </aside>

        <section className="panel appearance-preview-panel">
          <div className="appearance-section-head appearance-section-head--split">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>实时整页预览</h2>
            </div>
            <span className="pill muted">{form.previewCards.length} 张预览卡片</span>
          </div>
          <div className="appearance-preview" style={previewStyle}>
            <div className="appearance-preview__background"></div>
            <div
              className={`appearance-preview__nav appearance-preview__selectable ${selectedModule === "navigation" ? "is-selected-module" : ""}`}
              onClick={() => selectModule("navigation")}
              role="button"
              tabIndex={0}
            >
              <strong>
                Shinki <span>★</span> Sakura
              </strong>
              <span>首页</span>
              <span>文稿</span>
              <span>资料库</span>
              <span>笔记</span>
              <span>照片墙</span>
            </div>
            <div className="appearance-preview__shell">
              <div
                className={`appearance-preview__search appearance-preview__selectable ${selectedModule === "search" ? "is-selected-module" : ""}`}
                onClick={() => selectModule("search")}
                role="button"
                tabIndex={0}
              >
                <span className="appearance-preview__search-icon">⌕</span>
                <strong>搜索文稿、资料、笔记...</strong>
                <i />
              </div>

              <div className="appearance-preview__hero-grid">
                <article
                  className={`appearance-preview__profile appearance-preview__card appearance-preview__card--strong appearance-preview__selectable ${selectedModule === "profile" ? "is-selected-module" : ""}`}
                  onClick={() => selectModule("profile")}
                >
                  <div className="appearance-preview__profile-top">
                    <div className="appearance-preview__avatar-shell">
                      <div className="appearance-preview__avatar">
                        <img alt="Shinki 头像预览" src="https://s1.ax1x.com/2023/07/28/pCx6j3R.jpg" />
                      </div>
                    </div>
                    <div className="appearance-preview__profile-copy">
                      <p className="eyebrow">关于我</p>
                      <h3>Shinki</h3>
                      <p>美少女游戏爱好者，对各种各样的知识感兴趣。</p>
                      <small>资料岛仍在缓慢发光。</small>
                    </div>
                  </div>
                  <div className="appearance-preview__profile-footer">
                    <div className="appearance-preview__stats">
                      <article>
                        <strong>5</strong>
                        <span>文稿</span>
                      </article>
                      <article>
                        <strong>36</strong>
                        <span>条目</span>
                      </article>
                    </div>
                    <div className="appearance-preview__social-row">
                      <span>G</span>
                      <span>B</span>
                      <span>@</span>
                    </div>
                  </div>
                </article>

                <article
                  className={`appearance-preview__player appearance-preview__card appearance-preview__card--strong appearance-preview__selectable ${selectedModule === "music" ? "is-selected-module" : ""}`}
                  onClick={() => selectModule("music")}
                >
                  <div className="appearance-preview__player-orb" />
                  <div className="appearance-preview__player-top">
                    <div className="appearance-preview__record">
                      <span />
                    </div>
                    <div className="appearance-preview__player-copy">
                      <span className="appearance-preview__chip">Cloud Music</span>
                      <h3>网易云歌曲 4931896</h3>
                      <p>网易云音乐</p>
                    </div>
                  </div>
                  <strong className="appearance-preview__inline-lyric">Ciallo～(∠・ω )⌒☆</strong>
                  <div className="appearance-preview__player-progress">
                    <span>0:42</span>
                    <div className="appearance-preview__progress">
                      <span />
                    </div>
                    <span>3:58</span>
                  </div>
                  <div className="appearance-preview__controls">
                    <button type="button">◀</button>
                    <button className="is-primary" type="button">▶</button>
                    <button type="button">▶</button>
                  </div>
                </article>
              </div>

              <div
                className={`appearance-preview__lyric appearance-preview__selectable ${selectedModule === "lyric" ? "is-selected-module" : ""}`}
                onClick={() => selectModule("lyric")}
                role="button"
                tabIndex={0}
              >
                <span>▮▮▮▮▮</span>
                <strong>Ciallo～(∠・ω )⌒☆</strong>
                <em>♫</em>
              </div>

              <div className="appearance-preview__grid">
                {form.previewCards.map((card) => (
                  <article
                    className={`appearance-preview__card appearance-preview__card--${card.variant} ${
                      selectedCardId === card.id && selectedModule === "cards" ? "is-selected" : ""
                    }`}
                    key={card.id}
                    onClick={() => selectCard(card.id)}
                    style={getCardGridStyle(card)}
                  >
                    <div className="appearance-preview__card-head">
                      <p className="eyebrow">{card.eyebrow}</p>
                      <span>{card.meta}</span>
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <button type="button">{card.actionLabel}</button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .appearance-hero,
        .appearance-section-head--split {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
        }

        .appearance-muted {
          max-width: 900px;
          margin-top: 10px;
          color: #6f573b;
          font-weight: 700;
        }

        .appearance-workbench {
          display: grid;
          grid-template-columns: minmax(360px, 0.44fr) minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .appearance-inspector,
        .appearance-preview-panel {
          padding: 16px;
        }

        .appearance-inspector {
          position: sticky;
          top: 14px;
          max-height: calc(100vh - 28px);
          overflow: auto;
        }

        .appearance-section-head {
          margin-bottom: 12px;
        }

        .appearance-module-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .appearance-module-tab,
        .appearance-card-chip {
          border: 1px solid rgba(126, 90, 52, 0.16);
          border-radius: 15px;
          padding: 9px 10px;
          text-align: left;
          background: rgba(255, 255, 255, 0.28);
          color: #4b3824;
        }

        .appearance-module-tab.is-active,
        .appearance-card-chip.is-active {
          border-color: rgba(183, 103, 44, 0.58);
          background: rgba(255, 239, 211, 0.72);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
        }

        .appearance-module-tab strong,
        .appearance-module-tab span,
        .appearance-card-chip strong,
        .appearance-card-chip span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .appearance-module-tab span,
        .appearance-card-chip span {
          margin-top: 3px;
          color: #7b6040;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .appearance-context-card {
          display: grid;
          gap: 12px;
          padding: 12px;
          border: 1px solid rgba(129, 91, 52, 0.12);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.22);
        }

        .appearance-control-grid,
        .appearance-card-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .appearance-card-form {
          grid-template-columns: 1fr;
        }

        .appearance-field {
          display: grid;
          gap: 8px;
          padding: 10px;
          border: 1px solid rgba(129, 91, 52, 0.16);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.3);
        }

        .appearance-field span {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #59442f;
          font-size: 0.86rem;
          font-weight: 800;
        }

        .appearance-field strong {
          color: #9a5520;
        }

        .appearance-field input[type="range"] {
          accent-color: #b7662c;
        }

        .appearance-card-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .appearance-danger {
          justify-self: start;
        }

        .appearance-preview {
          overflow: auto;
          position: relative;
          min-height: min(74vh, 760px);
          max-height: calc(100vh - 190px);
          border: 1px solid rgba(255, 255, 255, 0.52);
          border-radius: 34px;
          padding: 22px;
          background: #040816;
          color: #f8fbff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 18px 44px rgba(49, 31, 17, 0.16);
        }

        .appearance-preview__background {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(2, 6, 23, calc(0.34 * var(--preview-veil))), rgba(2, 6, 23, calc(0.58 * var(--preview-veil)))),
            radial-gradient(circle at 18% 14%, rgba(255, 255, 255, calc(0.16 * var(--preview-bg-video))), transparent 18%),
            radial-gradient(circle at 76% 24%, rgba(165, 180, 252, calc(0.4 * var(--preview-bg-image))), transparent 30%),
            linear-gradient(135deg, rgba(61, 91, 139, var(--preview-bg-image)), rgba(33, 34, 83, var(--preview-bg-video)));
        }

        .appearance-preview__nav,
        .appearance-preview__shell {
          position: relative;
          z-index: 1;
        }

        .appearance-preview__selectable {
          cursor: pointer;
          outline: 0 solid transparent;
          transition: outline-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
        }

        .appearance-preview__selectable.is-selected-module,
        .appearance-preview__card.is-selected {
          outline: 2px solid rgba(255, 236, 179, 0.86);
          outline-offset: 3px;
          box-shadow: 0 0 0 6px rgba(250, 204, 21, 0.08), 0 18px 42px rgba(2, 6, 23, 0.24);
        }

        .appearance-preview__nav {
          width: min(calc(100% - clamp(var(--preview-gutter-min), var(--preview-gutter-vw), var(--preview-gutter-max))), var(--preview-nav-max-width));
          margin: 0 auto;
          display: flex;
          gap: var(--preview-nav-link-gap);
          align-items: center;
          justify-content: space-between;
          min-height: calc(var(--preview-nav-height) * var(--preview-card-scale));
          padding: calc(9px * var(--preview-card-scale)) calc(var(--preview-nav-padding-x) * var(--preview-card-scale));
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(var(--preview-nav-blur));
          font-size: calc(0.9rem * var(--preview-card-scale));
        }

        .appearance-preview__nav strong span {
          color: #facc15;
        }

        .appearance-preview__shell {
          width: min(calc(100% - clamp(var(--preview-gutter-min), var(--preview-gutter-vw), var(--preview-gutter-max))), var(--preview-max-width));
          margin: 26px auto 0;
          display: grid;
          gap: calc(18px * var(--preview-card-scale));
        }

        .appearance-preview__search {
          width: min(100%, var(--preview-search-width));
          min-height: calc(var(--preview-search-height) * var(--preview-card-scale));
          margin: 0 auto var(--preview-search-margin-bottom);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 24px;
          border: 1px solid rgba(211, 222, 245, 0.16);
          border-radius: 999px;
          background:
            linear-gradient(90deg, rgba(42, 58, 88, 0.9), rgba(77, 53, 79, 0.78)),
            radial-gradient(circle at 92% 50%, rgba(203, 226, 189, 0.22), transparent 22%);
          box-shadow: 0 22px 46px rgba(7, 12, 24, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .appearance-preview__search-icon {
          width: var(--preview-search-icon-size);
          height: var(--preview-search-icon-size);
          display: grid;
          place-items: center;
          color: rgba(178, 203, 239, 0.84);
          font-size: var(--preview-search-icon-size);
          line-height: 1;
        }

        .appearance-preview__search strong {
          flex: 1;
          color: rgba(226, 232, 240, 0.74);
        }

        .appearance-preview__search i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(202, 255, 195, 0.86);
          box-shadow: 0 0 18px rgba(202, 255, 195, 0.9);
        }

        .appearance-preview__hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.9fr);
          gap: calc(18px * var(--preview-card-scale));
          align-items: stretch;
        }

        .appearance-preview__profile,
        .appearance-preview__player {
          min-height: calc(var(--preview-profile-min-height) * var(--preview-card-scale));
        }

        .appearance-preview__profile {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: calc(var(--preview-profile-padding-y) * var(--preview-card-scale)) calc(var(--preview-profile-padding-x) * var(--preview-card-scale)) 18px;
        }

        .appearance-preview__profile::before,
        .appearance-preview__player-orb {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129, 140, 248, 0.28), transparent 68%);
          pointer-events: none;
        }

        .appearance-preview__profile::before {
          inset: auto auto -82px -82px;
          width: 216px;
          height: 216px;
        }

        .appearance-preview__profile-top,
        .appearance-preview__profile-footer {
          position: relative;
          z-index: 1;
        }

        .appearance-preview__profile-top {
          display: grid;
          grid-template-columns: var(--preview-profile-avatar-size) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .appearance-preview__avatar {
          width: var(--preview-profile-avatar-size);
          height: var(--preview-profile-avatar-size);
          padding: 6px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.92), rgba(244, 114, 182, 0.72));
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.36);
          transform: rotate(-3deg);
        }

        .appearance-preview__avatar img {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          object-fit: cover;
        }

        .appearance-preview__profile-copy {
          display: grid;
          gap: 10px;
          min-width: 0;
        }

        .appearance-preview__profile h3 {
          margin: 0;
          font-size: calc(var(--preview-profile-title-size) * var(--preview-card-scale));
          line-height: 1.02;
          letter-spacing: -0.04em;
        }

        .appearance-preview__profile p,
        .appearance-preview__profile small {
          margin: 0;
          color: rgba(226, 232, 240, 0.78);
        }

        .appearance-preview__profile-footer {
          display: grid;
          grid-template-columns: minmax(0, max-content) 1fr;
          gap: 14px;
          margin-top: auto;
          padding-top: 13px;
          align-items: end;
        }

        .appearance-preview__stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(67px, max-content));
          gap: 0;
        }

        .appearance-preview__stats article {
          padding: 10px 14px;
          border-left: 1px solid rgba(255, 255, 255, 0.09);
        }

        .appearance-preview__stats article:first-child {
          border-left: 0;
        }

        .appearance-preview__stats strong,
        .appearance-preview__stats span {
          display: block;
        }

        .appearance-preview__stats strong {
          color: #a5b4fc;
          font-size: calc(2rem * var(--preview-card-scale));
          line-height: 1;
        }

        .appearance-preview__social-row {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        .appearance-preview__social-row span {
          width: var(--preview-profile-social-button-size);
          height: var(--preview-profile-social-button-size);
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(226, 232, 240, 0.84);
          font-weight: 900;
        }

        .appearance-preview__player {
          position: relative;
          display: grid;
          gap: 18px;
          padding: var(--preview-player-padding);
          overflow: hidden;
        }

        .appearance-preview__player-orb {
          top: -63px;
          right: -63px;
          width: 198px;
          height: 198px;
        }

        .appearance-preview__player-top,
        .appearance-preview__player-copy,
        .appearance-preview__controls,
        .appearance-preview__player-progress,
        .appearance-preview__inline-lyric {
          position: relative;
          z-index: 1;
        }

        .appearance-preview__player-top {
          display: grid;
          grid-template-columns: var(--preview-player-cover-size) minmax(0, 1fr);
          gap: 20px;
          align-items: center;
          min-height: 112px;
        }

        .appearance-preview__record {
          position: relative;
          width: var(--preview-player-cover-size);
          height: var(--preview-player-cover-size);
          border: 2px solid rgba(255, 255, 255, 0.28);
          border-radius: 50%;
          background: linear-gradient(135deg, #172554, #64748b 52%, #c084fc);
          box-shadow: 0 20px 36px rgba(2, 6, 23, 0.42);
        }

        .appearance-preview__record span {
          position: absolute;
          inset: 50% auto auto 50%;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.86);
          border: 2px solid rgba(148, 163, 184, 0.4);
          transform: translate(-50%, -50%);
        }

        .appearance-preview__player-copy {
          display: grid;
          gap: 7px;
          min-width: 0;
        }

        .appearance-preview__chip {
          display: inline-flex;
          width: fit-content;
          min-height: 26px;
          align-items: center;
          padding: 0 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          color: #c7d2fe;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .appearance-preview__player h3 {
          margin: 0;
          font-size: 1.34rem;
          line-height: 1.16;
        }

        .appearance-preview__player p,
        .appearance-preview__inline-lyric {
          margin: 0;
          color: rgba(226, 232, 240, 0.78);
        }

        .appearance-preview__inline-lyric {
          color: #c7d2fe;
          font-size: 0.92rem;
        }

        .appearance-preview__player-progress {
          display: grid;
          grid-template-columns: 50px minmax(0, 1fr) 50px;
          gap: 14px;
          align-items: center;
          color: rgba(191, 219, 254, 0.72);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .appearance-preview__progress {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        .appearance-preview__progress span {
          display: block;
          width: 34%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #818cf8, #c084fc);
        }

        .appearance-preview__controls {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .appearance-preview__controls button {
          width: var(--preview-player-control-size);
          height: var(--preview-player-control-size);
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
        }

        .appearance-preview__controls button.is-primary {
          width: var(--preview-player-primary-control-size);
          height: var(--preview-player-primary-control-size);
          background: linear-gradient(135deg, #818cf8, #a78bfa);
        }

        .appearance-preview__lyric {
          min-height: var(--preview-lyric-height);
          display: grid;
          grid-template-columns: 68px minmax(0, 1fr) 29px;
          align-items: center;
          gap: 16px;
          padding: 18px var(--preview-lyric-padding-x);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: var(--preview-lyric-radius);
          background: rgba(3, 7, 18, var(--preview-lyric-opacity));
          font-size: var(--preview-lyric-font-size);
          box-shadow: 0 18px 42px rgba(2, 6, 23, 0.28);
        }

        .appearance-preview__lyric span,
        .appearance-preview__lyric em {
          color: #c4b5fd;
          font-style: normal;
        }

        .appearance-preview__grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: calc(16px * var(--preview-card-scale));
          align-items: stretch;
        }

        .appearance-preview__card {
          min-height: calc(var(--card-min-height, 250px) * var(--preview-card-scale));
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: calc(18px * var(--preview-card-scale));
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: var(--preview-radius-xl);
          padding: calc(22px * var(--preview-card-scale));
          background: var(--preview-panel);
          box-shadow: 0 18px 42px rgba(2, 6, 23, 0.22);
          backdrop-filter: blur(18px);
          cursor: pointer;
          font-size: calc(0.95rem * var(--preview-card-scale));
        }

        .appearance-preview__card--strong {
          background: linear-gradient(180deg, var(--preview-panel-soft), transparent), var(--preview-panel-strong);
        }

        .appearance-preview__card--soft {
          background: var(--preview-panel);
        }

        .appearance-preview__card--outline {
          background: linear-gradient(145deg, var(--preview-panel), rgba(255, 255, 255, 0.07));
        }

        .appearance-preview__card-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .appearance-preview__card-head span {
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(129, 140, 248, 0.24);
          color: #d8d7ff;
          font-weight: 800;
        }

        .appearance-preview__card h3 {
          margin: 0;
          font-size: calc(1.42rem * var(--preview-card-scale));
          line-height: 1.18;
        }

        .appearance-preview__card p {
          margin: 0;
          color: rgba(226, 232, 240, 0.78);
        }

        .appearance-preview__card button {
          align-self: flex-start;
          min-width: 142px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 9px 18px;
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
        }

        @media (max-width: 1180px) {
          .appearance-workbench {
            grid-template-columns: 1fr;
          }

          .appearance-inspector {
            position: relative;
            top: auto;
            max-height: none;
          }
        }

        @media (max-width: 860px) {
          .appearance-preview__grid,
          .appearance-preview__hero-grid,
          .appearance-control-grid,
          .appearance-module-tabs,
          .appearance-card-list {
            grid-template-columns: 1fr;
          }

          .appearance-preview__card {
            grid-column: 1 / -1 !important;
          }

          .appearance-preview__search {
            width: 100%;
          }
        }

        @media (max-width: 720px) {
          .appearance-hero,
          .appearance-section-head--split {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
