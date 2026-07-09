import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/AppearanceEditor.tsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=37c8cc1b"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=37c8cc1b"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useMemo = __vite__cjsImport3_react["useMemo"]; const useState = __vite__cjsImport3_react["useState"];
import { getPageConfig, savePageConfig } from "/src/api.ts";
import {
  appearanceDefaults,
  fontPresetOptions,
  getPresetFontFamily,
  parseAppearanceConfig,
  serializeAppearanceConfig
} from "/src/lib/appearanceConfig.ts";
const moduleOptions = [
  { id: "global", label: "全局质感", hint: "透明度 / 背景" },
  { id: "layout", label: "页面尺度", hint: "页边距 / 卡片缩放" },
  { id: "navigation", label: "导航栏", hint: "顶部胶囊导航" },
  { id: "search", label: "搜索栏", hint: "首页搜索框" },
  { id: "profile", label: "个人卡", hint: "头像 / 简介" },
  { id: "music", label: "音乐盒", hint: "首页播放器" },
  { id: "lyric", label: "歌词栏", hint: "横向歌词条" },
  { id: "cards", label: "内容卡片", hint: "下方卡片组" },
  { id: "typography", label: "字体", hint: "站点字体栈" }
];
const numberValue = (value) => Number.parseFloat(value);
const rounded = (value, digits = 2) => Number(value.toFixed(digits));
const buildPreviewStyle = (form) => {
  const radius = (base) => `${Math.round(base * form.radiusScale)}px`;
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
    fontFamily: form.fontFamily
  };
};
const RangeControl = ({ label, max, min, step, suffix = "", value, onChange }) => /* @__PURE__ */ jsxDEV("label", { className: "appearance-field", children: [
  /* @__PURE__ */ jsxDEV("span", { children: [
    label,
    /* @__PURE__ */ jsxDEV("strong", { children: [
      value,
      suffix
    ] }, void 0, true, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 125,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
    lineNumber: 123,
    columnNumber: 5
  }, this),
  /* @__PURE__ */ jsxDEV(
    "input",
    {
      max,
      min,
      onChange: (event) => onChange(numberValue(event.target.value)),
      step,
      type: "range",
      value
    },
    void 0,
    false,
    {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 130,
      columnNumber: 5
    },
    this
  )
] }, void 0, true, {
  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
  lineNumber: 122,
  columnNumber: 1
}, this);
_c = RangeControl;
const makePreviewCard = (index) => ({
  id: `custom-${Date.now()}-${index}`,
  eyebrow: "新增卡片",
  title: `自定义卡片 ${index}`,
  description: "用来测试整页预览里的卡片比例、透明度和排布。",
  meta: "Preview",
  actionLabel: "查看",
  variant: "soft",
  widthUnits: 4,
  minHeight: 180
});
const getCardGridStyle = (card) => ({
  "--card-min-height": `${card.minHeight}px`,
  gridColumn: `span ${card.widthUnits}`
});
export default function AppearanceEditor() {
  _s();
  const [source, setSource] = useState({});
  const [form, setForm] = useState(appearanceDefaults);
  const [selectedCardId, setSelectedCardId] = useState(appearanceDefaults.previewCards[0]?.id ?? "");
  const [selectedModule, setSelectedModule] = useState("navigation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    void getPageConfig("appearance").then((config) => {
      const parsed = parseAppearanceConfig(config.json);
      setSource(parsed.source);
      setForm(parsed.form);
      setSelectedCardId(parsed.form.previewCards[0]?.id ?? "");
      setError(null);
    }).catch((nextError) => {
      setError(nextError.message);
    }).finally(() => setLoading(false));
  }, []);
  const previewStyle = useMemo(() => buildPreviewStyle(form), [form]);
  const selectedCard = form.previewCards.find((card) => card.id === selectedCardId) ?? form.previewCards[0];
  const selectedModuleMeta = moduleOptions.find((option) => option.id === selectedModule) ?? moduleOptions[0];
  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };
  const updatePreviewCards = (cards) => {
    updateField("previewCards", cards);
  };
  const updateNavigation = (key, value) => {
    updateField("navigation", { ...form.navigation, [key]: value });
  };
  const updateSearchBar = (key, value) => {
    updateField("searchBar", { ...form.searchBar, [key]: value });
  };
  const updateProfileCard = (key, value) => {
    updateField("profileCard", { ...form.profileCard, [key]: value });
  };
  const updateMusicPlayer = (key, value) => {
    updateField("musicPlayer", { ...form.musicPlayer, [key]: value });
  };
  const updateLyricBar = (key, value) => {
    updateField("lyricBar", { ...form.lyricBar, [key]: value });
  };
  const updateSelectedCard = (key, value) => {
    updatePreviewCards(
      form.previewCards.map((card) => card.id === selectedCard?.id ? { ...card, [key]: value } : card)
    );
  };
  const updateFontPreset = (fontPreset) => {
    setForm((current) => ({
      ...current,
      fontPreset,
      fontFamily: fontPreset === "custom" ? current.fontFamily : getPresetFontFamily(fontPreset)
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
      setError(nextError.message);
    } finally {
      setSaving(false);
    }
  };
  const selectModule = (module) => {
    setSelectedModule(module);
  };
  const selectCard = (cardId) => {
    setSelectedCardId(cardId);
    setSelectedModule("cards");
  };
  const renderModuleControls = () => {
    if (selectedModule === "global") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "普通卡片", max: 0.9, min: 0.18, onChange: (value) => updateField("panelOpacity", rounded(value)), step: 0.01, value: form.panelOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 305,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "重点卡片", max: 0.95, min: 0.28, onChange: (value) => updateField("panelStrongOpacity", rounded(value)), step: 0.01, value: form.panelStrongOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 306,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "柔光层", max: 0.28, min: 0.02, onChange: (value) => updateField("panelSoftOpacity", rounded(value)), step: 0.01, value: form.panelSoftOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 307,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "视频背景", max: 0.9, min: 0.18, onChange: (value) => updateField("backgroundVideoOpacity", rounded(value)), step: 0.01, value: form.backgroundVideoOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 308,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "图片背景", max: 0.9, min: 0.18, onChange: (value) => updateField("backgroundImageOpacity", rounded(value)), step: 0.01, value: form.backgroundImageOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 309,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "暗色遮罩", max: 1, min: 0.35, onChange: (value) => updateField("veilOpacity", rounded(value)), step: 0.01, value: form.veilOpacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 310,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 304,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "layout") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "卡片整体", max: 1.08, min: 0.86, onChange: (value) => updateField("cardScale", rounded(value)), step: 0.01, value: form.cardScale }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 318,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "圆角比例", max: 1.18, min: 0.72, onChange: (value) => updateField("radiusScale", rounded(value)), step: 0.01, value: form.radiusScale }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 319,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "最大宽度", max: 1320, min: 880, onChange: (value) => updateField("maxWidth", Math.round(value)), step: 4, suffix: "px", value: form.maxWidth }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 320,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "最小页边距", max: 84, min: 24, onChange: (value) => updateField("pageGutterMin", Math.round(value)), step: 2, suffix: "px", value: form.pageGutterMin }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 321,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "响应式页边距", max: 12, min: 4, onChange: (value) => updateField("pageGutterVw", rounded(value, 1)), step: 0.1, suffix: "vw", value: form.pageGutterVw }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 322,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "最大页边距", max: 180, min: 72, onChange: (value) => updateField("pageGutterMax", Math.round(value)), step: 2, suffix: "px", value: form.pageGutterMax }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 323,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 317,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "navigation") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "导航高度", max: 76, min: 46, onChange: (value) => updateNavigation("height", Math.round(value)), step: 1, suffix: "px", value: form.navigation.height }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 331,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "导航宽度", max: 1320, min: 880, onChange: (value) => updateNavigation("maxWidth", Math.round(value)), step: 4, suffix: "px", value: form.navigation.maxWidth }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 332,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "左右内距", max: 30, min: 10, onChange: (value) => updateNavigation("paddingX", Math.round(value)), step: 1, suffix: "px", value: form.navigation.paddingX }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 333,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "导航模糊", max: 36, min: 8, onChange: (value) => updateNavigation("blur", Math.round(value)), step: 1, suffix: "px", value: form.navigation.blur }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 334,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "链接间距", max: 24, min: 6, onChange: (value) => updateNavigation("linkGap", Math.round(value)), step: 1, suffix: "px", value: form.navigation.linkGap }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 335,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 330,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "search") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "搜索宽度", max: 820, min: 520, onChange: (value) => updateSearchBar("width", Math.round(value)), step: 4, suffix: "px", value: form.searchBar.width }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 343,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "搜索高度", max: 76, min: 48, onChange: (value) => updateSearchBar("height", Math.round(value)), step: 1, suffix: "px", value: form.searchBar.height }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 344,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "下方间距", max: 44, min: 0, onChange: (value) => updateSearchBar("marginBottom", Math.round(value)), step: 1, suffix: "px", value: form.searchBar.marginBottom }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 345,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "图标大小", max: 30, min: 16, onChange: (value) => updateSearchBar("iconSize", Math.round(value)), step: 1, suffix: "px", value: form.searchBar.iconSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 346,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 342,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "profile") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "水平内距", max: 42, min: 18, onChange: (value) => updateProfileCard("paddingX", Math.round(value)), step: 1, suffix: "px", value: form.profileCard.paddingX }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 354,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "顶部内距", max: 46, min: 20, onChange: (value) => updateProfileCard("paddingY", Math.round(value)), step: 1, suffix: "px", value: form.profileCard.paddingY }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 355,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "头像大小", max: 160, min: 96, onChange: (value) => updateProfileCard("avatarSize", Math.round(value)), step: 1, suffix: "px", value: form.profileCard.avatarSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 356,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "标题字号", max: 72, min: 40, onChange: (value) => updateProfileCard("titleSize", Math.round(value)), step: 1, suffix: "px", value: form.profileCard.titleSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 357,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "卡片高度", max: 380, min: 220, onChange: (value) => updateProfileCard("minHeight", Math.round(value)), step: 2, suffix: "px", value: form.profileCard.minHeight }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 358,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "社交按钮", max: 58, min: 36, onChange: (value) => updateProfileCard("socialButtonSize", Math.round(value)), step: 1, suffix: "px", value: form.profileCard.socialButtonSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 359,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 353,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "music") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "音乐盒内距", max: 42, min: 18, onChange: (value) => updateMusicPlayer("cardPadding", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.cardPadding }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 367,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "音乐盒封面", max: 132, min: 72, onChange: (value) => updateMusicPlayer("coverSize", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.coverSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 368,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "按钮大小", max: 52, min: 30, onChange: (value) => updateMusicPlayer("controlSize", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.controlSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 369,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "主按钮大小", max: 68, min: 40, onChange: (value) => updateMusicPlayer("primaryControlSize", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.primaryControlSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 370,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "浮动播放器宽", max: 460, min: 280, onChange: (value) => updateMusicPlayer("floatingWidth", Math.round(value)), step: 4, suffix: "px", value: form.musicPlayer.floatingWidth }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 371,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "浮动播放器高", max: 92, min: 54, onChange: (value) => updateMusicPlayer("floatingHeight", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.floatingHeight }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 372,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "浮动封面", max: 88, min: 52, onChange: (value) => updateMusicPlayer("floatingCoverSize", Math.round(value)), step: 1, suffix: "px", value: form.musicPlayer.floatingCoverSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 373,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 366,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "lyric") {
      return /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "歌词栏高度", max: 104, min: 54, onChange: (value) => updateLyricBar("height", Math.round(value)), step: 1, suffix: "px", value: form.lyricBar.height }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 381,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "左右内距", max: 44, min: 14, onChange: (value) => updateLyricBar("paddingX", Math.round(value)), step: 1, suffix: "px", value: form.lyricBar.paddingX }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 382,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "圆角", max: 40, min: 14, onChange: (value) => updateLyricBar("radius", Math.round(value)), step: 1, suffix: "px", value: form.lyricBar.radius }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 383,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "背景透明度", max: 0.96, min: 0.38, onChange: (value) => updateLyricBar("opacity", rounded(value)), step: 0.01, value: form.lyricBar.opacity }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 384,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(RangeControl, { label: "字体大小", max: 22, min: 13, onChange: (value) => updateLyricBar("fontSize", Math.round(value)), step: 1, suffix: "px", value: form.lyricBar.fontSize }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 385,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 380,
        columnNumber: 9
      }, this);
    }
    if (selectedModule === "typography") {
      return /* @__PURE__ */ jsxDEV("div", { className: "grid-form", children: [
        /* @__PURE__ */ jsxDEV("label", { className: "field", children: [
          "字体方案",
          /* @__PURE__ */ jsxDEV("select", { onChange: (event) => updateFontPreset(event.target.value), value: form.fontPreset, children: fontPresetOptions.map(
            (option) => /* @__PURE__ */ jsxDEV("option", { value: option.value, children: option.label }, option.value, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 397,
              columnNumber: 15
            }, this)
          ) }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 395,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 393,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "field field-span", children: [
          "字体栈",
          /* @__PURE__ */ jsxDEV("input", { disabled: form.fontPreset !== "custom", onChange: (event) => updateField("fontFamily", event.target.value), value: form.fontFamily }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 405,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 403,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 392,
        columnNumber: 9
      }, this);
    }
    return /* @__PURE__ */ jsxDEV("div", { className: "appearance-card-form", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "appearance-card-list", children: form.previewCards.map(
        (card) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: selectedCardId === card.id ? "appearance-card-chip is-active" : "appearance-card-chip",
            onClick: () => selectCard(card.id),
            type: "button",
            children: [
              /* @__PURE__ */ jsxDEV("strong", { children: card.title }, void 0, false, {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 421,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: [
                card.widthUnits,
                "/12 · ",
                card.minHeight,
                "px"
              ] }, void 0, true, {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 422,
                columnNumber: 15
              }, this)
            ]
          },
          card.id,
          true,
          {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 415,
            columnNumber: 11
          },
          this
        )
      ) }, void 0, false, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 413,
        columnNumber: 9
      }, this),
      selectedCard ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "grid-form", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "field", children: [
            "小标题",
            /* @__PURE__ */ jsxDEV("input", { onChange: (event) => updateSelectedCard("eyebrow", event.target.value), value: selectedCard.eyebrow }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 434,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 432,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "field", children: [
            "标签",
            /* @__PURE__ */ jsxDEV("input", { onChange: (event) => updateSelectedCard("meta", event.target.value), value: selectedCard.meta }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 438,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 436,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "field field-span", children: [
            "标题",
            /* @__PURE__ */ jsxDEV("input", { onChange: (event) => updateSelectedCard("title", event.target.value), value: selectedCard.title }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 442,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 440,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "field field-span", children: [
            "描述",
            /* @__PURE__ */ jsxDEV("input", { onChange: (event) => updateSelectedCard("description", event.target.value), value: selectedCard.description }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 446,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 444,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "field", children: [
            "按钮文字",
            /* @__PURE__ */ jsxDEV("input", { onChange: (event) => updateSelectedCard("actionLabel", event.target.value), value: selectedCard.actionLabel }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 450,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 448,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "field", children: [
            "样式",
            /* @__PURE__ */ jsxDEV("select", { onChange: (event) => updateSelectedCard("variant", event.target.value), value: selectedCard.variant, children: [
              /* @__PURE__ */ jsxDEV("option", { value: "strong", children: "重点玻璃" }, void 0, false, {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 455,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "soft", children: "柔和卡片" }, void 0, false, {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 456,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "outline", children: "描边卡片" }, void 0, false, {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 457,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 454,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 452,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 431,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "appearance-control-grid", children: [
          /* @__PURE__ */ jsxDEV(RangeControl, { label: "卡片宽度", max: 12, min: 3, onChange: (value) => updateSelectedCard("widthUnits", Math.round(value)), step: 1, suffix: "/12", value: selectedCard.widthUnits }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 463,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(RangeControl, { label: "最小高度", max: 360, min: 120, onChange: (value) => updateSelectedCard("minHeight", Math.round(value)), step: 10, suffix: "px", value: selectedCard.minHeight }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 464,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 462,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "secondary-button appearance-danger", disabled: form.previewCards.length <= 1, onClick: removeSelectedCard, type: "button", children: "删除当前卡片" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 467,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 430,
        columnNumber: 9
      }, this) : null
    ] }, void 0, true, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 412,
      columnNumber: 7
    }, this);
  };
  return /* @__PURE__ */ jsxDEV("section", { className: "page appearance-editor", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "panel appearance-hero", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: "Global Theme" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 480,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { children: "外观设置" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 481,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "appearance-muted", children: "右侧是接近主站比例的实时整页预览；点击预览里的导航栏、搜索栏、个人卡、播放器、歌词栏或内容卡片，左侧会切换到对应控件。" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 482,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 479,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "actions", children: [
        /* @__PURE__ */ jsxDEV("button", { className: "secondary-button", onClick: resetToDefaults, type: "button", children: "恢复默认" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 487,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "primary-button", disabled: saving || loading, onClick: handleSave, type: "button", children: saving ? "保存中..." : "保存设置" }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 490,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 486,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 478,
      columnNumber: 7
    }, this),
    error ? /* @__PURE__ */ jsxDEV("p", { className: "error", children: error }, void 0, false, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 496,
      columnNumber: 16
    }, this) : null,
    message ? /* @__PURE__ */ jsxDEV("p", { className: "hint", children: message }, void 0, false, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 497,
      columnNumber: 18
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { className: "appearance-workbench", children: [
      /* @__PURE__ */ jsxDEV("aside", { className: "panel appearance-inspector", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "appearance-section-head appearance-section-head--split", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: "Inspector" }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 503,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h2", { children: selectedModuleMeta.label }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 504,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 502,
            columnNumber: 13
          }, this),
          selectedModule === "cards" ? /* @__PURE__ */ jsxDEV("button", { className: "secondary-button", onClick: addPreviewCard, type: "button", children: "添加卡片" }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 507,
            columnNumber: 13
          }, this) : null
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 501,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "appearance-module-tabs", "aria-label": "外观模块", children: moduleOptions.map(
          (option) => /* @__PURE__ */ jsxDEV(
            "button",
            {
              className: selectedModule === option.id ? "appearance-module-tab is-active" : "appearance-module-tab",
              onClick: () => selectModule(option.id),
              type: "button",
              children: [
                /* @__PURE__ */ jsxDEV("strong", { children: option.label }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 521,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: option.hint }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 522,
                  columnNumber: 17
                }, this)
              ]
            },
            option.id,
            true,
            {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 515,
              columnNumber: 13
            },
            this
          )
        ) }, void 0, false, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 513,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("section", { className: "appearance-context-card", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: selectedModuleMeta.hint }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 528,
            columnNumber: 13
          }, this),
          renderModuleControls()
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 527,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 500,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "panel appearance-preview-panel", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "appearance-section-head appearance-section-head--split", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: "Preview" }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 536,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h2", { children: "实时整页预览" }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 537,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 535,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "pill muted", children: [
            form.previewCards.length,
            " 张预览卡片"
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 539,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 534,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview", style: previewStyle, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__background" }, void 0, false, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 542,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: `appearance-preview__nav appearance-preview__selectable ${selectedModule === "navigation" ? "is-selected-module" : ""}`,
              onClick: () => selectModule("navigation"),
              role: "button",
              tabIndex: 0,
              children: [
                /* @__PURE__ */ jsxDEV("strong", { children: [
                  "Shinki ",
                  /* @__PURE__ */ jsxDEV("span", { children: "★" }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 550,
                    columnNumber: 24
                  }, this),
                  " Sakura"
                ] }, void 0, true, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 549,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "首页" }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 552,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "文稿" }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 553,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "资料库" }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 554,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "笔记" }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 555,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "照片墙" }, void 0, false, {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 556,
                  columnNumber: 15
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 543,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__shell", children: [
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                className: `appearance-preview__search appearance-preview__selectable ${selectedModule === "search" ? "is-selected-module" : ""}`,
                onClick: () => selectModule("search"),
                role: "button",
                tabIndex: 0,
                children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "appearance-preview__search-icon", children: "⌕" }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 565,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("strong", { children: "搜索文稿、资料、笔记..." }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 566,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("i", {}, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 567,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 559,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__hero-grid", children: [
              /* @__PURE__ */ jsxDEV(
                "article",
                {
                  className: `appearance-preview__profile appearance-preview__card appearance-preview__card--strong appearance-preview__selectable ${selectedModule === "profile" ? "is-selected-module" : ""}`,
                  onClick: () => selectModule("profile"),
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__profile-top", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__avatar-shell", children: /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__avatar", children: /* @__PURE__ */ jsxDEV("img", { alt: "Shinki 头像预览", src: "https://s1.ax1x.com/2023/07/28/pCx6j3R.jpg" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 578,
                        columnNumber: 25
                      }, this) }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 577,
                        columnNumber: 23
                      }, this) }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 576,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__profile-copy", children: [
                        /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: "关于我" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 582,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("h3", { children: "Shinki" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 583,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("p", { children: "美少女游戏爱好者，对各种各样的知识感兴趣。" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 584,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("small", { children: "资料岛仍在缓慢发光。" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 585,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 581,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 575,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__profile-footer", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__stats", children: [
                        /* @__PURE__ */ jsxDEV("article", { children: [
                          /* @__PURE__ */ jsxDEV("strong", { children: "5" }, void 0, false, {
                            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                            lineNumber: 591,
                            columnNumber: 25
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { children: "文稿" }, void 0, false, {
                            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                            lineNumber: 592,
                            columnNumber: 25
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 590,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("article", { children: [
                          /* @__PURE__ */ jsxDEV("strong", { children: "36" }, void 0, false, {
                            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                            lineNumber: 595,
                            columnNumber: 25
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { children: "条目" }, void 0, false, {
                            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                            lineNumber: 596,
                            columnNumber: 25
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 594,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 589,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__social-row", children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "G" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 600,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("span", { children: "B" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 601,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("span", { children: "@" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 602,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 599,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 588,
                      columnNumber: 19
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 571,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "article",
                {
                  className: `appearance-preview__player appearance-preview__card appearance-preview__card--strong appearance-preview__selectable ${selectedModule === "music" ? "is-selected-module" : ""}`,
                  onClick: () => selectModule("music"),
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__player-orb" }, void 0, false, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 611,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__player-top", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__record", children: /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 614,
                        columnNumber: 23
                      }, this) }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 613,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__player-copy", children: [
                        /* @__PURE__ */ jsxDEV("span", { className: "appearance-preview__chip", children: "Cloud Music" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 617,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("h3", { children: "网易云歌曲 4931896" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 618,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("p", { children: "网易云音乐" }, void 0, false, {
                          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                          lineNumber: 619,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 616,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 612,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("strong", { className: "appearance-preview__inline-lyric", children: "Ciallo～(∠・ω )⌒☆" }, void 0, false, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 622,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__player-progress", children: [
                      /* @__PURE__ */ jsxDEV("span", { children: "0:42" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 624,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__progress", children: /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 626,
                        columnNumber: 23
                      }, this) }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 625,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { children: "3:58" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 628,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 623,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__controls", children: [
                      /* @__PURE__ */ jsxDEV("button", { type: "button", children: "◀" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 631,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("button", { className: "is-primary", type: "button", children: "▶" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 632,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("button", { type: "button", children: "▶" }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 633,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 630,
                      columnNumber: 19
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 607,
                  columnNumber: 17
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 570,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                className: `appearance-preview__lyric appearance-preview__selectable ${selectedModule === "lyric" ? "is-selected-module" : ""}`,
                onClick: () => selectModule("lyric"),
                role: "button",
                tabIndex: 0,
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "▮▮▮▮▮" }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 644,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("strong", { children: "Ciallo～(∠・ω )⌒☆" }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 645,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("em", { children: "♫" }, void 0, false, {
                    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                    lineNumber: 646,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                lineNumber: 638,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__grid", children: form.previewCards.map(
              (card) => /* @__PURE__ */ jsxDEV(
                "article",
                {
                  className: `appearance-preview__card appearance-preview__card--${card.variant} ${selectedCardId === card.id && selectedModule === "cards" ? "is-selected" : ""}`,
                  onClick: () => selectCard(card.id),
                  style: getCardGridStyle(card),
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "appearance-preview__card-head", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "eyebrow", children: card.eyebrow }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 660,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { children: card.meta }, void 0, false, {
                        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                        lineNumber: 661,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 659,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("h3", { children: card.title }, void 0, false, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 663,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { children: card.description }, void 0, false, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 664,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("button", { type: "button", children: card.actionLabel }, void 0, false, {
                      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                      lineNumber: 665,
                      columnNumber: 21
                    }, this)
                  ]
                },
                card.id,
                true,
                {
                  fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
                  lineNumber: 651,
                  columnNumber: 17
                },
                this
              )
            ) }, void 0, false, {
              fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
              lineNumber: 649,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
            lineNumber: 558,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
          lineNumber: 541,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
        lineNumber: 533,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 499,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("style", { children: `
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
      ` }, void 0, false, {
      fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
      lineNumber: 674,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx",
    lineNumber: 477,
    columnNumber: 5
  }, this);
}
_s(AppearanceEditor, "1XlFllJXh4sjzAPF7d+uNHqF4yc=");
_c2 = AppearanceEditor;
var _c, _c2;
$RefreshReg$(_c, "RangeControl");
$RefreshReg$(_c2, "AppearanceEditor");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/mnt/d/blog/manager/src/pages/AppearanceEditor.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFSO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0F1b0JFO0FBQUEsT0E1MEJKO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0E2MEJBO0FBRUo7QUFBQ2dGLEdBOW9DdUJELGtCQUFnQjtBQUFBLE1BQWhCQTtBQUFnQixJQUFBZixJQUFBeUU7QUFBQSxhQUFBekUsSUFBQTtBQUFBLGFBQUF5RSxLQUFBIiwibmFtZXMiOlsidXNlRWZmZWN0IiwidXNlTWVtbyIsInVzZVN0YXRlIiwiZ2V0UGFnZUNvbmZpZyIsInNhdmVQYWdlQ29uZmlnIiwiYXBwZWFyYW5jZURlZmF1bHRzIiwiZm9udFByZXNldE9wdGlvbnMiLCJnZXRQcmVzZXRGb250RmFtaWx5IiwicGFyc2VBcHBlYXJhbmNlQ29uZmlnIiwic2VyaWFsaXplQXBwZWFyYW5jZUNvbmZpZyIsIm1vZHVsZU9wdGlvbnMiLCJpZCIsImxhYmVsIiwiaGludCIsIm51bWJlclZhbHVlIiwidmFsdWUiLCJOdW1iZXIiLCJwYXJzZUZsb2F0Iiwicm91bmRlZCIsImRpZ2l0cyIsInRvRml4ZWQiLCJidWlsZFByZXZpZXdTdHlsZSIsImZvcm0iLCJyYWRpdXMiLCJiYXNlIiwiTWF0aCIsInJvdW5kIiwicmFkaXVzU2NhbGUiLCJwYW5lbE9wYWNpdHkiLCJwYW5lbFN0cm9uZ09wYWNpdHkiLCJwYW5lbFNvZnRPcGFjaXR5IiwiU3RyaW5nIiwiYmFja2dyb3VuZFZpZGVvT3BhY2l0eSIsImJhY2tncm91bmRJbWFnZU9wYWNpdHkiLCJ2ZWlsT3BhY2l0eSIsImNhcmRTY2FsZSIsIm1heFdpZHRoIiwicGFnZUd1dHRlck1pbiIsInBhZ2VHdXR0ZXJWdyIsInBhZ2VHdXR0ZXJNYXgiLCJuYXZpZ2F0aW9uIiwiaGVpZ2h0IiwicGFkZGluZ1giLCJibHVyIiwibGlua0dhcCIsInNlYXJjaEJhciIsIndpZHRoIiwibWFyZ2luQm90dG9tIiwiaWNvblNpemUiLCJwcm9maWxlQ2FyZCIsInBhZGRpbmdZIiwiYXZhdGFyU2l6ZSIsInRpdGxlU2l6ZSIsIm1pbkhlaWdodCIsInNvY2lhbEJ1dHRvblNpemUiLCJtdXNpY1BsYXllciIsImNhcmRQYWRkaW5nIiwiY292ZXJTaXplIiwiY29udHJvbFNpemUiLCJwcmltYXJ5Q29udHJvbFNpemUiLCJmbG9hdGluZ1dpZHRoIiwiZmxvYXRpbmdIZWlnaHQiLCJmbG9hdGluZ0NvdmVyU2l6ZSIsImx5cmljQmFyIiwib3BhY2l0eSIsImZvbnRTaXplIiwiZm9udEZhbWlseSIsIlJhbmdlQ29udHJvbCIsIm1heCIsIm1pbiIsInN0ZXAiLCJzdWZmaXgiLCJvbkNoYW5nZSIsImV2ZW50IiwidGFyZ2V0IiwiX2MiLCJtYWtlUHJldmlld0NhcmQiLCJpbmRleCIsIkRhdGUiLCJub3ciLCJleWVicm93IiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1ldGEiLCJhY3Rpb25MYWJlbCIsInZhcmlhbnQiLCJ3aWR0aFVuaXRzIiwiZ2V0Q2FyZEdyaWRTdHlsZSIsImNhcmQiLCJncmlkQ29sdW1uIiwiQXBwZWFyYW5jZUVkaXRvciIsIl9zIiwic291cmNlIiwic2V0U291cmNlIiwic2V0Rm9ybSIsInNlbGVjdGVkQ2FyZElkIiwic2V0U2VsZWN0ZWRDYXJkSWQiLCJwcmV2aWV3Q2FyZHMiLCJzZWxlY3RlZE1vZHVsZSIsInNldFNlbGVjdGVkTW9kdWxlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJzYXZpbmciLCJzZXRTYXZpbmciLCJtZXNzYWdlIiwic2V0TWVzc2FnZSIsImVycm9yIiwic2V0RXJyb3IiLCJ0aGVuIiwiY29uZmlnIiwicGFyc2VkIiwianNvbiIsImNhdGNoIiwibmV4dEVycm9yIiwiZmluYWxseSIsInByZXZpZXdTdHlsZSIsInNlbGVjdGVkQ2FyZCIsImZpbmQiLCJzZWxlY3RlZE1vZHVsZU1ldGEiLCJvcHRpb24iLCJ1cGRhdGVGaWVsZCIsImtleSIsImN1cnJlbnQiLCJ1cGRhdGVQcmV2aWV3Q2FyZHMiLCJjYXJkcyIsInVwZGF0ZU5hdmlnYXRpb24iLCJ1cGRhdGVTZWFyY2hCYXIiLCJ1cGRhdGVQcm9maWxlQ2FyZCIsInVwZGF0ZU11c2ljUGxheWVyIiwidXBkYXRlTHlyaWNCYXIiLCJ1cGRhdGVTZWxlY3RlZENhcmQiLCJtYXAiLCJ1cGRhdGVGb250UHJlc2V0IiwiZm9udFByZXNldCIsImFkZFByZXZpZXdDYXJkIiwibmV4dENhcmQiLCJsZW5ndGgiLCJyZW1vdmVTZWxlY3RlZENhcmQiLCJuZXh0Q2FyZHMiLCJmaWx0ZXIiLCJyZXNldFRvRGVmYXVsdHMiLCJoYW5kbGVTYXZlIiwic2F2ZWQiLCJzZWxlY3RNb2R1bGUiLCJtb2R1bGUiLCJzZWxlY3RDYXJkIiwiY2FyZElkIiwicmVuZGVyTW9kdWxlQ29udHJvbHMiLCJfYzIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQXBwZWFyYW5jZUVkaXRvci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBnZXRQYWdlQ29uZmlnLCBzYXZlUGFnZUNvbmZpZyB9IGZyb20gXCIuLi9hcGlcIjtcbmltcG9ydCB7XG4gIHR5cGUgQXBwZWFyYW5jZUNvbmZpZ0Zvcm0sXG4gIHR5cGUgQXBwZWFyYW5jZUZvbnRQcmVzZXQsXG4gIHR5cGUgQXBwZWFyYW5jZVByZXZpZXdDYXJkLFxuICB0eXBlIEFwcGVhcmFuY2VQcmV2aWV3Q2FyZFZhcmlhbnQsXG4gIGFwcGVhcmFuY2VEZWZhdWx0cyxcbiAgZm9udFByZXNldE9wdGlvbnMsXG4gIGdldFByZXNldEZvbnRGYW1pbHksXG4gIHBhcnNlQXBwZWFyYW5jZUNvbmZpZyxcbiAgc2VyaWFsaXplQXBwZWFyYW5jZUNvbmZpZyxcbn0gZnJvbSBcIi4uL2xpYi9hcHBlYXJhbmNlQ29uZmlnXCI7XG5cbnR5cGUgUHJldmlld1N0eWxlID0gQ1NTUHJvcGVydGllcyAmIFJlY29yZDxgLS0ke3N0cmluZ31gLCBzdHJpbmcgfCBudW1iZXI+O1xudHlwZSBTZWxlY3RlZE1vZHVsZSA9XG4gIHwgXCJnbG9iYWxcIlxuICB8IFwibGF5b3V0XCJcbiAgfCBcIm5hdmlnYXRpb25cIlxuICB8IFwic2VhcmNoXCJcbiAgfCBcInByb2ZpbGVcIlxuICB8IFwibXVzaWNcIlxuICB8IFwibHlyaWNcIlxuICB8IFwiY2FyZHNcIlxuICB8IFwidHlwb2dyYXBoeVwiO1xuXG5jb25zdCBtb2R1bGVPcHRpb25zOiB7IGlkOiBTZWxlY3RlZE1vZHVsZTsgbGFiZWw6IHN0cmluZzsgaGludDogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogXCJnbG9iYWxcIiwgbGFiZWw6IFwi5YWo5bGA6LSo5oSfXCIsIGhpbnQ6IFwi6YCP5piO5bqmIC8g6IOM5pmvXCIgfSxcbiAgeyBpZDogXCJsYXlvdXRcIiwgbGFiZWw6IFwi6aG16Z2i5bC65bqmXCIsIGhpbnQ6IFwi6aG16L656LedIC8g5Y2h54mH57yp5pS+XCIgfSxcbiAgeyBpZDogXCJuYXZpZ2F0aW9uXCIsIGxhYmVsOiBcIuWvvOiIquagj1wiLCBoaW50OiBcIumhtumDqOiDtuWbiuWvvOiIqlwiIH0sXG4gIHsgaWQ6IFwic2VhcmNoXCIsIGxhYmVsOiBcIuaQnOe0ouagj1wiLCBoaW50OiBcIummlumhteaQnOe0ouahhlwiIH0sXG4gIHsgaWQ6IFwicHJvZmlsZVwiLCBsYWJlbDogXCLkuKrkurrljaFcIiwgaGludDogXCLlpLTlg48gLyDnroDku4tcIiB9LFxuICB7IGlkOiBcIm11c2ljXCIsIGxhYmVsOiBcIumfs+S5kOebklwiLCBoaW50OiBcIummlumhteaSreaUvuWZqFwiIH0sXG4gIHsgaWQ6IFwibHlyaWNcIiwgbGFiZWw6IFwi5q2M6K+N5qCPXCIsIGhpbnQ6IFwi5qiq5ZCR5q2M6K+N5p2hXCIgfSxcbiAgeyBpZDogXCJjYXJkc1wiLCBsYWJlbDogXCLlhoXlrrnljaHniYdcIiwgaGludDogXCLkuIvmlrnljaHniYfnu4RcIiB9LFxuICB7IGlkOiBcInR5cG9ncmFwaHlcIiwgbGFiZWw6IFwi5a2X5L2TXCIsIGhpbnQ6IFwi56uZ54K55a2X5L2T5qCIXCIgfSxcbl07XG5cbmNvbnN0IG51bWJlclZhbHVlID0gKHZhbHVlOiBzdHJpbmcpID0+IE51bWJlci5wYXJzZUZsb2F0KHZhbHVlKTtcbmNvbnN0IHJvdW5kZWQgPSAodmFsdWU6IG51bWJlciwgZGlnaXRzID0gMikgPT4gTnVtYmVyKHZhbHVlLnRvRml4ZWQoZGlnaXRzKSk7XG5cbmNvbnN0IGJ1aWxkUHJldmlld1N0eWxlID0gKGZvcm06IEFwcGVhcmFuY2VDb25maWdGb3JtKTogUHJldmlld1N0eWxlID0+IHtcbiAgY29uc3QgcmFkaXVzID0gKGJhc2U6IG51bWJlcikgPT4gYCR7TWF0aC5yb3VuZChiYXNlICogZm9ybS5yYWRpdXNTY2FsZSl9cHhgO1xuXG4gIHJldHVybiB7XG4gICAgXCItLXByZXZpZXctcGFuZWxcIjogYHJnYmEoOCwgMTUsIDM0LCAke2Zvcm0ucGFuZWxPcGFjaXR5fSlgLFxuICAgIFwiLS1wcmV2aWV3LXBhbmVsLXN0cm9uZ1wiOiBgcmdiYSgxMiwgMjAsIDQzLCAke2Zvcm0ucGFuZWxTdHJvbmdPcGFjaXR5fSlgLFxuICAgIFwiLS1wcmV2aWV3LXBhbmVsLXNvZnRcIjogYHJnYmEoMjU1LCAyNTUsIDI1NSwgJHtmb3JtLnBhbmVsU29mdE9wYWNpdHl9KWAsXG4gICAgXCItLXByZXZpZXctYmctdmlkZW9cIjogU3RyaW5nKGZvcm0uYmFja2dyb3VuZFZpZGVvT3BhY2l0eSksXG4gICAgXCItLXByZXZpZXctYmctaW1hZ2VcIjogU3RyaW5nKGZvcm0uYmFja2dyb3VuZEltYWdlT3BhY2l0eSksXG4gICAgXCItLXByZXZpZXctdmVpbFwiOiBTdHJpbmcoZm9ybS52ZWlsT3BhY2l0eSksXG4gICAgXCItLXByZXZpZXctY2FyZC1zY2FsZVwiOiBTdHJpbmcoZm9ybS5jYXJkU2NhbGUpLFxuICAgIFwiLS1wcmV2aWV3LXJhZGl1cy14bFwiOiByYWRpdXMoMjcpLFxuICAgIFwiLS1wcmV2aWV3LXJhZGl1cy1sZ1wiOiByYWRpdXMoMjIpLFxuICAgIFwiLS1wcmV2aWV3LXJhZGl1cy1tZFwiOiByYWRpdXMoMTgpLFxuICAgIFwiLS1wcmV2aWV3LW1heC13aWR0aFwiOiBgJHtNYXRoLnJvdW5kKGZvcm0ubWF4V2lkdGgpfXB4YCxcbiAgICBcIi0tcHJldmlldy1ndXR0ZXItbWluXCI6IGAke01hdGgucm91bmQoZm9ybS5wYWdlR3V0dGVyTWluKX1weGAsXG4gICAgXCItLXByZXZpZXctZ3V0dGVyLXZ3XCI6IGAke2Zvcm0ucGFnZUd1dHRlclZ3fXZ3YCxcbiAgICBcIi0tcHJldmlldy1ndXR0ZXItbWF4XCI6IGAke01hdGgucm91bmQoZm9ybS5wYWdlR3V0dGVyTWF4KX1weGAsXG4gICAgXCItLXByZXZpZXctbmF2LWhlaWdodFwiOiBgJHtmb3JtLm5hdmlnYXRpb24uaGVpZ2h0fXB4YCxcbiAgICBcIi0tcHJldmlldy1uYXYtbWF4LXdpZHRoXCI6IGAke2Zvcm0ubmF2aWdhdGlvbi5tYXhXaWR0aH1weGAsXG4gICAgXCItLXByZXZpZXctbmF2LXBhZGRpbmcteFwiOiBgJHtmb3JtLm5hdmlnYXRpb24ucGFkZGluZ1h9cHhgLFxuICAgIFwiLS1wcmV2aWV3LW5hdi1ibHVyXCI6IGAke2Zvcm0ubmF2aWdhdGlvbi5ibHVyfXB4YCxcbiAgICBcIi0tcHJldmlldy1uYXYtbGluay1nYXBcIjogYCR7Zm9ybS5uYXZpZ2F0aW9uLmxpbmtHYXB9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXNlYXJjaC13aWR0aFwiOiBgJHtmb3JtLnNlYXJjaEJhci53aWR0aH1weGAsXG4gICAgXCItLXByZXZpZXctc2VhcmNoLWhlaWdodFwiOiBgJHtmb3JtLnNlYXJjaEJhci5oZWlnaHR9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXNlYXJjaC1tYXJnaW4tYm90dG9tXCI6IGAke2Zvcm0uc2VhcmNoQmFyLm1hcmdpbkJvdHRvbX1weGAsXG4gICAgXCItLXByZXZpZXctc2VhcmNoLWljb24tc2l6ZVwiOiBgJHtmb3JtLnNlYXJjaEJhci5pY29uU2l6ZX1weGAsXG4gICAgXCItLXByZXZpZXctcHJvZmlsZS1wYWRkaW5nLXhcIjogYCR7Zm9ybS5wcm9maWxlQ2FyZC5wYWRkaW5nWH1weGAsXG4gICAgXCItLXByZXZpZXctcHJvZmlsZS1wYWRkaW5nLXlcIjogYCR7Zm9ybS5wcm9maWxlQ2FyZC5wYWRkaW5nWX1weGAsXG4gICAgXCItLXByZXZpZXctcHJvZmlsZS1hdmF0YXItc2l6ZVwiOiBgJHtmb3JtLnByb2ZpbGVDYXJkLmF2YXRhclNpemV9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXByb2ZpbGUtdGl0bGUtc2l6ZVwiOiBgJHtmb3JtLnByb2ZpbGVDYXJkLnRpdGxlU2l6ZX1weGAsXG4gICAgXCItLXByZXZpZXctcHJvZmlsZS1taW4taGVpZ2h0XCI6IGAke2Zvcm0ucHJvZmlsZUNhcmQubWluSGVpZ2h0fXB4YCxcbiAgICBcIi0tcHJldmlldy1wcm9maWxlLXNvY2lhbC1idXR0b24tc2l6ZVwiOiBgJHtmb3JtLnByb2ZpbGVDYXJkLnNvY2lhbEJ1dHRvblNpemV9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXBsYXllci1wYWRkaW5nXCI6IGAke2Zvcm0ubXVzaWNQbGF5ZXIuY2FyZFBhZGRpbmd9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXBsYXllci1jb3Zlci1zaXplXCI6IGAke2Zvcm0ubXVzaWNQbGF5ZXIuY292ZXJTaXplfXB4YCxcbiAgICBcIi0tcHJldmlldy1wbGF5ZXItY29udHJvbC1zaXplXCI6IGAke2Zvcm0ubXVzaWNQbGF5ZXIuY29udHJvbFNpemV9cHhgLFxuICAgIFwiLS1wcmV2aWV3LXBsYXllci1wcmltYXJ5LWNvbnRyb2wtc2l6ZVwiOiBgJHtmb3JtLm11c2ljUGxheWVyLnByaW1hcnlDb250cm9sU2l6ZX1weGAsXG4gICAgXCItLXByZXZpZXctZmxvYXRpbmctd2lkdGhcIjogYCR7Zm9ybS5tdXNpY1BsYXllci5mbG9hdGluZ1dpZHRofXB4YCxcbiAgICBcIi0tcHJldmlldy1mbG9hdGluZy1oZWlnaHRcIjogYCR7Zm9ybS5tdXNpY1BsYXllci5mbG9hdGluZ0hlaWdodH1weGAsXG4gICAgXCItLXByZXZpZXctZmxvYXRpbmctY292ZXItc2l6ZVwiOiBgJHtmb3JtLm11c2ljUGxheWVyLmZsb2F0aW5nQ292ZXJTaXplfXB4YCxcbiAgICBcIi0tcHJldmlldy1seXJpYy1oZWlnaHRcIjogYCR7Zm9ybS5seXJpY0Jhci5oZWlnaHR9cHhgLFxuICAgIFwiLS1wcmV2aWV3LWx5cmljLXBhZGRpbmcteFwiOiBgJHtmb3JtLmx5cmljQmFyLnBhZGRpbmdYfXB4YCxcbiAgICBcIi0tcHJldmlldy1seXJpYy1yYWRpdXNcIjogYCR7Zm9ybS5seXJpY0Jhci5yYWRpdXN9cHhgLFxuICAgIFwiLS1wcmV2aWV3LWx5cmljLW9wYWNpdHlcIjogU3RyaW5nKGZvcm0ubHlyaWNCYXIub3BhY2l0eSksXG4gICAgXCItLXByZXZpZXctbHlyaWMtZm9udC1zaXplXCI6IGAke2Zvcm0ubHlyaWNCYXIuZm9udFNpemV9cHhgLFxuICAgIGZvbnRGYW1pbHk6IGZvcm0uZm9udEZhbWlseSxcbiAgfTtcbn07XG5cbnR5cGUgUmFuZ2VDb250cm9sUHJvcHMgPSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIG1heDogbnVtYmVyO1xuICBtaW46IG51bWJlcjtcbiAgc3RlcDogbnVtYmVyO1xuICB2YWx1ZTogbnVtYmVyO1xuICBzdWZmaXg/OiBzdHJpbmc7XG4gIG9uQ2hhbmdlOiAodmFsdWU6IG51bWJlcikgPT4gdm9pZDtcbn07XG5cbmNvbnN0IFJhbmdlQ29udHJvbCA9ICh7IGxhYmVsLCBtYXgsIG1pbiwgc3RlcCwgc3VmZml4ID0gXCJcIiwgdmFsdWUsIG9uQ2hhbmdlIH06IFJhbmdlQ29udHJvbFByb3BzKSA9PiAoXG4gIDxsYWJlbCBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLWZpZWxkXCI+XG4gICAgPHNwYW4+XG4gICAgICB7bGFiZWx9XG4gICAgICA8c3Ryb25nPlxuICAgICAgICB7dmFsdWV9XG4gICAgICAgIHtzdWZmaXh9XG4gICAgICA8L3N0cm9uZz5cbiAgICA8L3NwYW4+XG4gICAgPGlucHV0XG4gICAgICBtYXg9e21heH1cbiAgICAgIG1pbj17bWlufVxuICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25DaGFuZ2UobnVtYmVyVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKSl9XG4gICAgICBzdGVwPXtzdGVwfVxuICAgICAgdHlwZT1cInJhbmdlXCJcbiAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAvPlxuICA8L2xhYmVsPlxuKTtcblxuY29uc3QgbWFrZVByZXZpZXdDYXJkID0gKGluZGV4OiBudW1iZXIpOiBBcHBlYXJhbmNlUHJldmlld0NhcmQgPT4gKHtcbiAgaWQ6IGBjdXN0b20tJHtEYXRlLm5vdygpfS0ke2luZGV4fWAsXG4gIGV5ZWJyb3c6IFwi5paw5aKe5Y2h54mHXCIsXG4gIHRpdGxlOiBg6Ieq5a6a5LmJ5Y2h54mHICR7aW5kZXh9YCxcbiAgZGVzY3JpcHRpb246IFwi55So5p2l5rWL6K+V5pW06aG16aKE6KeI6YeM55qE5Y2h54mH5q+U5L6L44CB6YCP5piO5bqm5ZKM5o6S5biD44CCXCIsXG4gIG1ldGE6IFwiUHJldmlld1wiLFxuICBhY3Rpb25MYWJlbDogXCLmn6XnnItcIixcbiAgdmFyaWFudDogXCJzb2Z0XCIsXG4gIHdpZHRoVW5pdHM6IDQsXG4gIG1pbkhlaWdodDogMTgwLFxufSk7XG5cbmNvbnN0IGdldENhcmRHcmlkU3R5bGUgPSAoY2FyZDogQXBwZWFyYW5jZVByZXZpZXdDYXJkKTogUHJldmlld1N0eWxlID0+ICh7XG4gIFwiLS1jYXJkLW1pbi1oZWlnaHRcIjogYCR7Y2FyZC5taW5IZWlnaHR9cHhgLFxuICBncmlkQ29sdW1uOiBgc3BhbiAke2NhcmQud2lkdGhVbml0c31gLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcGVhcmFuY2VFZGl0b3IoKSB7XG4gIGNvbnN0IFtzb3VyY2UsIHNldFNvdXJjZV0gPSB1c2VTdGF0ZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oe30pO1xuICBjb25zdCBbZm9ybSwgc2V0Rm9ybV0gPSB1c2VTdGF0ZTxBcHBlYXJhbmNlQ29uZmlnRm9ybT4oYXBwZWFyYW5jZURlZmF1bHRzKTtcbiAgY29uc3QgW3NlbGVjdGVkQ2FyZElkLCBzZXRTZWxlY3RlZENhcmRJZF0gPSB1c2VTdGF0ZShhcHBlYXJhbmNlRGVmYXVsdHMucHJldmlld0NhcmRzWzBdPy5pZCA/PyBcIlwiKTtcbiAgY29uc3QgW3NlbGVjdGVkTW9kdWxlLCBzZXRTZWxlY3RlZE1vZHVsZV0gPSB1c2VTdGF0ZTxTZWxlY3RlZE1vZHVsZT4oXCJuYXZpZ2F0aW9uXCIpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIGdldFBhZ2VDb25maWcoXCJhcHBlYXJhbmNlXCIpXG4gICAgICAudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQXBwZWFyYW5jZUNvbmZpZyhjb25maWcuanNvbik7XG4gICAgICAgIHNldFNvdXJjZShwYXJzZWQuc291cmNlKTtcbiAgICAgICAgc2V0Rm9ybShwYXJzZWQuZm9ybSk7XG4gICAgICAgIHNldFNlbGVjdGVkQ2FyZElkKHBhcnNlZC5mb3JtLnByZXZpZXdDYXJkc1swXT8uaWQgPz8gXCJcIik7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgobmV4dEVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICBzZXRFcnJvcihuZXh0RXJyb3IubWVzc2FnZSk7XG4gICAgICB9KVxuICAgICAgLmZpbmFsbHkoKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgcHJldmlld1N0eWxlID0gdXNlTWVtbygoKSA9PiBidWlsZFByZXZpZXdTdHlsZShmb3JtKSwgW2Zvcm1dKTtcbiAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gZm9ybS5wcmV2aWV3Q2FyZHMuZmluZCgoY2FyZCkgPT4gY2FyZC5pZCA9PT0gc2VsZWN0ZWRDYXJkSWQpID8/IGZvcm0ucHJldmlld0NhcmRzWzBdO1xuICBjb25zdCBzZWxlY3RlZE1vZHVsZU1ldGEgPSBtb2R1bGVPcHRpb25zLmZpbmQoKG9wdGlvbikgPT4gb3B0aW9uLmlkID09PSBzZWxlY3RlZE1vZHVsZSkgPz8gbW9kdWxlT3B0aW9uc1swXTtcblxuICBjb25zdCB1cGRhdGVGaWVsZCA9IDxLZXkgZXh0ZW5kcyBrZXlvZiBBcHBlYXJhbmNlQ29uZmlnRm9ybT4oa2V5OiBLZXksIHZhbHVlOiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtLZXldKSA9PiB7XG4gICAgc2V0Rm9ybSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgW2tleV06IHZhbHVlIH0pKTtcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZVByZXZpZXdDYXJkcyA9IChjYXJkczogQXBwZWFyYW5jZVByZXZpZXdDYXJkW10pID0+IHtcbiAgICB1cGRhdGVGaWVsZChcInByZXZpZXdDYXJkc1wiLCBjYXJkcyk7XG4gIH07XG5cbiAgY29uc3QgdXBkYXRlTmF2aWdhdGlvbiA9IDxLZXkgZXh0ZW5kcyBrZXlvZiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtcIm5hdmlnYXRpb25cIl0+KFxuICAgIGtleTogS2V5LFxuICAgIHZhbHVlOiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtcIm5hdmlnYXRpb25cIl1bS2V5XVxuICApID0+IHtcbiAgICB1cGRhdGVGaWVsZChcIm5hdmlnYXRpb25cIiwgeyAuLi5mb3JtLm5hdmlnYXRpb24sIFtrZXldOiB2YWx1ZSB9KTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVTZWFyY2hCYXIgPSA8S2V5IGV4dGVuZHMga2V5b2YgQXBwZWFyYW5jZUNvbmZpZ0Zvcm1bXCJzZWFyY2hCYXJcIl0+KFxuICAgIGtleTogS2V5LFxuICAgIHZhbHVlOiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtcInNlYXJjaEJhclwiXVtLZXldXG4gICkgPT4ge1xuICAgIHVwZGF0ZUZpZWxkKFwic2VhcmNoQmFyXCIsIHsgLi4uZm9ybS5zZWFyY2hCYXIsIFtrZXldOiB2YWx1ZSB9KTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVQcm9maWxlQ2FyZCA9IDxLZXkgZXh0ZW5kcyBrZXlvZiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtcInByb2ZpbGVDYXJkXCJdPihcbiAgICBrZXk6IEtleSxcbiAgICB2YWx1ZTogQXBwZWFyYW5jZUNvbmZpZ0Zvcm1bXCJwcm9maWxlQ2FyZFwiXVtLZXldXG4gICkgPT4ge1xuICAgIHVwZGF0ZUZpZWxkKFwicHJvZmlsZUNhcmRcIiwgeyAuLi5mb3JtLnByb2ZpbGVDYXJkLCBba2V5XTogdmFsdWUgfSk7XG4gIH07XG5cbiAgY29uc3QgdXBkYXRlTXVzaWNQbGF5ZXIgPSA8S2V5IGV4dGVuZHMga2V5b2YgQXBwZWFyYW5jZUNvbmZpZ0Zvcm1bXCJtdXNpY1BsYXllclwiXT4oXG4gICAga2V5OiBLZXksXG4gICAgdmFsdWU6IEFwcGVhcmFuY2VDb25maWdGb3JtW1wibXVzaWNQbGF5ZXJcIl1bS2V5XVxuICApID0+IHtcbiAgICB1cGRhdGVGaWVsZChcIm11c2ljUGxheWVyXCIsIHsgLi4uZm9ybS5tdXNpY1BsYXllciwgW2tleV06IHZhbHVlIH0pO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZUx5cmljQmFyID0gPEtleSBleHRlbmRzIGtleW9mIEFwcGVhcmFuY2VDb25maWdGb3JtW1wibHlyaWNCYXJcIl0+KFxuICAgIGtleTogS2V5LFxuICAgIHZhbHVlOiBBcHBlYXJhbmNlQ29uZmlnRm9ybVtcImx5cmljQmFyXCJdW0tleV1cbiAgKSA9PiB7XG4gICAgdXBkYXRlRmllbGQoXCJseXJpY0JhclwiLCB7IC4uLmZvcm0ubHlyaWNCYXIsIFtrZXldOiB2YWx1ZSB9KTtcbiAgfTtcblxuICBjb25zdCB1cGRhdGVTZWxlY3RlZENhcmQgPSA8S2V5IGV4dGVuZHMga2V5b2YgQXBwZWFyYW5jZVByZXZpZXdDYXJkPihcbiAgICBrZXk6IEtleSxcbiAgICB2YWx1ZTogQXBwZWFyYW5jZVByZXZpZXdDYXJkW0tleV1cbiAgKSA9PiB7XG4gICAgdXBkYXRlUHJldmlld0NhcmRzKFxuICAgICAgZm9ybS5wcmV2aWV3Q2FyZHMubWFwKChjYXJkKSA9PiAoY2FyZC5pZCA9PT0gc2VsZWN0ZWRDYXJkPy5pZCA/IHsgLi4uY2FyZCwgW2tleV06IHZhbHVlIH0gOiBjYXJkKSlcbiAgICApO1xuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZUZvbnRQcmVzZXQgPSAoZm9udFByZXNldDogQXBwZWFyYW5jZUZvbnRQcmVzZXQpID0+IHtcbiAgICBzZXRGb3JtKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGZvbnRQcmVzZXQsXG4gICAgICBmb250RmFtaWx5OiBmb250UHJlc2V0ID09PSBcImN1c3RvbVwiID8gY3VycmVudC5mb250RmFtaWx5IDogZ2V0UHJlc2V0Rm9udEZhbWlseShmb250UHJlc2V0KSxcbiAgICB9KSk7XG4gICAgc2V0TWVzc2FnZShudWxsKTtcbiAgfTtcblxuICBjb25zdCBhZGRQcmV2aWV3Q2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCBuZXh0Q2FyZCA9IG1ha2VQcmV2aWV3Q2FyZChmb3JtLnByZXZpZXdDYXJkcy5sZW5ndGggKyAxKTtcbiAgICB1cGRhdGVQcmV2aWV3Q2FyZHMoWy4uLmZvcm0ucHJldmlld0NhcmRzLCBuZXh0Q2FyZF0pO1xuICAgIHNldFNlbGVjdGVkQ2FyZElkKG5leHRDYXJkLmlkKTtcbiAgICBzZXRTZWxlY3RlZE1vZHVsZShcImNhcmRzXCIpO1xuICB9O1xuXG4gIGNvbnN0IHJlbW92ZVNlbGVjdGVkQ2FyZCA9ICgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkQ2FyZCB8fCBmb3JtLnByZXZpZXdDYXJkcy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHRDYXJkcyA9IGZvcm0ucHJldmlld0NhcmRzLmZpbHRlcigoY2FyZCkgPT4gY2FyZC5pZCAhPT0gc2VsZWN0ZWRDYXJkLmlkKTtcbiAgICB1cGRhdGVQcmV2aWV3Q2FyZHMobmV4dENhcmRzKTtcbiAgICBzZXRTZWxlY3RlZENhcmRJZChuZXh0Q2FyZHNbMF0/LmlkID8/IFwiXCIpO1xuICB9O1xuXG4gIGNvbnN0IHJlc2V0VG9EZWZhdWx0cyA9ICgpID0+IHtcbiAgICBzZXRGb3JtKGFwcGVhcmFuY2VEZWZhdWx0cyk7XG4gICAgc2V0U2VsZWN0ZWRDYXJkSWQoYXBwZWFyYW5jZURlZmF1bHRzLnByZXZpZXdDYXJkc1swXT8uaWQgPz8gXCJcIik7XG4gICAgc2V0U2VsZWN0ZWRNb2R1bGUoXCJuYXZpZ2F0aW9uXCIpO1xuICAgIHNldE1lc3NhZ2UoXCLlt7LmgaLlpI3pu5jorqTlpJbop4LvvIzkv53lrZjlkI7nlJ/mlYjjgIJcIik7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRTYXZpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IobnVsbCk7XG4gICAgc2V0TWVzc2FnZShudWxsKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGF3YWl0IHNhdmVQYWdlQ29uZmlnKFwiYXBwZWFyYW5jZVwiLCBzZXJpYWxpemVBcHBlYXJhbmNlQ29uZmlnKHNvdXJjZSwgZm9ybSkpO1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VBcHBlYXJhbmNlQ29uZmlnKHNhdmVkLmpzb24pO1xuICAgICAgc2V0U291cmNlKHBhcnNlZC5zb3VyY2UpO1xuICAgICAgc2V0Rm9ybShwYXJzZWQuZm9ybSk7XG4gICAgICBzZXRTZWxlY3RlZENhcmRJZChwYXJzZWQuZm9ybS5wcmV2aWV3Q2FyZHNbMF0/LmlkID8/IFwiXCIpO1xuICAgICAgc2V0TWVzc2FnZShcIuWkluinguiuvue9ruW3suS/neWtmO+8jOS4u+ermeWIt+aWsOWQjuS8muS9v+eUqOi/meWll+WPguaVsOOAglwiKTtcbiAgICB9IGNhdGNoIChuZXh0RXJyb3IpIHtcbiAgICAgIHNldEVycm9yKChuZXh0RXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTYXZpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzZWxlY3RNb2R1bGUgPSAobW9kdWxlOiBTZWxlY3RlZE1vZHVsZSkgPT4ge1xuICAgIHNldFNlbGVjdGVkTW9kdWxlKG1vZHVsZSk7XG4gIH07XG5cbiAgY29uc3Qgc2VsZWN0Q2FyZCA9IChjYXJkSWQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbGVjdGVkQ2FyZElkKGNhcmRJZCk7XG4gICAgc2V0U2VsZWN0ZWRNb2R1bGUoXCJjYXJkc1wiKTtcbiAgfTtcblxuICBjb25zdCByZW5kZXJNb2R1bGVDb250cm9scyA9ICgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRNb2R1bGUgPT09IFwiZ2xvYmFsXCIpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jb250cm9sLWdyaWRcIj5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5pmu6YCa5Y2h54mHXCIgbWF4PXswLjl9IG1pbj17MC4xOH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlRmllbGQoXCJwYW5lbE9wYWNpdHlcIiwgcm91bmRlZCh2YWx1ZSkpfSBzdGVwPXswLjAxfSB2YWx1ZT17Zm9ybS5wYW5lbE9wYWNpdHl9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIumHjeeCueWNoeeJh1wiIG1heD17MC45NX0gbWluPXswLjI4fSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVGaWVsZChcInBhbmVsU3Ryb25nT3BhY2l0eVwiLCByb3VuZGVkKHZhbHVlKSl9IHN0ZXA9ezAuMDF9IHZhbHVlPXtmb3JtLnBhbmVsU3Ryb25nT3BhY2l0eX0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5p+U5YWJ5bGCXCIgbWF4PXswLjI4fSBtaW49ezAuMDJ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwicGFuZWxTb2Z0T3BhY2l0eVwiLCByb3VuZGVkKHZhbHVlKSl9IHN0ZXA9ezAuMDF9IHZhbHVlPXtmb3JtLnBhbmVsU29mdE9wYWNpdHl9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuinhumikeiDjOaZr1wiIG1heD17MC45fSBtaW49ezAuMTh9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwiYmFja2dyb3VuZFZpZGVvT3BhY2l0eVwiLCByb3VuZGVkKHZhbHVlKSl9IHN0ZXA9ezAuMDF9IHZhbHVlPXtmb3JtLmJhY2tncm91bmRWaWRlb09wYWNpdHl9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuWbvueJh+iDjOaZr1wiIG1heD17MC45fSBtaW49ezAuMTh9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwiYmFja2dyb3VuZEltYWdlT3BhY2l0eVwiLCByb3VuZGVkKHZhbHVlKSl9IHN0ZXA9ezAuMDF9IHZhbHVlPXtmb3JtLmJhY2tncm91bmRJbWFnZU9wYWNpdHl9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuaal+iJsumBrue9qVwiIG1heD17MX0gbWluPXswLjM1fSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVGaWVsZChcInZlaWxPcGFjaXR5XCIsIHJvdW5kZWQodmFsdWUpKX0gc3RlcD17MC4wMX0gdmFsdWU9e2Zvcm0udmVpbE9wYWNpdHl9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWRNb2R1bGUgPT09IFwibGF5b3V0XCIpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jb250cm9sLWdyaWRcIj5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5Y2h54mH5pW05L2TXCIgbWF4PXsxLjA4fSBtaW49ezAuODZ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwiY2FyZFNjYWxlXCIsIHJvdW5kZWQodmFsdWUpKX0gc3RlcD17MC4wMX0gdmFsdWU9e2Zvcm0uY2FyZFNjYWxlfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLlnIbop5Lmr5TkvotcIiBtYXg9ezEuMTh9IG1pbj17MC43Mn0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlRmllbGQoXCJyYWRpdXNTY2FsZVwiLCByb3VuZGVkKHZhbHVlKSl9IHN0ZXA9ezAuMDF9IHZhbHVlPXtmb3JtLnJhZGl1c1NjYWxlfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLmnIDlpKflrr3luqZcIiBtYXg9ezEzMjB9IG1pbj17ODgwfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVGaWVsZChcIm1heFdpZHRoXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17NH0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5tYXhXaWR0aH0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5pyA5bCP6aG16L656LedXCIgbWF4PXs4NH0gbWluPXsyNH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlRmllbGQoXCJwYWdlR3V0dGVyTWluXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17Mn0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5wYWdlR3V0dGVyTWlufSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLlk43lupTlvI/pobXovrnot51cIiBtYXg9ezEyfSBtaW49ezR9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwicGFnZUd1dHRlclZ3XCIsIHJvdW5kZWQodmFsdWUsIDEpKX0gc3RlcD17MC4xfSBzdWZmaXg9XCJ2d1wiIHZhbHVlPXtmb3JtLnBhZ2VHdXR0ZXJWd30gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5pyA5aSn6aG16L656LedXCIgbWF4PXsxODB9IG1pbj17NzJ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUZpZWxkKFwicGFnZUd1dHRlck1heFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezJ9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ucGFnZUd1dHRlck1heH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RlZE1vZHVsZSA9PT0gXCJuYXZpZ2F0aW9uXCIpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jb250cm9sLWdyaWRcIj5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5a+86Iiq6auY5bqmXCIgbWF4PXs3Nn0gbWluPXs0Nn0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTmF2aWdhdGlvbihcImhlaWdodFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubmF2aWdhdGlvbi5oZWlnaHR9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuWvvOiIquWuveW6plwiIG1heD17MTMyMH0gbWluPXs4ODB9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU5hdmlnYXRpb24oXCJtYXhXaWR0aFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezR9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubmF2aWdhdGlvbi5tYXhXaWR0aH0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5bem5Y+z5YaF6LedXCIgbWF4PXszMH0gbWluPXsxMH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTmF2aWdhdGlvbihcInBhZGRpbmdYXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5uYXZpZ2F0aW9uLnBhZGRpbmdYfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLlr7zoiKrmqKHns4pcIiBtYXg9ezM2fSBtaW49ezh9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU5hdmlnYXRpb24oXCJibHVyXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5uYXZpZ2F0aW9uLmJsdXJ9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIumTvuaOpemXtOi3nVwiIG1heD17MjR9IG1pbj17Nn0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTmF2aWdhdGlvbihcImxpbmtHYXBcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLm5hdmlnYXRpb24ubGlua0dhcH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RlZE1vZHVsZSA9PT0gXCJzZWFyY2hcIikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLWNvbnRyb2wtZ3JpZFwiPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLmkJzntKLlrr3luqZcIiBtYXg9ezgyMH0gbWluPXs1MjB9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZVNlYXJjaEJhcihcIndpZHRoXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17NH0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5zZWFyY2hCYXIud2lkdGh9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuaQnOe0oumrmOW6plwiIG1heD17NzZ9IG1pbj17NDh9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZVNlYXJjaEJhcihcImhlaWdodFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0uc2VhcmNoQmFyLmhlaWdodH0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5LiL5pa56Ze06LedXCIgbWF4PXs0NH0gbWluPXswfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVTZWFyY2hCYXIoXCJtYXJnaW5Cb3R0b21cIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLnNlYXJjaEJhci5tYXJnaW5Cb3R0b219IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuWbvuagh+Wkp+Wwj1wiIG1heD17MzB9IG1pbj17MTZ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZVNlYXJjaEJhcihcImljb25TaXplXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5zZWFyY2hCYXIuaWNvblNpemV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWRNb2R1bGUgPT09IFwicHJvZmlsZVwiKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtY29udHJvbC1ncmlkXCI+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuawtOW5s+WGhei3nVwiIG1heD17NDJ9IG1pbj17MTh9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZVByb2ZpbGVDYXJkKFwicGFkZGluZ1hcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLnByb2ZpbGVDYXJkLnBhZGRpbmdYfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLpobbpg6jlhoXot51cIiBtYXg9ezQ2fSBtaW49ezIwfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVQcm9maWxlQ2FyZChcInBhZGRpbmdZXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5wcm9maWxlQ2FyZC5wYWRkaW5nWX0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5aS05YOP5aSn5bCPXCIgbWF4PXsxNjB9IG1pbj17OTZ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZVByb2ZpbGVDYXJkKFwiYXZhdGFyU2l6ZVwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ucHJvZmlsZUNhcmQuYXZhdGFyU2l6ZX0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5qCH6aKY5a2X5Y+3XCIgbWF4PXs3Mn0gbWluPXs0MH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlUHJvZmlsZUNhcmQoXCJ0aXRsZVNpemVcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLnByb2ZpbGVDYXJkLnRpdGxlU2l6ZX0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5Y2h54mH6auY5bqmXCIgbWF4PXszODB9IG1pbj17MjIwfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVQcm9maWxlQ2FyZChcIm1pbkhlaWdodFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezJ9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ucHJvZmlsZUNhcmQubWluSGVpZ2h0fSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLnpL7kuqTmjInpkq5cIiBtYXg9ezU4fSBtaW49ezM2fSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVQcm9maWxlQ2FyZChcInNvY2lhbEJ1dHRvblNpemVcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLnByb2ZpbGVDYXJkLnNvY2lhbEJ1dHRvblNpemV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWRNb2R1bGUgPT09IFwibXVzaWNcIikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLWNvbnRyb2wtZ3JpZFwiPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLpn7PkuZDnm5LlhoXot51cIiBtYXg9ezQyfSBtaW49ezE4fSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVNdXNpY1BsYXllcihcImNhcmRQYWRkaW5nXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5tdXNpY1BsYXllci5jYXJkUGFkZGluZ30gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi6Z+z5LmQ55uS5bCB6Z2iXCIgbWF4PXsxMzJ9IG1pbj17NzJ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU11c2ljUGxheWVyKFwiY292ZXJTaXplXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5tdXNpY1BsYXllci5jb3ZlclNpemV9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuaMiemSruWkp+Wwj1wiIG1heD17NTJ9IG1pbj17MzB9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU11c2ljUGxheWVyKFwiY29udHJvbFNpemVcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLm11c2ljUGxheWVyLmNvbnRyb2xTaXplfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLkuLvmjInpkq7lpKflsI9cIiBtYXg9ezY4fSBtaW49ezQwfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVNdXNpY1BsYXllcihcInByaW1hcnlDb250cm9sU2l6ZVwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubXVzaWNQbGF5ZXIucHJpbWFyeUNvbnRyb2xTaXplfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLmta7liqjmkq3mlL7lmajlrr1cIiBtYXg9ezQ2MH0gbWluPXsyODB9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU11c2ljUGxheWVyKFwiZmxvYXRpbmdXaWR0aFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezR9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubXVzaWNQbGF5ZXIuZmxvYXRpbmdXaWR0aH0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5rWu5Yqo5pKt5pS+5Zmo6auYXCIgbWF4PXs5Mn0gbWluPXs1NH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTXVzaWNQbGF5ZXIoXCJmbG9hdGluZ0hlaWdodFwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubXVzaWNQbGF5ZXIuZmxvYXRpbmdIZWlnaHR9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIua1ruWKqOWwgemdolwiIG1heD17ODh9IG1pbj17NTJ9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZU11c2ljUGxheWVyKFwiZmxvYXRpbmdDb3ZlclNpemVcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLm11c2ljUGxheWVyLmZsb2F0aW5nQ292ZXJTaXplfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdGVkTW9kdWxlID09PSBcImx5cmljXCIpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jb250cm9sLWdyaWRcIj5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5q2M6K+N5qCP6auY5bqmXCIgbWF4PXsxMDR9IG1pbj17NTR9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUx5cmljQmFyKFwiaGVpZ2h0XCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwicHhcIiB2YWx1ZT17Zm9ybS5seXJpY0Jhci5oZWlnaHR9IC8+XG4gICAgICAgICAgPFJhbmdlQ29udHJvbCBsYWJlbD1cIuW3puWPs+WGhei3nVwiIG1heD17NDR9IG1pbj17MTR9IG9uQ2hhbmdlPXsodmFsdWUpID0+IHVwZGF0ZUx5cmljQmFyKFwicGFkZGluZ1hcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxfSBzdWZmaXg9XCJweFwiIHZhbHVlPXtmb3JtLmx5cmljQmFyLnBhZGRpbmdYfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLlnIbop5JcIiBtYXg9ezQwfSBtaW49ezE0fSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVMeXJpY0JhcihcInJhZGl1c1wiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubHlyaWNCYXIucmFkaXVzfSAvPlxuICAgICAgICAgIDxSYW5nZUNvbnRyb2wgbGFiZWw9XCLog4zmma/pgI/mmI7luqZcIiBtYXg9ezAuOTZ9IG1pbj17MC4zOH0gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTHlyaWNCYXIoXCJvcGFjaXR5XCIsIHJvdW5kZWQodmFsdWUpKX0gc3RlcD17MC4wMX0gdmFsdWU9e2Zvcm0ubHlyaWNCYXIub3BhY2l0eX0gLz5cbiAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5a2X5L2T5aSn5bCPXCIgbWF4PXsyMn0gbWluPXsxM30gb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdXBkYXRlTHlyaWNCYXIoXCJmb250U2l6ZVwiLCBNYXRoLnJvdW5kKHZhbHVlKSl9IHN0ZXA9ezF9IHN1ZmZpeD1cInB4XCIgdmFsdWU9e2Zvcm0ubHlyaWNCYXIuZm9udFNpemV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWRNb2R1bGUgPT09IFwidHlwb2dyYXBoeVwiKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQtZm9ybVwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZFwiPlxuICAgICAgICAgICAg5a2X5L2T5pa55qGIXG4gICAgICAgICAgICA8c2VsZWN0IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwZGF0ZUZvbnRQcmVzZXQoZXZlbnQudGFyZ2V0LnZhbHVlIGFzIEFwcGVhcmFuY2VGb250UHJlc2V0KX0gdmFsdWU9e2Zvcm0uZm9udFByZXNldH0+XG4gICAgICAgICAgICAgIHtmb250UHJlc2V0T3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb24udmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PlxuICAgICAgICAgICAgICAgICAge29wdGlvbi5sYWJlbH1cbiAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZCBmaWVsZC1zcGFuXCI+XG4gICAgICAgICAgICDlrZfkvZPmoIhcbiAgICAgICAgICAgIDxpbnB1dCBkaXNhYmxlZD17Zm9ybS5mb250UHJlc2V0ICE9PSBcImN1c3RvbVwifSBvbkNoYW5nZT17KGV2ZW50KSA9PiB1cGRhdGVGaWVsZChcImZvbnRGYW1pbHlcIiwgZXZlbnQudGFyZ2V0LnZhbHVlKX0gdmFsdWU9e2Zvcm0uZm9udEZhbWlseX0gLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jYXJkLWZvcm1cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLWNhcmQtbGlzdFwiPlxuICAgICAgICAgIHtmb3JtLnByZXZpZXdDYXJkcy5tYXAoKGNhcmQpID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzZWxlY3RlZENhcmRJZCA9PT0gY2FyZC5pZCA/IFwiYXBwZWFyYW5jZS1jYXJkLWNoaXAgaXMtYWN0aXZlXCIgOiBcImFwcGVhcmFuY2UtY2FyZC1jaGlwXCJ9XG4gICAgICAgICAgICAgIGtleT17Y2FyZC5pZH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q2FyZChjYXJkLmlkKX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e2NhcmQudGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgIHtjYXJkLndpZHRoVW5pdHN9LzEyIMK3IHtjYXJkLm1pbkhlaWdodH1weFxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge3NlbGVjdGVkQ2FyZCA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkLWZvcm1cIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZpZWxkXCI+XG4gICAgICAgICAgICAgICAg5bCP5qCH6aKYXG4gICAgICAgICAgICAgICAgPGlucHV0IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwZGF0ZVNlbGVjdGVkQ2FyZChcImV5ZWJyb3dcIiwgZXZlbnQudGFyZ2V0LnZhbHVlKX0gdmFsdWU9e3NlbGVjdGVkQ2FyZC5leWVicm93fSAvPlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmllbGRcIj5cbiAgICAgICAgICAgICAgICDmoIfnrb5cbiAgICAgICAgICAgICAgICA8aW5wdXQgb25DaGFuZ2U9eyhldmVudCkgPT4gdXBkYXRlU2VsZWN0ZWRDYXJkKFwibWV0YVwiLCBldmVudC50YXJnZXQudmFsdWUpfSB2YWx1ZT17c2VsZWN0ZWRDYXJkLm1ldGF9IC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZCBmaWVsZC1zcGFuXCI+XG4gICAgICAgICAgICAgICAg5qCH6aKYXG4gICAgICAgICAgICAgICAgPGlucHV0IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwZGF0ZVNlbGVjdGVkQ2FyZChcInRpdGxlXCIsIGV2ZW50LnRhcmdldC52YWx1ZSl9IHZhbHVlPXtzZWxlY3RlZENhcmQudGl0bGV9IC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZCBmaWVsZC1zcGFuXCI+XG4gICAgICAgICAgICAgICAg5o+P6L+wXG4gICAgICAgICAgICAgICAgPGlucHV0IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwZGF0ZVNlbGVjdGVkQ2FyZChcImRlc2NyaXB0aW9uXCIsIGV2ZW50LnRhcmdldC52YWx1ZSl9IHZhbHVlPXtzZWxlY3RlZENhcmQuZGVzY3JpcHRpb259IC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWVsZFwiPlxuICAgICAgICAgICAgICAgIOaMiemSruaWh+Wtl1xuICAgICAgICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17KGV2ZW50KSA9PiB1cGRhdGVTZWxlY3RlZENhcmQoXCJhY3Rpb25MYWJlbFwiLCBldmVudC50YXJnZXQudmFsdWUpfSB2YWx1ZT17c2VsZWN0ZWRDYXJkLmFjdGlvbkxhYmVsfSAvPlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmllbGRcIj5cbiAgICAgICAgICAgICAgICDmoLflvI9cbiAgICAgICAgICAgICAgICA8c2VsZWN0IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHVwZGF0ZVNlbGVjdGVkQ2FyZChcInZhcmlhbnRcIiwgZXZlbnQudGFyZ2V0LnZhbHVlIGFzIEFwcGVhcmFuY2VQcmV2aWV3Q2FyZFZhcmlhbnQpfSB2YWx1ZT17c2VsZWN0ZWRDYXJkLnZhcmlhbnR9PlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInN0cm9uZ1wiPumHjeeCueeOu+eSgzwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInNvZnRcIj7mn5TlkozljaHniYc8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJvdXRsaW5lXCI+5o+P6L655Y2h54mHPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLWNvbnRyb2wtZ3JpZFwiPlxuICAgICAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5Y2h54mH5a695bqmXCIgbWF4PXsxMn0gbWluPXszfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVTZWxlY3RlZENhcmQoXCJ3aWR0aFVuaXRzXCIsIE1hdGgucm91bmQodmFsdWUpKX0gc3RlcD17MX0gc3VmZml4PVwiLzEyXCIgdmFsdWU9e3NlbGVjdGVkQ2FyZC53aWR0aFVuaXRzfSAvPlxuICAgICAgICAgICAgICA8UmFuZ2VDb250cm9sIGxhYmVsPVwi5pyA5bCP6auY5bqmXCIgbWF4PXszNjB9IG1pbj17MTIwfSBvbkNoYW5nZT17KHZhbHVlKSA9PiB1cGRhdGVTZWxlY3RlZENhcmQoXCJtaW5IZWlnaHRcIiwgTWF0aC5yb3VuZCh2YWx1ZSkpfSBzdGVwPXsxMH0gc3VmZml4PVwicHhcIiB2YWx1ZT17c2VsZWN0ZWRDYXJkLm1pbkhlaWdodH0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInNlY29uZGFyeS1idXR0b24gYXBwZWFyYW5jZS1kYW5nZXJcIiBkaXNhYmxlZD17Zm9ybS5wcmV2aWV3Q2FyZHMubGVuZ3RoIDw9IDF9IG9uQ2xpY2s9e3JlbW92ZVNlbGVjdGVkQ2FyZH0gdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICDliKDpmaTlvZPliY3ljaHniYdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJwYWdlIGFwcGVhcmFuY2UtZWRpdG9yXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsIGFwcGVhcmFuY2UtaGVyb1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImV5ZWJyb3dcIj5HbG9iYWwgVGhlbWU8L3A+XG4gICAgICAgICAgPGgxPuWkluinguiuvue9rjwvaDE+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1tdXRlZFwiPlxuICAgICAgICAgICAg5Y+z5L6n5piv5o6l6L+R5Li756uZ5q+U5L6L55qE5a6e5pe25pW06aG16aKE6KeI77yb54K55Ye76aKE6KeI6YeM55qE5a+86Iiq5qCP44CB5pCc57Si5qCP44CB5Liq5Lq65Y2h44CB5pKt5pS+5Zmo44CB5q2M6K+N5qCP5oiW5YaF5a655Y2h54mH77yM5bem5L6n5Lya5YiH5o2i5Yiw5a+55bqU5o6n5Lu244CCXG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhY3Rpb25zXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJzZWNvbmRhcnktYnV0dG9uXCIgb25DbGljaz17cmVzZXRUb0RlZmF1bHRzfSB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICDmgaLlpI3pu5jorqRcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInByaW1hcnktYnV0dG9uXCIgZGlzYWJsZWQ9e3NhdmluZyB8fCBsb2FkaW5nfSBvbkNsaWNrPXtoYW5kbGVTYXZlfSB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICB7c2F2aW5nID8gXCLkv53lrZjkuK0uLi5cIiA6IFwi5L+d5a2Y6K6+572uXCJ9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHtlcnJvciA/IDxwIGNsYXNzTmFtZT1cImVycm9yXCI+e2Vycm9yfTwvcD4gOiBudWxsfVxuICAgICAge21lc3NhZ2UgPyA8cCBjbGFzc05hbWU9XCJoaW50XCI+e21lc3NhZ2V9PC9wPiA6IG51bGx9XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS13b3JrYmVuY2hcIj5cbiAgICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cInBhbmVsIGFwcGVhcmFuY2UtaW5zcGVjdG9yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXNlY3Rpb24taGVhZCBhcHBlYXJhbmNlLXNlY3Rpb24taGVhZC0tc3BsaXRcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImV5ZWJyb3dcIj5JbnNwZWN0b3I8L3A+XG4gICAgICAgICAgICAgIDxoMj57c2VsZWN0ZWRNb2R1bGVNZXRhLmxhYmVsfTwvaDI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtzZWxlY3RlZE1vZHVsZSA9PT0gXCJjYXJkc1wiID8gKFxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInNlY29uZGFyeS1idXR0b25cIiBvbkNsaWNrPXthZGRQcmV2aWV3Q2FyZH0gdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgIOa3u+WKoOWNoeeJh1xuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLW1vZHVsZS10YWJzXCIgYXJpYS1sYWJlbD1cIuWkluinguaooeWdl1wiPlxuICAgICAgICAgICAge21vZHVsZU9wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2VsZWN0ZWRNb2R1bGUgPT09IG9wdGlvbi5pZCA/IFwiYXBwZWFyYW5jZS1tb2R1bGUtdGFiIGlzLWFjdGl2ZVwiIDogXCJhcHBlYXJhbmNlLW1vZHVsZS10YWJcIn1cbiAgICAgICAgICAgICAgICBrZXk9e29wdGlvbi5pZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RNb2R1bGUob3B0aW9uLmlkKX1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e29wdGlvbi5sYWJlbH08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57b3B0aW9uLmhpbnR9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1jb250ZXh0LWNhcmRcIj5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImV5ZWJyb3dcIj57c2VsZWN0ZWRNb2R1bGVNZXRhLmhpbnR9PC9wPlxuICAgICAgICAgICAge3JlbmRlck1vZHVsZUNvbnRyb2xzKCl9XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8L2FzaWRlPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInBhbmVsIGFwcGVhcmFuY2UtcHJldmlldy1wYW5lbFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1zZWN0aW9uLWhlYWQgYXBwZWFyYW5jZS1zZWN0aW9uLWhlYWQtLXNwbGl0XCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJleWVicm93XCI+UHJldmlldzwvcD5cbiAgICAgICAgICAgICAgPGgyPuWunuaXtuaVtOmhtemihOiniDwvaDI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInBpbGwgbXV0ZWRcIj57Zm9ybS5wcmV2aWV3Q2FyZHMubGVuZ3RofSDlvKDpooTop4jljaHniYc8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdcIiBzdHlsZT17cHJldmlld1N0eWxlfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19iYWNrZ3JvdW5kXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGFwcGVhcmFuY2UtcHJldmlld19fbmF2IGFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZSAke3NlbGVjdGVkTW9kdWxlID09PSBcIm5hdmlnYXRpb25cIiA/IFwiaXMtc2VsZWN0ZWQtbW9kdWxlXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNlbGVjdE1vZHVsZShcIm5hdmlnYXRpb25cIil9XG4gICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHN0cm9uZz5cbiAgICAgICAgICAgICAgICBTaGlua2kgPHNwYW4+4piFPC9zcGFuPiBTYWt1cmFcbiAgICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICAgIDxzcGFuPummlumhtTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4+5paH56i/PC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj7otYTmlpnlupM8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuPueslOiusDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4+54Wn54mH5aKZPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fc2hlbGxcIj5cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGFwcGVhcmFuY2UtcHJldmlld19fc2VhcmNoIGFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZSAke3NlbGVjdGVkTW9kdWxlID09PSBcInNlYXJjaFwiID8gXCJpcy1zZWxlY3RlZC1tb2R1bGVcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RNb2R1bGUoXCJzZWFyY2hcIil9XG4gICAgICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX3NlYXJjaC1pY29uXCI+4oyVPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+5pCc57Si5paH56i/44CB6LWE5paZ44CB56yU6K6wLi4uPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPGkgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX2hlcm8tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxhcnRpY2xlXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhcHBlYXJhbmNlLXByZXZpZXdfX3Byb2ZpbGUgYXBwZWFyYW5jZS1wcmV2aWV3X19jYXJkIGFwcGVhcmFuY2UtcHJldmlld19fY2FyZC0tc3Ryb25nIGFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZSAke3NlbGVjdGVkTW9kdWxlID09PSBcInByb2ZpbGVcIiA/IFwiaXMtc2VsZWN0ZWQtbW9kdWxlXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RNb2R1bGUoXCJwcm9maWxlXCIpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlLXRvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fYXZhdGFyLXNoZWxsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX2F2YXRhclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBhbHQ9XCJTaGlua2kg5aS05YOP6aKE6KeIXCIgc3JjPVwiaHR0cHM6Ly9zMS5heDF4LmNvbS8yMDIzLzA3LzI4L3BDeDZqM1IuanBnXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlLWNvcHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJleWVicm93XCI+5YWz5LqO5oiRPC9wPlxuICAgICAgICAgICAgICAgICAgICAgIDxoMz5TaGlua2k8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgIDxwPue+juWwkeWls+a4uOaIj+eIseWlveiAhe+8jOWvueWQhOenjeWQhOagt+eahOefpeivhuaEn+WFtOi2o+OAgjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8c21hbGw+6LWE5paZ5bKb5LuN5Zyo57yT5oWi5Y+R5YWJ44CCPC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlLWZvb3RlclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YXJ0aWNsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+NTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+5paH56i/PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgICAgICAgICAgICAgICA8YXJ0aWNsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+MzY8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPuadoeebrjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fc29jaWFsLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPkc8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4+Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5APC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvYXJ0aWNsZT5cblxuICAgICAgICAgICAgICAgIDxhcnRpY2xlXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllciBhcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQgYXBwZWFyYW5jZS1wcmV2aWV3X19jYXJkLS1zdHJvbmcgYXBwZWFyYW5jZS1wcmV2aWV3X19zZWxlY3RhYmxlICR7c2VsZWN0ZWRNb2R1bGUgPT09IFwibXVzaWNcIiA/IFwiaXMtc2VsZWN0ZWQtbW9kdWxlXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RNb2R1bGUoXCJtdXNpY1wiKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fcGxheWVyLW9yYlwiIC8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fcGxheWVyLXRvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fcmVjb3JkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19wbGF5ZXItY29weVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fY2hpcFwiPkNsb3VkIE11c2ljPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxoMz7nvZHmmJPkupHmrYzmm7IgNDkzMTg5NjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgPHA+572R5piT5LqR6Z+z5LmQPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX2lubGluZS1seXJpY1wiPkNpYWxsb++9nijiiKDjg7vPiSAp4oyS4piGPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fcGxheWVyLXByb2dyZXNzXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPjA6NDI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9ncmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj4zOjU4PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGVhcmFuY2UtcHJldmlld19fY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+4peAPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiaXMtcHJpbWFyeVwiIHR5cGU9XCJidXR0b25cIj7ilrY8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+4pa2PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhcHBlYXJhbmNlLXByZXZpZXdfX2x5cmljIGFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZSAke3NlbGVjdGVkTW9kdWxlID09PSBcImx5cmljXCIgPyBcImlzLXNlbGVjdGVkLW1vZHVsZVwiIDogXCJcIn1gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNlbGVjdE1vZHVsZShcImx5cmljXCIpfVxuICAgICAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHRhYkluZGV4PXswfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+4pau4pau4pau4pau4pauPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2lhbGxv772eKOKIoOODu8+JICnijJLimIY8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8ZW0+4pmrPC9lbT5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX2dyaWRcIj5cbiAgICAgICAgICAgICAgICB7Zm9ybS5wcmV2aWV3Q2FyZHMubWFwKChjYXJkKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8YXJ0aWNsZVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BhcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQgYXBwZWFyYW5jZS1wcmV2aWV3X19jYXJkLS0ke2NhcmQudmFyaWFudH0gJHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhcmRJZCA9PT0gY2FyZC5pZCAmJiBzZWxlY3RlZE1vZHVsZSA9PT0gXCJjYXJkc1wiID8gXCJpcy1zZWxlY3RlZFwiIDogXCJcIlxuICAgICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICAgICAga2V5PXtjYXJkLmlkfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDYXJkKGNhcmQuaWQpfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17Z2V0Q2FyZEdyaWRTdHlsZShjYXJkKX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImV5ZWJyb3dcIj57Y2FyZC5leWVicm93fTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y2FyZC5tZXRhfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57Y2FyZC50aXRsZX08L2gzPlxuICAgICAgICAgICAgICAgICAgICA8cD57Y2FyZC5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiPntjYXJkLmFjdGlvbkxhYmVsfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9hcnRpY2xlPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPHN0eWxlPntgXG4gICAgICAgIC5hcHBlYXJhbmNlLWhlcm8sXG4gICAgICAgIC5hcHBlYXJhbmNlLXNlY3Rpb24taGVhZC0tc3BsaXQge1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgICAgIGdhcDogMTZweDtcbiAgICAgICAgICBhbGlnbi1pdGVtczogZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtbXV0ZWQge1xuICAgICAgICAgIG1heC13aWR0aDogOTAwcHg7XG4gICAgICAgICAgbWFyZ2luLXRvcDogMTBweDtcbiAgICAgICAgICBjb2xvcjogIzZmNTczYjtcbiAgICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2Utd29ya2JlbmNoIHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogbWlubWF4KDM2MHB4LCAwLjQ0ZnIpIG1pbm1heCgwLCAxZnIpO1xuICAgICAgICAgIGdhcDogMTRweDtcbiAgICAgICAgICBhbGlnbi1pdGVtczogc3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1pbnNwZWN0b3IsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXctcGFuZWwge1xuICAgICAgICAgIHBhZGRpbmc6IDE2cHg7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1pbnNwZWN0b3Ige1xuICAgICAgICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgICAgICAgdG9wOiAxNHB4O1xuICAgICAgICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSAyOHB4KTtcbiAgICAgICAgICBvdmVyZmxvdzogYXV0bztcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXNlY3Rpb24taGVhZCB7XG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLW1vZHVsZS10YWJzIHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIG1pbm1heCgwLCAxZnIpKTtcbiAgICAgICAgICBnYXA6IDhweDtcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtbW9kdWxlLXRhYixcbiAgICAgICAgLmFwcGVhcmFuY2UtY2FyZC1jaGlwIHtcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEyNiwgOTAsIDUyLCAwLjE2KTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNXB4O1xuICAgICAgICAgIHBhZGRpbmc6IDlweCAxMHB4O1xuICAgICAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI4KTtcbiAgICAgICAgICBjb2xvcjogIzRiMzgyNDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLW1vZHVsZS10YWIuaXMtYWN0aXZlLFxuICAgICAgICAuYXBwZWFyYW5jZS1jYXJkLWNoaXAuaXMtYWN0aXZlIHtcbiAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMTgzLCAxMDMsIDQ0LCAwLjU4KTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjM5LCAyMTEsIDAuNzIpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjU2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLW1vZHVsZS10YWIgc3Ryb25nLFxuICAgICAgICAuYXBwZWFyYW5jZS1tb2R1bGUtdGFiIHNwYW4sXG4gICAgICAgIC5hcHBlYXJhbmNlLWNhcmQtY2hpcCBzdHJvbmcsXG4gICAgICAgIC5hcHBlYXJhbmNlLWNhcmQtY2hpcCBzcGFuIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1tb2R1bGUtdGFiIHNwYW4sXG4gICAgICAgIC5hcHBlYXJhbmNlLWNhcmQtY2hpcCBzcGFuIHtcbiAgICAgICAgICBtYXJnaW4tdG9wOiAzcHg7XG4gICAgICAgICAgY29sb3I6ICM3YjYwNDA7XG4gICAgICAgICAgZm9udC1zaXplOiAwLjc4cmVtO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1jb250ZXh0LWNhcmQge1xuICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgICAgICAgZ2FwOiAxMnB4O1xuICAgICAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxMjksIDkxLCA1MiwgMC4xMik7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtY29udHJvbC1ncmlkLFxuICAgICAgICAuYXBwZWFyYW5jZS1jYXJkLWZvcm0ge1xuICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpO1xuICAgICAgICAgIGdhcDogMTBweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLWNhcmQtZm9ybSB7XG4gICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1maWVsZCB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBnYXA6IDhweDtcbiAgICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTI5LCA5MSwgNTIsIDAuMTYpO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7XG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtZmllbGQgc3BhbiB7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgICAgZ2FwOiAxMnB4O1xuICAgICAgICAgIGNvbG9yOiAjNTk0NDJmO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMC44NnJlbTtcbiAgICAgICAgICBmb250LXdlaWdodDogODAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtZmllbGQgc3Ryb25nIHtcbiAgICAgICAgICBjb2xvcjogIzlhNTUyMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLWZpZWxkIGlucHV0W3R5cGU9XCJyYW5nZVwiXSB7XG4gICAgICAgICAgYWNjZW50LWNvbG9yOiAjYjc2NjJjO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtY2FyZC1saXN0IHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIG1pbm1heCgwLCAxZnIpKTtcbiAgICAgICAgICBnYXA6IDhweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLWRhbmdlciB7XG4gICAgICAgICAganVzdGlmeS1zZWxmOiBzdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXcge1xuICAgICAgICAgIG92ZXJmbG93OiBhdXRvO1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICBtaW4taGVpZ2h0OiBtaW4oNzR2aCwgNzYwcHgpO1xuICAgICAgICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSAxOTBweCk7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUyKTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAzNHB4O1xuICAgICAgICAgIHBhZGRpbmc6IDIycHg7XG4gICAgICAgICAgYmFja2dyb3VuZDogIzA0MDgxNjtcbiAgICAgICAgICBjb2xvcjogI2Y4ZmJmZjtcbiAgICAgICAgICBib3gtc2hhZG93OiBpbnNldCAwIDFweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xOCksIDAgMThweCA0NHB4IHJnYmEoNDksIDMxLCAxNywgMC4xNik7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19iYWNrZ3JvdW5kIHtcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgaW5zZXQ6IDA7XG4gICAgICAgICAgYmFja2dyb3VuZDpcbiAgICAgICAgICAgIGxpbmVhci1ncmFkaWVudChyZ2JhKDIsIDYsIDIzLCBjYWxjKDAuMzQgKiB2YXIoLS1wcmV2aWV3LXZlaWwpKSksIHJnYmEoMiwgNiwgMjMsIGNhbGMoMC41OCAqIHZhcigtLXByZXZpZXctdmVpbCkpKSksXG4gICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE4JSAxNCUsIHJnYmEoMjU1LCAyNTUsIDI1NSwgY2FsYygwLjE2ICogdmFyKC0tcHJldmlldy1iZy12aWRlbykpKSwgdHJhbnNwYXJlbnQgMTglKSxcbiAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgNzYlIDI0JSwgcmdiYSgxNjUsIDE4MCwgMjUyLCBjYWxjKDAuNCAqIHZhcigtLXByZXZpZXctYmctaW1hZ2UpKSksIHRyYW5zcGFyZW50IDMwJSksXG4gICAgICAgICAgICBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDYxLCA5MSwgMTM5LCB2YXIoLS1wcmV2aWV3LWJnLWltYWdlKSksIHJnYmEoMzMsIDM0LCA4MywgdmFyKC0tcHJldmlldy1iZy12aWRlbykpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX25hdixcbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc2hlbGwge1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZSB7XG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgIG91dGxpbmU6IDAgc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgdHJhbnNpdGlvbjogb3V0bGluZS1jb2xvciAxNjBtcyBlYXNlLCB0cmFuc2Zvcm0gMTYwbXMgZWFzZSwgYm94LXNoYWRvdyAxNjBtcyBlYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc2VsZWN0YWJsZS5pcy1zZWxlY3RlZC1tb2R1bGUsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQuaXMtc2VsZWN0ZWQge1xuICAgICAgICAgIG91dGxpbmU6IDJweCBzb2xpZCByZ2JhKDI1NSwgMjM2LCAxNzksIDAuODYpO1xuICAgICAgICAgIG91dGxpbmUtb2Zmc2V0OiAzcHg7XG4gICAgICAgICAgYm94LXNoYWRvdzogMCAwIDAgNnB4IHJnYmEoMjUwLCAyMDQsIDIxLCAwLjA4KSwgMCAxOHB4IDQycHggcmdiYSgyLCA2LCAyMywgMC4yNCk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19uYXYge1xuICAgICAgICAgIHdpZHRoOiBtaW4oY2FsYygxMDAlIC0gY2xhbXAodmFyKC0tcHJldmlldy1ndXR0ZXItbWluKSwgdmFyKC0tcHJldmlldy1ndXR0ZXItdncpLCB2YXIoLS1wcmV2aWV3LWd1dHRlci1tYXgpKSksIHZhcigtLXByZXZpZXctbmF2LW1heC13aWR0aCkpO1xuICAgICAgICAgIG1hcmdpbjogMCBhdXRvO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgZ2FwOiB2YXIoLS1wcmV2aWV3LW5hdi1saW5rLWdhcCk7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgICAgbWluLWhlaWdodDogY2FsYyh2YXIoLS1wcmV2aWV3LW5hdi1oZWlnaHQpICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSk7XG4gICAgICAgICAgcGFkZGluZzogY2FsYyg5cHggKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKSBjYWxjKHZhcigtLXByZXZpZXctbmF2LXBhZGRpbmcteCkgKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTYpO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNik7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKHZhcigtLXByZXZpZXctbmF2LWJsdXIpKTtcbiAgICAgICAgICBmb250LXNpemU6IGNhbGMoMC45cmVtICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19uYXYgc3Ryb25nIHNwYW4ge1xuICAgICAgICAgIGNvbG9yOiAjZmFjYzE1O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc2hlbGwge1xuICAgICAgICAgIHdpZHRoOiBtaW4oY2FsYygxMDAlIC0gY2xhbXAodmFyKC0tcHJldmlldy1ndXR0ZXItbWluKSwgdmFyKC0tcHJldmlldy1ndXR0ZXItdncpLCB2YXIoLS1wcmV2aWV3LWd1dHRlci1tYXgpKSksIHZhcigtLXByZXZpZXctbWF4LXdpZHRoKSk7XG4gICAgICAgICAgbWFyZ2luOiAyNnB4IGF1dG8gMDtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdhcDogY2FsYygxOHB4ICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19zZWFyY2gge1xuICAgICAgICAgIHdpZHRoOiBtaW4oMTAwJSwgdmFyKC0tcHJldmlldy1zZWFyY2gtd2lkdGgpKTtcbiAgICAgICAgICBtaW4taGVpZ2h0OiBjYWxjKHZhcigtLXByZXZpZXctc2VhcmNoLWhlaWdodCkgKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBtYXJnaW46IDAgYXV0byB2YXIoLS1wcmV2aWV3LXNlYXJjaC1tYXJnaW4tYm90dG9tKTtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgZ2FwOiAxNHB4O1xuICAgICAgICAgIHBhZGRpbmc6IDAgMjRweDtcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIxMSwgMjIyLCAyNDUsIDAuMTYpO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6XG4gICAgICAgICAgICBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHJnYmEoNDIsIDU4LCA4OCwgMC45KSwgcmdiYSg3NywgNTMsIDc5LCAwLjc4KSksXG4gICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDkyJSA1MCUsIHJnYmEoMjAzLCAyMjYsIDE4OSwgMC4yMiksIHRyYW5zcGFyZW50IDIyJSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogMCAyMnB4IDQ2cHggcmdiYSg3LCAxMiwgMjQsIDAuMjgpLCBpbnNldCAwIDFweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3NlYXJjaC1pY29uIHtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tcHJldmlldy1zZWFyY2gtaWNvbi1zaXplKTtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXByZXZpZXctc2VhcmNoLWljb24tc2l6ZSk7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgICAgICAgIGNvbG9yOiByZ2JhKDE3OCwgMjAzLCAyMzksIDAuODQpO1xuICAgICAgICAgIGZvbnQtc2l6ZTogdmFyKC0tcHJldmlldy1zZWFyY2gtaWNvbi1zaXplKTtcbiAgICAgICAgICBsaW5lLWhlaWdodDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3NlYXJjaCBzdHJvbmcge1xuICAgICAgICAgIGZsZXg6IDE7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjI2LCAyMzIsIDI0MCwgMC43NCk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19zZWFyY2ggaSB7XG4gICAgICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIwMiwgMjU1LCAxOTUsIDAuODYpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCAxOHB4IHJnYmEoMjAyLCAyNTUsIDE5NSwgMC45KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2hlcm8tZ3JpZCB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IG1pbm1heCgwLCAxLjNmcikgbWlubWF4KDMwMHB4LCAwLjlmcik7XG4gICAgICAgICAgZ2FwOiBjYWxjKDE4cHggKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3Byb2ZpbGUsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllciB7XG4gICAgICAgICAgbWluLWhlaWdodDogY2FsYyh2YXIoLS1wcmV2aWV3LXByb2ZpbGUtbWluLWhlaWdodCkgKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3Byb2ZpbGUge1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgICBwYWRkaW5nOiBjYWxjKHZhcigtLXByZXZpZXctcHJvZmlsZS1wYWRkaW5nLXkpICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSkgY2FsYyh2YXIoLS1wcmV2aWV3LXByb2ZpbGUtcGFkZGluZy14KSAqIHZhcigtLXByZXZpZXctY2FyZC1zY2FsZSkpIDE4cHg7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlOjpiZWZvcmUsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllci1vcmIge1xuICAgICAgICAgIGNvbnRlbnQ6IFwiXCI7XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlLCByZ2JhKDEyOSwgMTQwLCAyNDgsIDAuMjgpLCB0cmFuc3BhcmVudCA2OCUpO1xuICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcHJvZmlsZTo6YmVmb3JlIHtcbiAgICAgICAgICBpbnNldDogYXV0byBhdXRvIC04MnB4IC04MnB4O1xuICAgICAgICAgIHdpZHRoOiAyMTZweDtcbiAgICAgICAgICBoZWlnaHQ6IDIxNnB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcHJvZmlsZS10b3AsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3Byb2ZpbGUtZm9vdGVyIHtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgei1pbmRleDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3Byb2ZpbGUtdG9wIHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogdmFyKC0tcHJldmlldy1wcm9maWxlLWF2YXRhci1zaXplKSBtaW5tYXgoMCwgMWZyKTtcbiAgICAgICAgICBnYXA6IDI0cHg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IHN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fYXZhdGFyIHtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tcHJldmlldy1wcm9maWxlLWF2YXRhci1zaXplKTtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXByZXZpZXctcHJvZmlsZS1hdmF0YXItc2l6ZSk7XG4gICAgICAgICAgcGFkZGluZzogNnB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDI0cHg7XG4gICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgxMjksIDE0MCwgMjQ4LCAwLjkyKSwgcmdiYSgyNDQsIDExNCwgMTgyLCAwLjcyKSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogMCAxOHB4IDQwcHggcmdiYSgxNSwgMjMsIDQyLCAwLjM0KSwgaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMzYpO1xuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0zZGVnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2F2YXRhciBpbWcge1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxOHB4O1xuICAgICAgICAgIG9iamVjdC1maXQ6IGNvdmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcHJvZmlsZS1jb3B5IHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdhcDogMTBweDtcbiAgICAgICAgICBtaW4td2lkdGg6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlIGgzIHtcbiAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgZm9udC1zaXplOiBjYWxjKHZhcigtLXByZXZpZXctcHJvZmlsZS10aXRsZS1zaXplKSAqIHZhcigtLXByZXZpZXctY2FyZC1zY2FsZSkpO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjAyO1xuICAgICAgICAgIGxldHRlci1zcGFjaW5nOiAtMC4wNGVtO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcHJvZmlsZSBwLFxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlIHNtYWxsIHtcbiAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjI2LCAyMzIsIDI0MCwgMC43OCk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9maWxlLWZvb3RlciB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IG1pbm1heCgwLCBtYXgtY29udGVudCkgMWZyO1xuICAgICAgICAgIGdhcDogMTRweDtcbiAgICAgICAgICBtYXJnaW4tdG9wOiBhdXRvO1xuICAgICAgICAgIHBhZGRpbmctdG9wOiAxM3B4O1xuICAgICAgICAgIGFsaWduLWl0ZW1zOiBlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19zdGF0cyB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCBtaW5tYXgoNjdweCwgbWF4LWNvbnRlbnQpKTtcbiAgICAgICAgICBnYXA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19zdGF0cyBhcnRpY2xlIHtcbiAgICAgICAgICBwYWRkaW5nOiAxMHB4IDE0cHg7XG4gICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc3RhdHMgYXJ0aWNsZTpmaXJzdC1jaGlsZCB7XG4gICAgICAgICAgYm9yZGVyLWxlZnQ6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19zdGF0cyBzdHJvbmcsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3N0YXRzIHNwYW4ge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc3RhdHMgc3Ryb25nIHtcbiAgICAgICAgICBjb2xvcjogI2E1YjRmYztcbiAgICAgICAgICBmb250LXNpemU6IGNhbGMoMnJlbSAqIHZhcigtLXByZXZpZXctY2FyZC1zY2FsZSkpO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc29jaWFsLXJvdyB7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICAgICAgICAgIGdhcDogOXB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc29jaWFsLXJvdyBzcGFuIHtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tcHJldmlldy1wcm9maWxlLXNvY2lhbC1idXR0b24tc2l6ZSk7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1wcmV2aWV3LXByb2ZpbGUtc29jaWFsLWJ1dHRvbi1zaXplKTtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEyKTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxN3B4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjI2LCAyMzIsIDI0MCwgMC44NCk7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDkwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllciB7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgICAgICAgZ2FwOiAxOHB4O1xuICAgICAgICAgIHBhZGRpbmc6IHZhcigtLXByZXZpZXctcGxheWVyLXBhZGRpbmcpO1xuICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wbGF5ZXItb3JiIHtcbiAgICAgICAgICB0b3A6IC02M3B4O1xuICAgICAgICAgIHJpZ2h0OiAtNjNweDtcbiAgICAgICAgICB3aWR0aDogMTk4cHg7XG4gICAgICAgICAgaGVpZ2h0OiAxOThweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllci10b3AsXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllci1jb3B5LFxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19jb250cm9scyxcbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcGxheWVyLXByb2dyZXNzLFxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19pbmxpbmUtbHlyaWMge1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcGxheWVyLXRvcCB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHZhcigtLXByZXZpZXctcGxheWVyLWNvdmVyLXNpemUpIG1pbm1heCgwLCAxZnIpO1xuICAgICAgICAgIGdhcDogMjBweDtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgIG1pbi1oZWlnaHQ6IDExMnB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcmVjb3JkIHtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXByZXZpZXctcGxheWVyLWNvdmVyLXNpemUpO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tcHJldmlldy1wbGF5ZXItY292ZXItc2l6ZSk7XG4gICAgICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI4KTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzE3MjU1NCwgIzY0NzQ4YiA1MiUsICNjMDg0ZmMpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IDAgMjBweCAzNnB4IHJnYmEoMiwgNiwgMjMsIDAuNDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fcmVjb3JkIHNwYW4ge1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICBpbnNldDogNTAlIGF1dG8gYXV0byA1MCU7XG4gICAgICAgICAgd2lkdGg6IDIycHg7XG4gICAgICAgICAgaGVpZ2h0OiAyMnB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODYpO1xuICAgICAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMTQ4LCAxNjMsIDE4NCwgMC40KTtcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllci1jb3B5IHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdhcDogN3B4O1xuICAgICAgICAgIG1pbi13aWR0aDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NoaXAge1xuICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgICAgICAgICBtaW4taGVpZ2h0OiAyNnB4O1xuICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgcGFkZGluZzogMCAxMHB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEyKTtcbiAgICAgICAgICBjb2xvcjogI2M3ZDJmZTtcbiAgICAgICAgICBmb250LXNpemU6IDAuNjhyZW07XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDkwMDtcbiAgICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4xNmVtO1xuICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wbGF5ZXIgaDMge1xuICAgICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgICBmb250LXNpemU6IDEuMzRyZW07XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDEuMTY7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wbGF5ZXIgcCxcbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19faW5saW5lLWx5cmljIHtcbiAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjI2LCAyMzIsIDI0MCwgMC43OCk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19pbmxpbmUtbHlyaWMge1xuICAgICAgICAgIGNvbG9yOiAjYzdkMmZlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMC45MnJlbTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3BsYXllci1wcm9ncmVzcyB7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDUwcHggbWlubWF4KDAsIDFmcikgNTBweDtcbiAgICAgICAgICBnYXA6IDE0cHg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBjb2xvcjogcmdiYSgxOTEsIDIxOSwgMjU0LCAwLjcyKTtcbiAgICAgICAgICBmb250LXNpemU6IDAuNzhyZW07XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX3Byb2dyZXNzIHtcbiAgICAgICAgICBoZWlnaHQ6IDZweDtcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMik7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19wcm9ncmVzcyBzcGFuIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICB3aWR0aDogMzQlO1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiBpbmhlcml0O1xuICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg5MGRlZywgIzgxOGNmOCwgI2MwODRmYyk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19jb250cm9scyB7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICBnYXA6IDE2cHg7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19jb250cm9scyBidXR0b24ge1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1wcmV2aWV3LXBsYXllci1jb250cm9sLXNpemUpO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tcHJldmlldy1wbGF5ZXItY29udHJvbC1zaXplKTtcbiAgICAgICAgICBib3JkZXI6IDA7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7XG4gICAgICAgICAgY29sb3I6IGluaGVyaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19jb250cm9scyBidXR0b24uaXMtcHJpbWFyeSB7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXByZXZpZXctcGxheWVyLXByaW1hcnktY29udHJvbC1zaXplKTtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXByZXZpZXctcGxheWVyLXByaW1hcnktY29udHJvbC1zaXplKTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjODE4Y2Y4LCAjYTc4YmZhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2x5cmljIHtcbiAgICAgICAgICBtaW4taGVpZ2h0OiB2YXIoLS1wcmV2aWV3LWx5cmljLWhlaWdodCk7XG4gICAgICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDY4cHggbWlubWF4KDAsIDFmcikgMjlweDtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgIGdhcDogMTZweDtcbiAgICAgICAgICBwYWRkaW5nOiAxOHB4IHZhcigtLXByZXZpZXctbHlyaWMtcGFkZGluZy14KTtcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTQpO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXByZXZpZXctbHlyaWMtcmFkaXVzKTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDMsIDcsIDE4LCB2YXIoLS1wcmV2aWV3LWx5cmljLW9wYWNpdHkpKTtcbiAgICAgICAgICBmb250LXNpemU6IHZhcigtLXByZXZpZXctbHlyaWMtZm9udC1zaXplKTtcbiAgICAgICAgICBib3gtc2hhZG93OiAwIDE4cHggNDJweCByZ2JhKDIsIDYsIDIzLCAwLjI4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2x5cmljIHNwYW4sXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2x5cmljIGVtIHtcbiAgICAgICAgICBjb2xvcjogI2M0YjVmZDtcbiAgICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19ncmlkIHtcbiAgICAgICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEyLCBtaW5tYXgoMCwgMWZyKSk7XG4gICAgICAgICAgZ2FwOiBjYWxjKDE2cHggKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQge1xuICAgICAgICAgIG1pbi1oZWlnaHQ6IGNhbGModmFyKC0tY2FyZC1taW4taGVpZ2h0LCAyNTBweCkgKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgICAgIGdhcDogY2FsYygxOHB4ICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSk7XG4gICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE0KTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wcmV2aWV3LXJhZGl1cy14bCk7XG4gICAgICAgICAgcGFkZGluZzogY2FsYygyMnB4ICogdmFyKC0tcHJldmlldy1jYXJkLXNjYWxlKSk7XG4gICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJldmlldy1wYW5lbCk7XG4gICAgICAgICAgYm94LXNoYWRvdzogMCAxOHB4IDQycHggcmdiYSgyLCA2LCAyMywgMC4yMik7XG4gICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDE4cHgpO1xuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICBmb250LXNpemU6IGNhbGMoMC45NXJlbSAqIHZhcigtLXByZXZpZXctY2FyZC1zY2FsZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fY2FyZC0tc3Ryb25nIHtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB2YXIoLS1wcmV2aWV3LXBhbmVsLXNvZnQpLCB0cmFuc3BhcmVudCksIHZhcigtLXByZXZpZXctcGFuZWwtc3Ryb25nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQtLXNvZnQge1xuICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLXByZXZpZXctcGFuZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fY2FyZC0tb3V0bGluZSB7XG4gICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE0NWRlZywgdmFyKC0tcHJldmlldy1wYW5lbCksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fY2FyZC1oZWFkIHtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgICBnYXA6IDEycHg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQtaGVhZCBzcGFuIHtcbiAgICAgICAgICBwYWRkaW5nOiA1cHggMTJweDtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA5OTlweDtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDEyOSwgMTQwLCAyNDgsIDAuMjQpO1xuICAgICAgICAgIGNvbG9yOiAjZDhkN2ZmO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYXBwZWFyYW5jZS1wcmV2aWV3X19jYXJkIGgzIHtcbiAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgZm9udC1zaXplOiBjYWxjKDEuNDJyZW0gKiB2YXIoLS1wcmV2aWV3LWNhcmQtc2NhbGUpKTtcbiAgICAgICAgICBsaW5lLWhlaWdodDogMS4xODtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2NhcmQgcCB7XG4gICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICAgIGNvbG9yOiByZ2JhKDIyNiwgMjMyLCAyNDAsIDAuNzgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fY2FyZCBidXR0b24ge1xuICAgICAgICAgIGFsaWduLXNlbGY6IGZsZXgtc3RhcnQ7XG4gICAgICAgICAgbWluLXdpZHRoOiAxNDJweDtcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTgpO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xuICAgICAgICAgIHBhZGRpbmc6IDlweCAxOHB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7XG4gICAgICAgICAgY29sb3I6IGluaGVyaXQ7XG4gICAgICAgIH1cblxuICAgICAgICBAbWVkaWEgKG1heC13aWR0aDogMTE4MHB4KSB7XG4gICAgICAgICAgLmFwcGVhcmFuY2Utd29ya2JlbmNoIHtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC5hcHBlYXJhbmNlLWluc3BlY3RvciB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICB0b3A6IGF1dG87XG4gICAgICAgICAgICBtYXgtaGVpZ2h0OiBub25lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA4NjBweCkge1xuICAgICAgICAgIC5hcHBlYXJhbmNlLXByZXZpZXdfX2dyaWQsXG4gICAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19faGVyby1ncmlkLFxuICAgICAgICAgIC5hcHBlYXJhbmNlLWNvbnRyb2wtZ3JpZCxcbiAgICAgICAgICAuYXBwZWFyYW5jZS1tb2R1bGUtdGFicyxcbiAgICAgICAgICAuYXBwZWFyYW5jZS1jYXJkLWxpc3Qge1xuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fY2FyZCB7XG4gICAgICAgICAgICBncmlkLWNvbHVtbjogMSAvIC0xICFpbXBvcnRhbnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLmFwcGVhcmFuY2UtcHJldmlld19fc2VhcmNoIHtcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3MjBweCkge1xuICAgICAgICAgIC5hcHBlYXJhbmNlLWhlcm8sXG4gICAgICAgICAgLmFwcGVhcmFuY2Utc2VjdGlvbi1oZWFkLS1zcGxpdCB7XG4gICAgICAgICAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBgfTwvc3R5bGU+XG4gICAgPC9zZWN0aW9uPlxuICApO1xufVxuIl0sImZpbGUiOiIvbW50L2QvYmxvZy9tYW5hZ2VyL3NyYy9wYWdlcy9BcHBlYXJhbmNlRWRpdG9yLnRzeCJ9