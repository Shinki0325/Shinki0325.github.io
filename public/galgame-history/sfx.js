const assetRoot = "/uploads/galgame-history/sfx";
const storageKey = "galgame-history:sfx";

const sounds = {
  "click_2.wav": { gain: 1, trimMs: 100 },
  "misc_menu.wav": { gain: 0.52, trimMs: 240 },
  "misc_menu_2.wav": { gain: 0.48, trimMs: 330 },
  "click.wav": { gain: 1, trimMs: 144 },
  "positive.wav": { gain: 0.24, trimMs: 1719 }
};

const roles = {
  "ui-hover": { file: "click_2.wav", db: 6 },
  "node-focus": { file: "click_2.wav", db: 6 },
  "route-step": { file: "misc_menu.wav", db: 0 },
  "menu-step": { file: "misc_menu.wav", db: -5 },
  "archive-open": { file: "misc_menu_2.wav", db: 0 },
  "ui-back": { file: "click.wav", db: 0 },
  "route-complete": { file: "positive.wav", db: 0 }
};

const hoverSelector = [
  "[data-density-mode]",
  "[data-relations-toggle]",
  "[data-route-collapse]",
  "[data-mission]",
  "[data-tech-node]",
  "[data-node-index]",
  "[data-index-jump]",
  "[data-index-open]",
  "[data-dossier-tab]",
  "[data-dossier-media]",
  "[data-neighbor]",
  "[data-return-anchor]",
  "[data-media-viewer-close]",
  "[data-minimap-toggle]",
  "[data-minimap-placement-toggle]",
  "[data-minimap-position]",
  "[data-minimap-scale]",
  "[data-minimap-close]",
  "[data-sfx-toggle]",
  "[data-sfx-volume]"
].join(",");

const clampVolume = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.35));

const readPreference = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      enabled: stored?.enabled !== false,
      volume: clampVolume(typeof stored?.volume === "number" ? stored.volume : 0.35)
    };
  } catch {
    return { enabled: true, volume: 0.35 };
  }
};

export const createSfxController = () => {
  const state = readPreference();
  const audioCache = new Map();
  const boundRoots = new WeakSet();
  const channels = {
    action: { audio: null, role: null, stopTimer: null },
    hover: { audio: null, role: null, stopTimer: null }
  };
  let suppressStationaryHover = false;
  let lastPointerX = null;
  let lastPointerY = null;

  const persist = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ enabled: state.enabled, volume: state.volume }));
    } catch {}
  };

  const getAudio = (file, channelName) => {
    const key = `${channelName}:${file}`;
    if (!audioCache.has(key)) {
      const audio = new Audio(`${assetRoot}/${file}`);
      audio.preload = "auto";
      audioCache.set(key, audio);
    }
    return audioCache.get(key);
  };

  const roleVolume = (role) => {
    const mapping = roles[role];
    const sound = mapping ? sounds[mapping.file] : null;
    if (!mapping || !sound) return 0;
    return Math.min(1, state.volume * sound.gain * (10 ** (mapping.db / 20)));
  };

  const stopChannel = (channelName) => {
    const channel = channels[channelName];
    if (channel.stopTimer) window.clearTimeout(channel.stopTimer);
    channel.stopTimer = null;
    if (channel.audio) {
      channel.audio.pause();
      channel.audio.currentTime = 0;
    }
    channel.audio = null;
    channel.role = null;
  };

  const stop = () => Object.keys(channels).forEach(stopChannel);

  const play = (role) => {
    const mapping = roles[role];
    const sound = mapping ? sounds[mapping.file] : null;
    if (!state.enabled || !mapping || !sound || state.volume <= 0) return false;
    const channelName = role === "ui-hover" ? "hover" : "action";
    const channel = channels[channelName];
    if (channelName === "action") {
      suppressStationaryHover = true;
      stopChannel("hover");
    }
    stopChannel(channelName);
    const audio = getAudio(mapping.file, channelName);
    audio.currentTime = 0;
    audio.volume = roleVolume(role);
    channel.audio = audio;
    channel.role = role;
    const playback = audio.play();
    if (playback?.catch) playback.catch(() => {
      if (channel.audio === audio) stopChannel(channelName);
    });
    channel.stopTimer = window.setTimeout(() => {
      if (channel.audio === audio) stopChannel(channelName);
    }, sound.trimMs);
    return true;
  };

  const syncControls = () => {
    const toggle = document.querySelector("[data-sfx-toggle]");
    const volume = document.querySelector("[data-sfx-volume]");
    const output = document.querySelector("[data-sfx-volume-output]");
    const control = document.querySelector("[data-sfx-control]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(state.enabled));
      toggle.setAttribute("aria-label", state.enabled ? "关闭界面音效" : "开启界面音效");
      toggle.title = state.enabled ? "关闭界面音效（菜单、悬浮与节点反馈）" : "开启界面音效（菜单、悬浮与节点反馈）";
    }
    if (volume) volume.value = String(state.volume);
    if (output) output.textContent = String(Math.round(state.volume * 100));
    if (control) control.dataset.sfxEnabled = String(state.enabled);
  };

  const bindControls = () => {
    const toggle = document.querySelector("[data-sfx-toggle]");
    const volume = document.querySelector("[data-sfx-volume]");
    toggle?.addEventListener("click", () => {
      if (state.enabled) {
        play("ui-back");
        state.enabled = false;
      } else {
        state.enabled = true;
        play("menu-step");
      }
      persist();
      syncControls();
    });
    volume?.addEventListener("input", () => {
      state.volume = clampVolume(Number(volume.value));
      Object.values(channels).forEach((channel) => {
        if (channel.audio && channel.role) channel.audio.volume = roleVolume(channel.role);
      });
      persist();
      syncControls();
    });
    syncControls();
  };

  const actionableFrom = (target, root) => {
    const action = target instanceof Element ? target.closest(hoverSelector) : null;
    return action && (root === document || root.contains(action)) ? action : null;
  };

  const bindHover = (root = document) => {
    if (boundRoots.has(root)) return;
    boundRoots.add(root);
    root.addEventListener("pointerover", (event) => {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const pointerMoved = event.clientX !== lastPointerX || event.clientY !== lastPointerY;
      if (suppressStationaryHover && !pointerMoved) return;
      if (pointerMoved) suppressStationaryHover = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      const action = actionableFrom(event.target, root);
      if (!action) return;
      const previous = actionableFrom(event.relatedTarget, root);
      if (action !== previous) play("ui-hover");
    });
    root.addEventListener("pointermove", (event) => {
      if (event.clientX !== lastPointerX || event.clientY !== lastPointerY) suppressStationaryHover = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    }, { passive: true });
    root.addEventListener("focusin", (event) => {
      const action = actionableFrom(event.target, root);
      if (action?.matches(":focus-visible")) play("ui-hover");
    });
  };

  bindControls();

  return {
    play,
    stop,
    bindControls,
    bindHover,
    getState: () => ({ ...state })
  };
};
