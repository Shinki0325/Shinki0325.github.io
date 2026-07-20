import {
  ABOUT_COLLECTION_PAGE_SIZE,
  getAboutCollectionPage,
  type AboutCollectionPayload,
  type AboutCollectionState,
} from "../lib/about-collection";

const COLLECTION_CATEGORIES = ["anime", "game"] as const;
const COLLECTION_STATUSES = ["all", "wish", "done", "doing", "on_hold", "dropped"] as const;
const COLLECTION_ITEM_STATUSES = ["wish", "done", "doing", "on_hold", "dropped"] as const;
const INVALID_PAYLOAD_MESSAGE = "Invalid about collection payload";

type AboutCollectionItem = AboutCollectionPayload["items"][number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 0;

const isCollectionCategory = (value: unknown): value is (typeof COLLECTION_CATEGORIES)[number] =>
  COLLECTION_CATEGORIES.some((category) => category === value);

const isCollectionStatus = (value: unknown): value is (typeof COLLECTION_STATUSES)[number] =>
  COLLECTION_STATUSES.some((status) => status === value);

const isCollectionItemStatus = (
  value: unknown,
): value is (typeof COLLECTION_ITEM_STATUSES)[number] =>
  COLLECTION_ITEM_STATUSES.some((status) => status === value);

const isAboutCollectionItem = (value: unknown): value is AboutCollectionItem => {
  if (!isRecord(value)) return false;
  return (
    isFiniteNumber(value.id) &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    isCollectionCategory(value.category) &&
    isString(value.categoryLabel) &&
    isCollectionItemStatus(value.status) &&
    isString(value.statusLabel) &&
    isString(value.title) &&
    isString(value.originalTitle) &&
    isString(value.year) &&
    isString(value.cover) &&
    isFiniteNumber(value.score) &&
    isFiniteNumber(value.userRate) &&
    isString(value.comment) &&
    Array.isArray(value.tags) &&
    value.tags.every(isString) &&
    isString(value.url) &&
    isString(value.updatedAt) &&
    isNonNegativeInteger(value.sourceIndex)
  );
};

const isCollectionSummary = (value: unknown): value is { key: string; label: string; count: number } =>
  isRecord(value) && isString(value.key) && isString(value.label) && isNonNegativeInteger(value.count);

const isAboutCollectionPayload = (value: unknown): value is AboutCollectionPayload => {
  if (!isRecord(value)) return false;
  const { total, categories, statuses, showcase, items } = value;
  if (
    !isNonNegativeInteger(total) ||
    !Array.isArray(categories) ||
    !Array.isArray(statuses) ||
    !Array.isArray(showcase) ||
    !Array.isArray(items) ||
    categories.length === 0 ||
    categories.length > COLLECTION_CATEGORIES.length ||
    statuses.length === 0 ||
    statuses.length > COLLECTION_STATUSES.length ||
    showcase.length > ABOUT_COLLECTION_PAGE_SIZE ||
    total !== items.length
  ) {
    return false;
  }

  if (
    !categories.every(
      (category) =>
        isCollectionSummary(category) && isCollectionCategory(category.key),
    ) ||
    !statuses.every(
      (status) => isCollectionSummary(status) && isCollectionStatus(status.key),
    ) ||
    !items.every(isAboutCollectionItem) ||
    !showcase.every(isAboutCollectionItem)
  ) {
    return false;
  }

  const categoryKeys = categories.map((category) => category.key);
  const statusKeys = statuses.map((status) => status.key);
  return (
    new Set(categoryKeys).size === categoryKeys.length &&
    new Set(statusKeys).size === statusKeys.length &&
    showcase.every((item) => items.some((candidate) => candidate.id === item.id))
  );
};

const parseAboutCollectionPayload = (value: unknown): AboutCollectionPayload => {
  if (!isAboutCollectionPayload(value)) {
    throw new Error(INVALID_PAYLOAD_MESSAGE);
  }
  return value;
};

const createButton = (label: string, pressed: boolean, toggleable = false) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.classList.toggle("is-active", pressed);
  if (toggleable) {
    button.setAttribute("aria-pressed", String(pressed));
  }
  return button;
};

const initAboutCollection = () => {
  document.querySelectorAll<HTMLElement>("[data-about-collection]").forEach((root) => {
    if (root.dataset.ready === "true") return;
    root.dataset.ready = "true";

    const toggle = root.querySelector<HTMLButtonElement>("[data-about-collection-toggle]");
    const panel = root.querySelector<HTMLElement>("[data-about-collection-panel]");
    const endpoint = root.dataset.collectionEndpoint;
    if (!toggle || !panel || !endpoint) return;

    let payload: AboutCollectionPayload | null = null;
    let payloadPromise: Promise<AboutCollectionPayload> | null = null;
    let state: AboutCollectionState = {
      category: "anime",
      status: "all",
      sort: "default",
      page: 1,
    };

    const loadPayload = () => {
      if (!payloadPromise) {
        payloadPromise = fetch(endpoint, {
          headers: { Accept: "application/json" },
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Collection request failed: ${response.status}`);
            }
            let rawPayload: unknown;
            try {
              rawPayload = await response.json();
            } catch {
              throw new Error(INVALID_PAYLOAD_MESSAGE);
            }
            return parseAboutCollectionPayload(rawPayload);
          })
          .catch((error) => {
            payloadPromise = null;
            throw error;
          });
      }
      return payloadPromise;
    };

    const render = (focusSelector?: string) => {
      if (!payload) return;

      const result = getAboutCollectionPage(payload, state);
      state = { ...state, page: result.page };
      panel.replaceChildren();

      const controls = document.createElement("div");
      controls.className = "about-project__collection-controls";

      const categories = document.createElement("div");
      categories.setAttribute("role", "group");
      categories.setAttribute("aria-label", "番组分类");
      payload.categories.forEach((category) => {
        const button = createButton(
          `${category.label} ${category.count}`,
          state.category === category.key,
          true,
        );
        button.dataset.aboutCollectionCategory = category.key;
        button.addEventListener("click", () => {
          state = { ...state, category: category.key, page: 1 };
          void displayCollection(`[data-about-collection-category="${category.key}"]`);
        });
        categories.append(button);
      });

      const statuses = document.createElement("div");
      statuses.setAttribute("role", "group");
      statuses.setAttribute("aria-label", "收藏状态");
      payload.statuses.forEach((status) => {
        const button = createButton(
          `${status.label} ${status.count}`,
          state.status === status.key,
          true,
        );
        button.dataset.aboutCollectionStatus = status.key;
        button.addEventListener("click", () => {
          state = { ...state, status: status.key, page: 1 };
          void displayCollection(`[data-about-collection-status="${status.key}"]`);
        });
        statuses.append(button);
      });

      const sorts = document.createElement("div");
      sorts.setAttribute("role", "group");
      sorts.setAttribute("aria-label", "排序方式");
      ([
        ["default", "默认"],
        ["rating", "个人评分"],
      ] as const).forEach(([key, label]) => {
        const button = createButton(label, state.sort === key, true);
        button.dataset.aboutCollectionSort = key;
        button.addEventListener("click", () => {
          state = { ...state, sort: key, page: 1 };
          void displayCollection(`[data-about-collection-sort="${key}"]`);
        });
        sorts.append(button);
      });
      controls.append(categories, statuses, sorts);

      const grid = document.createElement("div");
      grid.className = "about-project__collection-grid";
      result.items.forEach((item) => {
        const card = document.createElement("a");
        card.dataset.aboutCollectionCard = String(item.id);
        card.href = item.url;
        card.rel = "noreferrer";
        card.target = "_blank";

        const image = document.createElement("img");
        image.alt = item.title;
        image.decoding = "async";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.src = item.cover;

        const title = document.createElement("strong");
        title.textContent = item.title;

        const meta = document.createElement("span");
        meta.textContent = `${item.statusLabel} · ${item.year}${
          item.userRate > 0 ? ` · 个评 ${item.userRate.toFixed(1)}` : ""
        }`;

        card.append(image, title, meta);
        grid.append(card);
      });

      const pager = document.createElement("div");
      pager.className = "about-project__collection-pager";

      const previous = createButton("上一页", false);
      previous.dataset.aboutCollectionPagePrev = "";
      previous.disabled = result.page <= 1;
      previous.addEventListener("click", () => {
        state = { ...state, page: state.page - 1 };
        void displayCollection("[data-about-collection-page-prev]");
      });

      const info = document.createElement("span");
      info.dataset.aboutCollectionPageInfo = "";
      info.setAttribute("aria-live", "polite");
      info.textContent = `${result.page} / ${result.pageCount}，共 ${result.total} 项`;

      const next = createButton("下一页", false);
      next.dataset.aboutCollectionPageNext = "";
      next.disabled = result.page >= result.pageCount;
      next.addEventListener("click", () => {
        state = { ...state, page: state.page + 1 };
        void displayCollection("[data-about-collection-page-next]");
      });

      pager.append(previous, info, next);
      panel.append(controls, grid, pager);
      if (focusSelector) {
        panel.querySelector<HTMLElement>(focusSelector)?.focus();
      }
    };

    const showError = (focusRetry = false) => {
      panel.replaceChildren();
      const message = document.createElement("p");
      message.textContent = "完整收藏暂时无法加载。";
      const retry = createButton("重新加载", false);
      retry.addEventListener("click", async () => {
        retry.disabled = true;
        try {
          await displayCollection('[data-about-collection-category].is-active', true);
        } finally {
          if (retry.isConnected) {
            retry.disabled = false;
          }
        }
      });
      panel.append(message, retry);
      if (focusRetry) retry.focus();
    };

    const displayCollection = async (focusSelector?: string, focusRetry = false) => {
      panel.setAttribute("aria-busy", "true");
      try {
        if (!payload) {
          payload = await loadPayload();
        }
        render(focusSelector);
      } catch {
        payload = null;
        payloadPromise = null;
        showError(focusRetry);
      } finally {
        panel.removeAttribute("aria-busy");
      }
    };

    toggle.addEventListener("click", async () => {
      const opening = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.textContent = opening ? "收起完整收藏" : "展开完整收藏";
      panel.hidden = !opening;

      if (!opening) {
        toggle.focus();
        return;
      }

      await displayCollection('[data-about-collection-category].is-active');
    });
  });
};

initAboutCollection();
document.addEventListener("astro:page-load", initAboutCollection);
