// ✅ Put your Unsplash access key here

/* ---------- DOM ---------- */
const searchForm = document.getElementById("search-form");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const resetAllBtn = document.getElementById("reset-all-btn");
const searchBox = document.getElementById("search-box");

const sortSelect = document.getElementById("sort-select");
const orientationSelect = document.getElementById("orientation-select");
const colorSelect = document.getElementById("color-select");
const infiniteToggle = document.getElementById("infinite-toggle");

const searchResult = document.getElementById("search-result");
const resultsEmpty = document.getElementById("results-empty");
const showMoreBtn = document.getElementById("show-more-btn");
const resultsSentinel = document.getElementById("results-sentinel");
const loader = document.getElementById("loader");
const statusBox = document.getElementById("status");

const spellBox = document.getElementById("spell-suggestions");
const searchFeedback = document.getElementById("search-feedback");

const favoritesBtn = document.getElementById("favorites-btn");
const viewResults = document.getElementById("view-results");
const viewFavorites = document.getElementById("view-favorites");
const favoritesGrid = document.getElementById("favorites-grid");
const favoritesEmpty = document.getElementById("favorites-empty");
const clearFavoritesBtn = document.getElementById("clear-favorites-btn");
const collectionList = document.getElementById("collection-list");
const collectionForm = document.getElementById("collection-form");
const collectionNameInput = document.getElementById("collection-name-input");
const createCollectionBtn = document.getElementById("create-collection-btn");
const renameCollectionBtn = document.getElementById("rename-collection-btn");
const deleteCollectionBtn = document.getElementById("delete-collection-btn");
const collectionCancelBtn = document.getElementById("collection-cancel-btn");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const themeToggleText = document.getElementById("theme-toggle-text");

const backBtn = document.getElementById("back-btn");

// History
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

/* ---------- Modal ---------- */
function getPhotoTags(photo) {
  return (photo.tags || photo.tags_preview || []).map((tag) => tag.title || tag).filter(Boolean).slice(0, 8);
}

function renderModalDetails(items) {
  modalDetails.innerHTML = "";
  items.forEach((item) => {
    const detail = document.createElement("div");
    detail.className = "modalDetail";
    detail.textContent = item;
    modalDetails.appendChild(detail);
  });
}

function renderModalTags(tags) {
  modalTags.innerHTML = "";
  if (!tags.length) {
    modalTags.classList.add("hidden");
    return;
  }

  tags.forEach((tag) => {
    const chip = document.createElement("div");
    chip.className = "modalTag";
    chip.textContent = `#${tag}`;
    modalTags.appendChild(chip);
  });
  modalTags.classList.remove("hidden");
}

function updateModalFavoriteButton() {
  if (!currentModalPhoto) return;
  const faved = isFaved(currentModalPhoto.id);
  modalFavorite.textContent = faved ? "Remove favorite" : "Add to favorites";
  modalFavorite.classList.toggle("isActive", faved);
}

function renderModalCollectionMemberships() {
  modalCollectionMemberships.innerHTML = "";
  if (!currentModalPhoto) return;

  const memberships = getCollections().filter((collection) => (collection.imageIds || []).includes(currentModalPhoto.id));
  if (!memberships.length) {
    const empty = document.createElement("div");
    empty.className = "modalDetail";
    empty.textContent = "Not in any collection yet";
    modalCollectionMemberships.appendChild(empty);
    return;
  }

  memberships.forEach((collection) => {
    const chip = document.createElement("div");
    chip.className = "modalCollectionChip";

    const label = document.createElement("span");
    label.textContent = collection.name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "modalCollectionRemove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove from ${collection.name}`);
    removeBtn.addEventListener("click", () => {
      removeImageFromCollection(collection.id, currentModalPhoto.id);
      renderFavorites();
      renderModalCollectionControls();
      renderModalCollectionMemberships();
    });

    chip.appendChild(label);
    chip.appendChild(removeBtn);
    modalCollectionMemberships.appendChild(chip);
  });
}

function updateModalCollectionAction() {
  const selectedId = modalCollectionSelect.value;
  if (!selectedId) {
    modalCollectionAction.disabled = true;
    modalCollectionAction.textContent = "Add to collection";
    return;
  }

  modalCollectionAction.disabled = false;
  modalCollectionAction.textContent = isImageInCollection(selectedId, currentModalPhoto?.id)
    ? "Remove from collection"
    : "Add to collection";
}

function renderModalCollectionControls() {
  const collections = getCollections();
  modalCollectionSelect.innerHTML = "";

  if (!collections.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Create a collection first";
    modalCollectionSelect.appendChild(option);
    modalCollectionAction.disabled = true;
    modalCollectionAction.textContent = "Add to collection";
    return;
  }

  collections.forEach((collection) => {
    const option = document.createElement("option");
    option.value = collection.id;
    option.textContent = collection.name;
    modalCollectionSelect.appendChild(option);
  });

  updateModalCollectionAction();
}

function openDetailsModal(photo) {
  currentModalPhoto = photo;
  lastFocusedElement = document.activeElement;
  modal.classList.remove("hidden");

  const title = photo.alt_description || photo.description || photo.alt || "Photo preview";
  const description = photo.description || photo.alt_description || "";
  const photographer = photo.user?.name || photo.user || "Unknown";
  const likes = photo.likes || 0;
  const dimensions = photo.width && photo.height ? `${photo.width} x ${photo.height}` : "";
  const color = photo.color ? photo.color.toUpperCase() : "";
  const tags = getPhotoTags(photo);
  const imageLink = photo.urls?.full || photo.original || photo.urls?.regular || photo.urls?.small || "";
  const sourceLink = photo.links?.html || photo.link || imageLink;
  const downloadLink = photo.links?.download || photo.download || imageLink;

  modalImg.src = photo.urls?.regular || photo.urls?.small || imageLink;
  modalImg.alt = title;
  modalTitle.textContent = title;
  modalMeta.textContent = `Photographer: ${photographer} • Likes: ${likes}`;

  modalDescription.textContent = description;
  modalDescription.classList.toggle("hidden", !description);

  const details = [];
  if (dimensions) details.push(dimensions);
  if (color) details.push(`Color ${color}`);
  if (tags.length) details.push(`${tags.length} tag${tags.length > 1 ? "s" : ""}`);
  renderModalDetails(details);
  renderModalTags(tags);

  modalOpen.href = sourceLink;
  modalOriginal.href = imageLink || sourceLink;
  modalDownload.href = downloadLink || sourceLink;
  modalCopyLink.dataset.copyValue = imageLink || sourceLink;
  modalCopyLink.textContent = "Copy image link";
  updateModalFavoriteButton();
  renderModalCollectionControls();
  renderModalCollectionMemberships();
  modalX.focus();
}
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalX = document.getElementById("modal-x");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalDescription = document.getElementById("modal-description");
const modalDetails = document.getElementById("modal-details");
const modalTags = document.getElementById("modal-tags");
const modalFavorite = document.getElementById("modal-favorite");
const modalCopyLink = document.getElementById("modal-copy-link");
const modalOpen = document.getElementById("modal-open");
const modalOriginal = document.getElementById("modal-original");
const modalDownload = document.getElementById("modal-download");
const modalCollectionSelect = document.getElementById("modal-collection-select");
const modalCollectionAction = document.getElementById("modal-collection-action");
const modalCollectionMemberships = document.getElementById("modal-collection-memberships");
const modalCard = modal.querySelector(".modalCard");
const selectionTray = document.getElementById("selection-tray");
const selectionCount = document.getElementById("selection-count");
const selectionList = document.getElementById("selection-list");
const selectionClearBtn = document.getElementById("selection-clear-btn");
const collageOpenBtn = document.getElementById("collage-open-btn");
const collageModal = document.getElementById("collage-modal");
const collageModalClose = document.getElementById("collage-modal-close");
const collageModalX = document.getElementById("collage-modal-x");
const collageCanvas = document.getElementById("collage-canvas");
const collagePreviewImage = document.getElementById("collage-preview-image");
const collagePreviewEmpty = document.getElementById("collage-preview-empty");
const collageStatus = document.getElementById("collage-status");
const collageSelectionMeta = document.getElementById("collage-selection-meta");
const collageLayoutMeta = document.getElementById("collage-layout-meta");
const collageThemeMeta = document.getElementById("collage-theme-meta");
const collageThemeSelect = document.getElementById("collage-theme-select");
const collageThemeAddBtn = document.getElementById("collage-theme-add-btn");
const collageThemeHelp = document.getElementById("collage-theme-help");
const collageGenerateBtn = document.getElementById("collage-generate-btn");
const collageDownloadBtn = document.getElementById("collage-download-btn");
const collageLayoutButtons = Array.from(document.querySelectorAll("[data-collage-layout]"));

/* ---------- State ---------- */
let keyword = "";
let page = 1;
let isLoading = false;
let hasMoreResults = false;
let activeSkeletonCount = 0;
let currentModalPhoto = null;
let activeSuggestionIndex = -1;
let lastFocusedElement = null;
let lastCollageFocusedElement = null;
let selectedCollectionId = "all";
let collectionFormMode = "create";
let selectedCollageLayout = "duo";
let selectedCollageTheme = "";
let collagePreviewUrl = "";
let collageIsRendering = false;
let currentSearchResults = [];
const selectedImages = new Map();
const API_BASE = "/api";
const PER_PAGE = 12;
const SKELETON_COUNT = 8;

const HOME_VIEW = "home";
const VALID_VIEWS = new Set([HOME_VIEW, "results", "favorites"]);
const stack = [HOME_VIEW]; // home -> results -> favorites

function currentView() {
  return stack[stack.length - 1] || HOME_VIEW;
}

/* ---------- Storage Keys ---------- */
const FAV_KEY = "img_favorites_v1";
const HISTORY_KEY = "img_history_v1";
const PREFS_KEY = "img_preferences_v1";
const COLLECTIONS_KEY = "img_collections_v1";
const HISTORY_MAX = 20;
let infiniteScrollObserver = null;
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const COLLAGE_LAYOUTS = {
  duo: {
    label: "2-up split",
    minImages: 2,
    maxImages: 2,
    width: 1600,
    height: 1000,
    slots: [
      { x: 40, y: 40, w: 740, h: 920 },
      { x: 820, y: 40, w: 740, h: 920 }
    ]
  },
  grid: {
    label: "4-image grid",
    minImages: 4,
    maxImages: 4,
    width: 1600,
    height: 1600,
    slots: [
      { x: 40, y: 40, w: 740, h: 740 },
      { x: 820, y: 40, w: 740, h: 740 },
      { x: 40, y: 820, w: 740, h: 740 },
      { x: 820, y: 820, w: 740, h: 740 }
    ]
  },
  columns: {
    label: "3-column collage",
    minImages: 3,
    maxImages: 3,
    width: 1500,
    height: 1200,
    slots: [
      { x: 40, y: 40, w: 446, h: 1120 },
      { x: 526, y: 40, w: 446, h: 1120 },
      { x: 1012, y: 40, w: 446, h: 1120 }
    ]
  },
  hero: {
    label: "Hero + strip",
    minImages: 3,
    maxImages: 4,
    width: 1600,
    height: 1200,
    slots: [
      { x: 40, y: 40, w: 980, h: 1120 },
      { x: 1060, y: 40, w: 500, h: 346 },
      { x: 1060, y: 427, w: 500, h: 346 },
      { x: 1060, y: 814, w: 500, h: 346 }
    ]
  }
};
const COLLAGE_THEMES = {
  nature: { label: "Nature", terms: ["nature", "forest", "mountain", "river", "lake", "flower", "landscape", "tree", "beach", "sunset"] },
  city: { label: "City", terms: ["city", "urban", "street", "skyline", "building", "downtown", "architecture", "metro", "night"] },
  travel: { label: "Travel", terms: ["travel", "journey", "adventure", "destination", "passport", "vacation", "road trip", "landmark"] },
  animals: { label: "Animals", terms: ["animal", "wildlife", "pet", "dog", "cat", "bird", "horse", "elephant", "lion"] },
  food: { label: "Food", terms: ["food", "meal", "dish", "restaurant", "drink", "coffee", "dessert", "fruit", "kitchen"] },
  art: { label: "Art", terms: ["art", "painting", "gallery", "illustration", "creative", "design", "sculpture", "abstract"] },
  minimalist: { label: "Minimalist", terms: ["minimal", "minimalist", "clean", "simple", "space", "neutral", "modern"] },
  "black-and-white": { label: "Black and white", terms: ["black and white", "monochrome", "grayscale", "bw", "contrast"] }
};

/* ---------- Helpers ---------- */
function setStatus(msg, type = "info") {
  if (!msg) {
    statusBox.classList.add("hidden");
    statusBox.textContent = "";
    statusBox.className = "status hidden";
    return;
  }

  statusBox.className = `status status--${type}`;
  statusBox.classList.remove("hidden");
  statusBox.textContent = msg;
}

function setSearchFeedback(msg) {
  if (!msg) {
    searchFeedback.classList.add("hidden");
    searchFeedback.textContent = "";
    return;
  }

  searchFeedback.classList.remove("hidden");
  searchFeedback.textContent = msg;
}

function getStoredPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); }
  catch { return {}; }
}

function getCollections() {
  try { return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]"); }
  catch { return []; }
}

function setCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

function sanitizeCollectionName(name) {
  return name.trim().replace(/\s+/g, " ").slice(0, 40);
}

function getSelectedCollection() {
  return getCollections().find((collection) => collection.id === selectedCollectionId) || null;
}

function isImageInCollection(collectionId, imageId) {
  const collection = getCollections().find((item) => item.id === collectionId);
  return Boolean(collection?.imageIds?.includes(imageId));
}

function removeImageFromCollections(imageId) {
  const collections = getCollections().map((collection) => ({
    ...collection,
    imageIds: (collection.imageIds || []).filter((id) => id !== imageId)
  }));
  setCollections(collections);
}

function addImageToCollection(collectionId, imageId) {
  const collections = getCollections().map((collection) => {
    if (collection.id !== collectionId) return collection;
    const nextIds = new Set(collection.imageIds || []);
    nextIds.add(imageId);
    return { ...collection, imageIds: Array.from(nextIds) };
  });
  setCollections(collections);
}

function removeImageFromCollection(collectionId, imageId) {
  const collections = getCollections().map((collection) => {
    if (collection.id !== collectionId) return collection;
    return {
      ...collection,
      imageIds: (collection.imageIds || []).filter((id) => id !== imageId)
    };
  });
  setCollections(collections);
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? THEME_LIGHT : THEME_DARK;
}

function getActiveTheme() {
  return document.body.dataset.theme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
}

function updateThemeToggleUI() {
  const nextTheme = getActiveTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  themeToggleIcon.textContent = nextTheme === THEME_LIGHT ? "☀" : "☾";
  themeToggleText.textContent = nextTheme === THEME_LIGHT ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeToggle.title = `Switch to ${nextTheme} mode`;
}

function applyTheme(theme, persist = false) {
  document.body.dataset.theme = theme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
  updateThemeToggleUI();
  if (persist) persistPrefs();
}

function toggleTheme() {
  applyTheme(getActiveTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK, true);
}

function getCurrentPrefs() {
  return {
    sort: sortSelect.value,
    orientation: orientationSelect.value,
    color: colorSelect.value,
    infiniteScroll: infiniteToggle.checked,
    themeMode: document.body.dataset.theme || null
  };
}

function persistPrefs() {
  savePrefs(getCurrentPrefs());
}

function setSelectValue(selectEl, value) {
  const hasMatch = Array.from(selectEl.options).some((option) => option.value === value);
  if (hasMatch) selectEl.value = value;
}

function restorePrefs() {
  const prefs = getStoredPrefs();
  if (!prefs || typeof prefs !== "object") {
    applyTheme(getSystemTheme());
    return;
  }

  if (typeof prefs.sort === "string") setSelectValue(sortSelect, prefs.sort);
  if (typeof prefs.orientation === "string") setSelectValue(orientationSelect, prefs.orientation);
  if (typeof prefs.color === "string") setSelectValue(colorSelect, prefs.color);
  if (typeof prefs.infiniteScroll === "boolean") infiniteToggle.checked = prefs.infiniteScroll;
  applyTheme(
    prefs.themeMode === THEME_LIGHT || prefs.themeMode === THEME_DARK
      ? prefs.themeMode
      : getSystemTheme()
  );
}

function renderEmptyState(container, title, description, compact = false) {
  container.className = `emptyState${compact ? " compact" : ""}`;
  container.innerHTML = "";

  const titleEl = document.createElement("div");
  titleEl.className = "emptyStateTitle";
  titleEl.textContent = title;

  const textEl = document.createElement("div");
  textEl.className = "emptyStateText";
  textEl.textContent = description;

  container.appendChild(titleEl);
  container.appendChild(textEl);
}

function showResultsEmpty(title, description) {
  renderEmptyState(resultsEmpty, title, description);
  resultsEmpty.classList.remove("hidden");
}

function hideResultsEmpty() {
  resultsEmpty.classList.add("hidden");
  resultsEmpty.innerHTML = "";
}

function createAppError(kind, message, status = 0) {
  return { kind, message, status };
}

function getFriendlyErrorMessage(error, context = "search") {
  if (error.kind === "network") {
    return "You seem to be offline or the network is unavailable. Check your connection and try again.";
  }

  if (error.kind === "config") {
    return "Image search is not configured yet. Add a valid Unsplash access key to the server environment and reload the app.";
  }

  if (error.kind === "rate-limit") {
    return "Too many requests were sent in a short time. Please wait a moment and try again.";
  }

  if (context === "suggestions") {
    return "Suggestions are unavailable right now. You can still type and search normally.";
  }

  return "Something went wrong while loading images. Please try again in a moment.";
}

async function readErrorPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try { return await response.json(); }
    catch { return {}; }
  }

  try { return await response.text(); }
  catch { return ""; }
}

async function fetchJson(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw createAppError("network", "Network request failed.");
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    const details = typeof payload === "string" ? payload : payload.error || payload.message || "";
    const lowerDetails = details.toLowerCase();

    if (response.status === 429 || lowerDetails.includes("rate limit")) {
      throw createAppError("rate-limit", details, response.status);
    }

    if (
      lowerDetails.includes("unsplash_access_key")
      || lowerDetails.includes("access key")
      || lowerDetails.includes("configured")
      || response.status === 401
    ) {
      throw createAppError("config", details, response.status);
    }

    throw createAppError("api", details || `Request failed with status ${response.status}.`, response.status);
  }

  return response.json();
}

function setLoading(state, showSpinner = true) {
  isLoading = state;
  loader.classList.toggle("hidden", !state || !showSpinner);
  searchBtn.disabled = state;
  showMoreBtn.disabled = state;
  searchBox.disabled = state;
  sortSelect.disabled = state;
  orientationSelect.disabled = state;
  colorSelect.disabled = state;
  infiniteToggle.disabled = state;
}

function shouldUseInfiniteScroll() {
  return infiniteToggle.checked && currentView() === "results" && hasMoreResults;
}

function updatePagingControls() {
  const shouldAutoLoad = shouldUseInfiniteScroll();
  showMoreBtn.classList.toggle("hidden", shouldAutoLoad || !hasMoreResults);
  resultsSentinel.classList.toggle("hidden", !shouldAutoLoad);
}

function clearResultsView() {
  searchResult.innerHTML = "";
  hideResultsEmpty();
  hasMoreResults = false;
  activeSkeletonCount = 0;
  updatePagingControls();
}

function createSkeletonCard(index) {
  const heights = [220, 280, 250, 320, 240, 300, 260, 340];
  const card = document.createElement("div");
  card.className = "card skeletonCard";
  card.dataset.skeleton = "true";

  const media = document.createElement("div");
  media.className = "skeletonBlock skeletonMedia";
  media.style.height = `${heights[index % heights.length]}px`;

  const heart = document.createElement("div");
  heart.className = "skeletonBlock skeletonHeart";

  heart.addEventListener("click", () => {
    syncFavoriteButtons(photo.id);
    updateModalFavoriteButton();
  });

  const info = document.createElement("div");
  info.className = "cardInfo";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "skeletonBlock skeletonTitle";

  const meta = document.createElement("div");
  meta.className = "skeletonBlock skeletonMeta";

  const badge = document.createElement("div");
  badge.className = "skeletonBlock skeletonBadge";

  left.appendChild(title);
  left.appendChild(meta);
  info.appendChild(left);
  info.appendChild(badge);

  card.appendChild(media);
  card.appendChild(heart);
  card.appendChild(info);

  return card;
}

function renderResultSkeletons(count, append = false) {
  if (!append) {
    searchResult.innerHTML = "";
    activeSkeletonCount = 0;
  }

  for (let index = 0; index < count; index += 1) {
    searchResult.appendChild(createSkeletonCard(activeSkeletonCount + index));
  }

  activeSkeletonCount += count;
}

function clearResultSkeletons() {
  const skeletons = searchResult.querySelectorAll('[data-skeleton="true"]');
  skeletons.forEach((node) => node.remove());
  activeSkeletonCount = 0;
}

function maybeLoadNextPage() {
  if (!shouldUseInfiniteScroll() || isLoading) return;
  page += 1;
  searchImages();
}

function initInfiniteScrollObserver() {
  infiniteScrollObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (!entry?.isIntersecting) return;
    maybeLoadNextPage();
  }, {
    root: null,
    rootMargin: "0px 0px 600px 0px",
    threshold: 0
  });

  infiniteScrollObserver.observe(resultsSentinel);
}

function showView(name) {
  const viewName = VALID_VIEWS.has(name) ? name : HOME_VIEW;
  const isFav = viewName === "favorites";
  viewFavorites.classList.toggle("hidden", !isFav);
  viewResults.classList.toggle("hidden", isFav);
  if (isFav) renderFavorites();
  updatePagingControls();
  updateBackButton();
}

function pushView(name) {
  if (!VALID_VIEWS.has(name) || currentView() === name) return;
  stack.push(name);
  showView(name);
}

function resetToHomeView() {
  stack.length = 0;
  stack.push(HOME_VIEW);
  showView(HOME_VIEW);
}

function goBack() {
  if (stack.length <= 1) {
    resetToHomeView();
    return;
  }

  stack.pop();

  while (stack.length > 1 && !VALID_VIEWS.has(currentView())) {
    stack.pop();
  }

  if (!VALID_VIEWS.has(currentView())) {
    resetToHomeView();
    return;
  }

  showView(currentView());
}

function updateBackButton() {
  backBtn.disabled = stack.length <= 1;
  backBtn.style.opacity = backBtn.disabled ? "0.5" : "1";
}

function buildSelectionPayload(photo) {
  const favorite = buildFavoritePayload(photo);
  return {
    id: favorite.id,
    alt: favorite.alt,
    urls: favorite.urls
  };
}

function isImageSelected(id) {
  return selectedImages.has(id);
}

function syncSelectedCards(id) {
  const selected = isImageSelected(id);
  document.querySelectorAll(`[data-select-card-id="${id}"]`).forEach((card) => {
    card.classList.toggle("isSelected", selected);
  });
  document.querySelectorAll(`[data-select-btn-id="${id}"]`).forEach((button) => {
    button.classList.toggle("isSelected", selected);
    button.textContent = selected ? "✓" : "+";
    button.setAttribute("aria-label", selected ? "Unselect image" : "Select image");
  });
}

function renderSelectionTray() {
  const items = Array.from(selectedImages.values());
  selectionList.innerHTML = "";
  selectionTray.classList.toggle("hidden", items.length === 0);
  selectionCount.textContent = `${items.length} selected`;

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "selectionItem";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "selectionThumbWrap";

    const img = document.createElement("img");
    img.className = "selectionThumb";
    img.src = item.urls.small || item.urls.regular;
    img.alt = item.alt || "Selected image";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "selectionRemove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove ${item.alt || "image"} from selection`);
    removeBtn.addEventListener("click", () => {
      selectedImages.delete(item.id);
      syncSelectedCards(item.id);
      renderSelectionTray();
    });

    const label = document.createElement("div");
    label.className = "selectionLabel";
    label.textContent = (item.alt || "Selected image").slice(0, 32);

    thumbWrap.appendChild(img);
    thumbWrap.appendChild(removeBtn);
    card.appendChild(thumbWrap);
    card.appendChild(label);
    selectionList.appendChild(card);
  });
}

function toggleImageSelection(photo) {
  if (isImageSelected(photo.id)) selectedImages.delete(photo.id);
  else selectedImages.set(photo.id, buildSelectionPayload(photo));
  syncSelectedCards(photo.id);
  renderSelectionTray();
}

function clearSelectedImages() {
  const ids = Array.from(selectedImages.keys());
  selectedImages.clear();
  ids.forEach((id) => syncSelectedCards(id));
  renderSelectionTray();
}

function getSelectedImagesArray() {
  return Array.from(selectedImages.values());
}

function getCollageThemeLabel(themeKey = selectedCollageTheme) {
  return COLLAGE_THEMES[themeKey]?.label || "Any";
}

function getPhotoSearchText(photo) {
  return [
    photo.alt_description,
    photo.description,
    photo.user?.name,
    photo.color,
    ...(photo.tags || photo.tags_preview || []).map((tag) => tag.title || tag)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesCollageTheme(photo, themeKey = selectedCollageTheme) {
  if (!themeKey) return true;

  if (themeKey === "black-and-white") {
    const colorValue = String(photo.color || "").toLowerCase();
    const joinedTags = getPhotoSearchText(photo);
    return colorValue === "#000000"
      || colorValue === "#ffffff"
      || joinedTags.includes("black and white")
      || joinedTags.includes("monochrome")
      || joinedTags.includes("grayscale");
  }

  const haystack = getPhotoSearchText(photo);
  return (COLLAGE_THEMES[themeKey]?.terms || []).some((term) => haystack.includes(term));
}

function updateCollageThemeUI() {
  collageThemeSelect.value = selectedCollageTheme;
  collageThemeMeta.textContent = `Theme: ${getCollageThemeLabel()}`;
  collageThemeAddBtn.disabled = !selectedCollageTheme || currentSearchResults.length === 0;
  collageThemeHelp.textContent = selectedCollageTheme
    ? currentSearchResults.length
      ? `Theme "${getCollageThemeLabel()}" will add matching images from the current search results into your manual selection.`
      : `Theme "${getCollageThemeLabel()}" is ready. Run a search first to add matching current results.`
    : "Manual selection stays active. Choose a theme to quickly add matching images from the current results.";
}

function addThemeMatchesToSelection() {
  if (!selectedCollageTheme) {
    setCollageStatus("Choose a theme first to add matching photos.", "error");
    return;
  }

  if (!currentSearchResults.length) {
    setCollageStatus("Search for images first so Collage Studio has current results to match against.", "error");
    return;
  }

  const matches = currentSearchResults.filter((photo) => matchesCollageTheme(photo, selectedCollageTheme));
  if (!matches.length) {
    setCollageStatus(`No current results matched the ${getCollageThemeLabel().toLowerCase()} theme yet. Try a new search or keep selecting manually.`, "error");
    return;
  }

  let addedCount = 0;
  matches.forEach((photo) => {
    if (!selectedImages.has(photo.id)) {
      selectedImages.set(photo.id, buildSelectionPayload(photo));
      syncSelectedCards(photo.id);
      addedCount += 1;
    }
  });

  renderSelectionTray();
  if (!collageModal.classList.contains("hidden")) generateCollagePreview();
  setCollageStatus(
    addedCount
      ? `Added ${addedCount} ${getCollageThemeLabel().toLowerCase()} match${addedCount === 1 ? "" : "es"} from current results.`
      : `Those ${getCollageThemeLabel().toLowerCase()} matches were already in your selection.`,
    "success"
  );
}

function getCollageLayoutConfig(layoutKey = selectedCollageLayout) {
  return COLLAGE_LAYOUTS[layoutKey] || COLLAGE_LAYOUTS.duo;
}

function isCollageLayoutAvailable(layoutKey, imageCount = getSelectedImagesArray().length) {
  return imageCount >= getCollageLayoutConfig(layoutKey).minImages;
}

function getPreferredCollageLayout(imageCount = getSelectedImagesArray().length) {
  if (isCollageLayoutAvailable(selectedCollageLayout, imageCount)) return selectedCollageLayout;
  return Object.keys(COLLAGE_LAYOUTS).find((layoutKey) => isCollageLayoutAvailable(layoutKey, imageCount)) || "duo";
}

function setCollageStatus(message, tone = "default") {
  collageStatus.textContent = message;
  collageStatus.classList.remove("collageStatusError", "collageStatusSuccess");
  if (tone === "error") collageStatus.classList.add("collageStatusError");
  if (tone === "success") collageStatus.classList.add("collageStatusSuccess");
}

function updateCollageDownloadState(enabled) {
  collageDownloadBtn.classList.toggle("disabledLink", !enabled);
  collageDownloadBtn.setAttribute("aria-disabled", String(!enabled));
  if (!enabled) collageDownloadBtn.href = "#";
}

function resetCollagePreview() {
  collagePreviewImage.classList.add("hidden");
  collagePreviewImage.removeAttribute("src");
  collagePreviewEmpty.classList.remove("hidden");
  if (collagePreviewUrl) URL.revokeObjectURL(collagePreviewUrl);
  collagePreviewUrl = "";
  updateCollageDownloadState(false);
}

function updateCollageLayoutButtons() {
  const selectedCount = getSelectedImagesArray().length;
  selectedCollageLayout = getPreferredCollageLayout(selectedCount);

  collageLayoutButtons.forEach((button) => {
    const layoutKey = button.dataset.collageLayout;
    const isAvailable = isCollageLayoutAvailable(layoutKey, selectedCount);
    const isActive = layoutKey === selectedCollageLayout;
    button.disabled = !isAvailable;
    button.classList.toggle("isActive", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateCollageSummary() {
  const selectedCount = getSelectedImagesArray().length;
  const layout = getCollageLayoutConfig(selectedCollageLayout);
  const usedCount = Math.min(selectedCount, layout.maxImages);
  collageSelectionMeta.textContent = `${selectedCount} selected`;
  collageLayoutMeta.textContent = `${layout.label} • uses ${usedCount} image${usedCount === 1 ? "" : "s"}`;
  collageThemeMeta.textContent = `Theme: ${getCollageThemeLabel()}`;
  collageOpenBtn.disabled = selectedCount < 2;
}

function renderSelectionTray() {
  const items = Array.from(selectedImages.values());
  selectionList.innerHTML = "";
  selectionTray.classList.toggle("hidden", items.length === 0);
  selectionCount.textContent = `${items.length} selected`;
  collageOpenBtn.disabled = items.length < 2;

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "selectionItem";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "selectionThumbWrap";

    const img = document.createElement("img");
    img.className = "selectionThumb";
    img.src = item.urls.small || item.urls.regular;
    img.alt = item.alt || "Selected image";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "selectionRemove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove ${item.alt || "image"} from selection`);
    removeBtn.addEventListener("click", () => {
      selectedImages.delete(item.id);
      syncSelectedCards(item.id);
      renderSelectionTray();
    });

    const label = document.createElement("div");
    label.className = "selectionLabel";
    label.textContent = (item.alt || "Selected image").slice(0, 32);

    thumbWrap.appendChild(img);
    thumbWrap.appendChild(removeBtn);
    card.appendChild(thumbWrap);
    card.appendChild(label);
    selectionList.appendChild(card);
  });

  updateCollageLayoutButtons();
  updateCollageSummary();
  updateCollageThemeUI();
  if (!collageModal.classList.contains("hidden")) {
    if (items.length < 2) {
      resetCollagePreview();
      setCollageStatus("Select at least two images to create a collage.", "error");
    } else {
      setCollageStatus("Pick a layout and generate your collage preview.");
    }
  }
}

function getCollageSourceUrl(item) {
  return item.urls.regular || item.urls.full || item.original || item.urls.small || "";
}

function getCollageItemsForCurrentLayout() {
  const layout = getCollageLayoutConfig(selectedCollageLayout);
  return getSelectedImagesArray().slice(0, layout.maxImages);
}

function loadCanvasImage(item) {
  return new Promise((resolve, reject) => {
    const src = getCollageSourceUrl(item);
    if (!src) {
      reject(new Error("missing-image-url"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

function drawImageCover(ctx, img, slot) {
  const scale = Math.max(slot.w / img.width, slot.h / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const drawX = slot.x + (slot.w - drawWidth) / 2;
  const drawY = slot.y + (slot.h - drawHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(slot.x, slot.y, slot.w, slot.h);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

async function generateCollagePreview() {
  const selectedCount = getSelectedImagesArray().length;
  if (selectedCount < 2) {
    setCollageStatus("Select at least two images to create a collage.", "error");
    return;
  }

  updateCollageLayoutButtons();
  const layout = getCollageLayoutConfig(selectedCollageLayout);
  const items = getCollageItemsForCurrentLayout();

  if (items.length < layout.minImages) {
    setCollageStatus(`"${layout.label}" needs at least ${layout.minImages} selected images.`, "error");
    return;
  }

  collageIsRendering = true;
  collageGenerateBtn.disabled = true;
  collageGenerateBtn.textContent = "Generating...";
  setCollageStatus(`Building ${layout.label.toLowerCase()} preview...`);

  try {
    const images = await Promise.all(items.map((item) => loadCanvasImage(item)));
    const ctx = collageCanvas.getContext("2d");
    collageCanvas.width = layout.width;
    collageCanvas.height = layout.height;

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg2").trim() || "#101726";
    ctx.fillRect(0, 0, layout.width, layout.height);

    layout.slots.slice(0, images.length).forEach((slot, index) => {
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--surface").trim() || "#202638";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      drawImageCover(ctx, images[index], slot);
    });

    const blob = await new Promise((resolve, reject) => {
      collageCanvas.toBlob((nextBlob) => {
        if (nextBlob) resolve(nextBlob);
        else reject(new Error("blob-generation-failed"));
      }, "image/jpeg", 0.92);
    });

    if (collagePreviewUrl) URL.revokeObjectURL(collagePreviewUrl);
    collagePreviewUrl = URL.createObjectURL(blob);
    collagePreviewImage.src = collagePreviewUrl;
    collagePreviewImage.classList.remove("hidden");
    collagePreviewEmpty.classList.add("hidden");
    collageDownloadBtn.href = collagePreviewUrl;
    collageDownloadBtn.download = `collage-${selectedCollageLayout}.jpg`;
    updateCollageDownloadState(true);

    const extraCount = Math.max(0, selectedCount - layout.maxImages);
    setCollageStatus(
      extraCount
        ? `Preview ready. This layout used the first ${layout.maxImages} selected images.`
        : "Preview ready. Download your collage when you are happy with it.",
      "success"
    );
  } catch {
    resetCollagePreview();
    setCollageStatus("Collage generation failed. Some image sources may not allow canvas export right now.", "error");
  } finally {
    collageIsRendering = false;
    collageGenerateBtn.disabled = false;
    collageGenerateBtn.textContent = "Generate collage";
  }
}

function openCollageStudio() {
  const selectedCount = getSelectedImagesArray().length;
  if (selectedCount < 2) {
    setStatus("Select at least two images before opening Collage Studio.", "info");
    return;
  }

  lastCollageFocusedElement = document.activeElement;
  collageModal.classList.remove("hidden");
  updateCollageLayoutButtons();
  updateCollageSummary();
  updateCollageThemeUI();
  resetCollagePreview();
  setCollageStatus("Pick a layout and generate your collage preview.");
  collageModalX.focus();
  generateCollagePreview();
}

function closeCollageStudio() {
  collageModal.classList.add("hidden");
  resetCollagePreview();
  setCollageStatus("Select a few images to begin.");
  if (lastCollageFocusedElement && typeof lastCollageFocusedElement.focus === "function") {
    lastCollageFocusedElement.focus();
  }
  lastCollageFocusedElement = null;
}

/* ---------- Favorites ---------- */
function getFavMap() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "{}"); }
  catch { return {}; }
}
function setFavMap(map) { localStorage.setItem(FAV_KEY, JSON.stringify(map)); }
function isFaved(id) { return Boolean(getFavMap()[id]); }

function buildFavoritePayload(photo) {
  return {
    id: photo.id,
    alt: photo.alt_description || photo.description || "Untitled",
    description: photo.description || photo.alt_description || "",
    likes: photo.likes || 0,
    user: photo.user?.name || "Unknown",
    width: photo.width || null,
    height: photo.height || null,
    color: photo.color || "",
    tags: (photo.tags || photo.tags_preview || []).map((tag) => tag.title || tag).filter(Boolean).slice(0, 6),
    link: photo.links?.html || photo.link || "",
    download: photo.links?.download || photo.download || photo.urls?.full || "",
    original: photo.urls?.full || photo.urls?.raw || photo.original || photo.urls?.regular || "",
    urls: {
      small: photo.urls?.small || "",
      regular: photo.urls?.regular || photo.urls?.small || "",
      full: photo.urls?.full || photo.urls?.regular || ""
    }
  };
}

function toggleFavorite(photo) {
  const map = getFavMap();
  if (map[photo.id]) {
    delete map[photo.id];
    removeImageFromCollections(photo.id);
  }
  else map[photo.id] = buildFavoritePayload(photo);
  setFavMap(map);
}

function syncFavoriteButtons(id) {
  const faved = isFaved(id);
  const buttons = document.querySelectorAll(`[data-photo-id="${id}"]`);
  buttons.forEach((button) => {
    if (button.classList.contains("heartBtn")) {
      button.classList.toggle("faved", faved);
      button.textContent = faved ? "â¤" : "â™¡";
      button.textContent = faved ? "❤" : "♡";
    }
  });
}

function renderFavorites() {
  const favorites = Object.values(getFavMap());
  const collections = getCollections();
  const items = selectedCollectionId === "all"
    ? favorites
    : favorites.filter((item) => {
        const collection = collections.find((entry) => entry.id === selectedCollectionId);
        return Boolean(collection?.imageIds?.includes(item.id));
      });

  favoritesGrid.innerHTML = "";
  renderCollections();

  if (favorites.length === 0) {
    renderEmptyState(
      favoritesEmpty,
      "No favorites yet",
      "Save images with the heart button and they will appear here for quick access."
    );
    favoritesEmpty.classList.remove("hidden");
    return;
  }

  if (items.length === 0) {
    const collection = getSelectedCollection();
    renderEmptyState(
      favoritesEmpty,
      collection ? `${collection.name} is empty` : "No images in this view",
      collection
        ? "Add favorite images to this collection from the image details panel."
        : "Choose a collection or save more favorites to see images here."
    );
    favoritesEmpty.classList.remove("hidden");
    return;
  }

  favoritesEmpty.classList.add("hidden");
  favoritesEmpty.innerHTML = "";
  items.forEach((saved) => favoritesGrid.appendChild(createCardFromSaved(saved)));
}

function updateCollectionButtons() {
  const hasSelectedCollection = selectedCollectionId !== "all" && Boolean(getSelectedCollection());
  renameCollectionBtn.disabled = !hasSelectedCollection;
  deleteCollectionBtn.disabled = !hasSelectedCollection;
}

function renderCollections() {
  const collections = getCollections();
  const favoriteIds = new Set(Object.keys(getFavMap()));
  if (selectedCollectionId !== "all" && !collections.some((collection) => collection.id === selectedCollectionId)) {
    selectedCollectionId = "all";
  }

  collectionList.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.type = "button";
  allChip.className = `collectionChip${selectedCollectionId === "all" ? " isActive" : ""}`;
  allChip.innerHTML = `All favorites <span class="collectionChipMeta">${Object.keys(getFavMap()).length}</span>`;
  allChip.addEventListener("click", () => {
    selectedCollectionId = "all";
    renderFavorites();
  });
  collectionList.appendChild(allChip);

  collections.forEach((collection) => {
    const count = (collection.imageIds || []).filter((id) => favoriteIds.has(id)).length;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `collectionChip${selectedCollectionId === collection.id ? " isActive" : ""}`;
    chip.innerHTML = `${collection.name}<span class="collectionChipMeta">${count}</span>`;
    chip.addEventListener("click", () => {
      selectedCollectionId = collection.id;
      renderFavorites();
    });
    collectionList.appendChild(chip);
  });

  updateCollectionButtons();
}

function openCollectionForm(mode) {
  collectionFormMode = mode;
  collectionForm.classList.remove("hidden");
  const selected = getSelectedCollection();
  collectionNameInput.value = mode === "rename" && selected ? selected.name : "";
  collectionNameInput.focus();
  collectionNameInput.select();
}

function closeCollectionForm() {
  collectionForm.classList.add("hidden");
  collectionNameInput.value = "";
  collectionFormMode = "create";
}

function saveCollectionFromForm() {
  const name = sanitizeCollectionName(collectionNameInput.value);
  if (!name) {
    setStatus("Enter a collection name to continue.", "warning");
    collectionNameInput.focus();
    return;
  }

  const collections = getCollections();

  if (collectionFormMode === "rename") {
    const selected = getSelectedCollection();
    if (!selected) return;
    setCollections(collections.map((collection) => (
      collection.id === selected.id ? { ...collection, name } : collection
    )));
    setStatus(`Renamed collection to ${name}.`, "info");
  } else {
    const collection = {
      id: `collection-${Date.now()}`,
      name,
      imageIds: []
    };
    setCollections([collection, ...collections]);
    selectedCollectionId = collection.id;
    setStatus(`Created collection ${name}.`, "info");
  }

  closeCollectionForm();
  renderFavorites();
  renderModalCollectionControls();
}

/* ---------- History ---------- */
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}
function setHistory(list) { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); }

function addHistory(term) {
  const t = term.trim();
  if (!t) return;
  let list = getHistory().filter((x) => x.toLowerCase() !== t.toLowerCase());
  list.unshift(t);
  list = list.slice(0, HISTORY_MAX);
  setHistory(list);
  renderHistory();
}

function removeHistory(term) {
  const list = getHistory().filter((x) => x.toLowerCase() !== term.toLowerCase());
  setHistory(list);
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function renderHistory() {
  const list = getHistory();
  historyList.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("div");
    renderEmptyState(
      empty,
      "No search history yet",
      "Your recent searches will show up here so you can rerun them in one click.",
      true
    );
    historyList.appendChild(empty);
    return;
  }

  list.forEach((term) => {
    const item = document.createElement("div");
    item.className = "historyItem";

    const word = document.createElement("button");
    word.className = "historyWord";
    word.type = "button";
    word.textContent = term;
    word.title = "Click to search";
    word.addEventListener("click", () => {
      searchBox.value = term;
      page = 1;
      searchImages();
    });

    const del = document.createElement("button");
    del.className = "historyDel";
    del.type = "button";
    del.textContent = "✕";
    del.title = "Remove from history";
    del.setAttribute("aria-label", `Remove ${term} from search history`);
    del.addEventListener("click", () => removeHistory(term));

    item.appendChild(word);
    item.appendChild(del);
    historyList.appendChild(item);
  });
}

/* ---------- Cards ---------- */
function createCard(photo) {
  const card = document.createElement("div");
  card.className = "card";
  card.tabIndex = 0;
  card.dataset.selectCardId = photo.id;
  card.classList.toggle("isSelected", isImageSelected(photo.id));
  card.setAttribute("aria-label", `Open details for ${(photo.alt_description || "photo")} by ${photo.user?.name || "Unknown"}`);

  const img = document.createElement("img");
  img.src = photo.urls.small;
  img.alt = photo.alt_description || keyword;
  img.loading = "lazy";

  const selectBtn = document.createElement("button");
  selectBtn.type = "button";
  selectBtn.dataset.selectBtnId = photo.id;
  selectBtn.className = "selectBtn" + (isImageSelected(photo.id) ? " isSelected" : "");
  selectBtn.textContent = isImageSelected(photo.id) ? "✓" : "+";
  selectBtn.setAttribute("aria-label", isImageSelected(photo.id) ? "Unselect image" : "Select image");
  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleImageSelection(photo);
  });

  const heart = document.createElement("button");
  heart.type = "button";
  heart.dataset.photoId = photo.id;
  heart.className = "heartBtn" + (isFaved(photo.id) ? " faved" : "");
  heart.textContent = isFaved(photo.id) ? "❤" : "♡";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(photo);
    const now = isFaved(photo.id);
    heart.classList.toggle("faved", now);
    heart.textContent = now ? "❤" : "♡";
  });

  heart.addEventListener("click", () => {
    syncFavoriteButtons(photo.id);
    updateModalFavoriteButton();
  });

  const info = document.createElement("div");
  info.className = "cardInfo";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "cardTitle";
  title.textContent = (photo.alt_description || "Untitled Photo").slice(0, 30);

  const meta = document.createElement("div");
  meta.className = "cardMeta";
  meta.textContent = `by ${photo.user?.name || "Unknown"}`;

  left.appendChild(title);
  left.appendChild(meta);

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = `❤ ${photo.likes}`;

  info.appendChild(left);
  info.appendChild(badge);

  card.appendChild(img);
  card.appendChild(selectBtn);
  card.appendChild(heart);
  card.appendChild(info);

  card.addEventListener("click", () => openModal(photo));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(photo);
    }
  });
  return card;
}

function createCardFromSaved(saved) {
  const card = document.createElement("div");
  card.className = "card";
  card.tabIndex = 0;
  card.dataset.selectCardId = saved.id;
  card.classList.toggle("isSelected", isImageSelected(saved.id));
  card.setAttribute("aria-label", `Open details for ${(saved.alt || "favorite image")} by ${saved.user}`);

  const img = document.createElement("img");
  img.src = saved.urls.small;
  img.alt = saved.alt || "Favorite";
  img.loading = "lazy";

  const selectBtn = document.createElement("button");
  selectBtn.type = "button";
  selectBtn.dataset.selectBtnId = saved.id;
  selectBtn.className = "selectBtn" + (isImageSelected(saved.id) ? " isSelected" : "");
  selectBtn.textContent = isImageSelected(saved.id) ? "✓" : "+";
  selectBtn.setAttribute("aria-label", isImageSelected(saved.id) ? "Unselect image" : "Select image");
  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleImageSelection({
      id: saved.id,
      alt_description: saved.alt,
      description: saved.description,
      urls: saved.urls,
      user: { name: saved.user }
    });
  });

  const heart = document.createElement("button");
  heart.type = "button";
  heart.dataset.photoId = saved.id;
  heart.className = "heartBtn faved";
  heart.textContent = "❤";
  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    const map = getFavMap();
    delete map[saved.id];
    setFavMap(map);
    renderFavorites();
  });

  heart.addEventListener("click", () => {
    syncFavoriteButtons(saved.id);
    updateModalFavoriteButton();
  });

  const info = document.createElement("div");
  info.className = "cardInfo";

  const left = document.createElement("div");
  const title = document.createElement("div");
  title.className = "cardTitle";
  title.textContent = (saved.alt || "Favorite").slice(0, 30);

  const meta = document.createElement("div");
  meta.className = "cardMeta";
  meta.textContent = `by ${saved.user}`;

  left.appendChild(title);
  left.appendChild(meta);

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = `❤ ${saved.likes}`;

  info.appendChild(left);
  info.appendChild(badge);

  card.appendChild(img);
  card.appendChild(selectBtn);
  card.appendChild(heart);
  card.appendChild(info);

  card.addEventListener("click", () => openModalSaved(saved));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModalSaved(saved);
    }
  });
  return card;
}

/* ---------- Modal ---------- */
function openModal(photo) {
  modal.classList.remove("hidden");
  modalImg.src = photo.urls.regular;
  modalImg.alt = photo.alt_description || "Photo";

  modalTitle.textContent = photo.alt_description || "Photo preview";
  modalMeta.textContent = `Photographer: ${photo.user?.name || "Unknown"} • Likes: ${photo.likes}`;

  modalOpen.href = photo.links.html;
  modalDownload.href = photo.links.download || photo.urls.full;
}

function openModalSaved(saved) {
  modal.classList.remove("hidden");
  modalImg.src = saved.urls.regular;
  modalImg.alt = saved.alt || "Photo";

  modalTitle.textContent = saved.alt || "Photo preview";
  modalMeta.textContent = `Photographer: ${saved.user} • Likes: ${saved.likes}`;

  modalOpen.href = saved.link;
  modalDownload.href = saved.download || saved.urls.regular;
}

function closeModal() {
  modal.classList.add("hidden");
  modalImg.src = "";
}
modalClose.addEventListener("click", closeModal);
modalX.addEventListener("click", closeModal);

function getActiveDialog() {
  if (!collageModal.classList.contains("hidden")) return collageModal;
  if (!modal.classList.contains("hidden")) return modal;
  return null;
}

function getDialogFocusableElements(dialog) {
  return Array.from(
    dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.closest(".hidden") && element.getAttribute("aria-disabled") !== "true");
}

document.addEventListener("keydown", (e) => {
  const activeDialog = getActiveDialog();
  if (!activeDialog) return;

  if (e.key === "Escape") {
    if (activeDialog === collageModal) closeCollageStudio();
    else closeModal();
    return;
  }

  if (e.key !== "Tab") return;

  const focusable = getDialogFocusableElements(activeDialog);
  const activeCard = activeDialog.querySelector(".modalCard");
  if (!focusable.length) {
    e.preventDefault();
    activeCard?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

function openModal(photo) {
  openDetailsModal(photo);
}

function openModalSaved(saved) {
  openDetailsModal({
    id: saved.id,
    alt_description: saved.alt,
    description: saved.description,
    likes: saved.likes,
    color: saved.color,
    width: saved.width,
    height: saved.height,
    user: { name: saved.user },
    tags: (saved.tags || []).map((tag) => ({ title: tag })),
    links: {
      html: saved.link,
      download: saved.download
    },
    urls: {
      small: saved.urls?.small,
      regular: saved.urls?.regular,
      full: saved.urls?.full || saved.original || saved.urls?.regular
    },
    original: saved.original
  });
}

function closeModal() {
  modal.classList.add("hidden");
  modalImg.src = "";
  currentModalPhoto = null;
  modalCopyLink.textContent = "Copy image link";
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

async function copyModalImageLink() {
  const value = modalCopyLink.dataset.copyValue;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    modalCopyLink.textContent = "Link copied";
  } catch {
    modalCopyLink.textContent = "Copy unavailable";
  }
}

modalCopyLink.addEventListener("click", () => {
  copyModalImageLink();
});

modalFavorite.addEventListener("click", () => {
  if (!currentModalPhoto) return;
  toggleFavorite(currentModalPhoto);
  syncFavoriteButtons(currentModalPhoto.id);
  renderFavorites();
  updateModalFavoriteButton();
  renderModalCollectionControls();
  renderModalCollectionMemberships();
});

modalCollectionSelect.addEventListener("change", () => {
  updateModalCollectionAction();
});

modalCollectionAction.addEventListener("click", () => {
  if (!currentModalPhoto) return;
  const collectionId = modalCollectionSelect.value;
  if (!collectionId) return;

  if (!isFaved(currentModalPhoto.id)) {
    toggleFavorite(currentModalPhoto);
    syncFavoriteButtons(currentModalPhoto.id);
    updateModalFavoriteButton();
  }

  if (isImageInCollection(collectionId, currentModalPhoto.id)) {
    removeImageFromCollection(collectionId, currentModalPhoto.id);
  } else {
    addImageToCollection(collectionId, currentModalPhoto.id);
  }

  renderFavorites();
  renderModalCollectionControls();
  renderModalCollectionMemberships();
});

/* ---------- Unsplash URLs ---------- */
function buildSearchUrl() {
  const sort = sortSelect.value; // relevant | latest
  const orientation = orientationSelect.value;
  const color = colorSelect.value;

  const params = new URLSearchParams({
    page: String(page),
    query: keyword,
    per_page: String(PER_PAGE),
    order_by: sort
  });

  if (orientation) params.set("orientation", orientation);
  if (color) params.set("color", color);

  return `${API_BASE}/search/photos?${params.toString()}`;
}

// ✅ Fallback images if no results:
/* ---------- Search ---------- */
async function searchImages() {
  keyword = searchBox.value.trim();
  setSearchFeedback("");
  const isFreshSearch = page === 1;

  if (!keyword) {
    currentSearchResults = [];
    clearResultsView();
    setStatus("Type something to search (for example: sunsets, cats, or coffee).");
    resetToHomeView();
    return;
  }

  if (isLoading) return;
  setLoading(true, false);
  setStatus("");
  hideResultsEmpty();
  renderResultSkeletons(isFreshSearch ? SKELETON_COUNT : 4, !isFreshSearch);

  try {
    const url = buildSearchUrl();
    const data = await fetchJson(url);
    const results = data.results || [];
    const totalPages = Number(data.total_pages || 0);
    currentSearchResults = page === 1 ? [...results] : [...currentSearchResults, ...results];

    clearResultSkeletons();
    if (isFreshSearch) {
      searchResult.innerHTML = "";
    }

    if (results.length === 0 && page === 1) {
      showResultsEmpty(
        "No results found",
        `We could not find images for "${keyword}". Try a broader keyword, a different spelling, or fewer filters.`
      );
      hasMoreResults = false;
      updatePagingControls();
      pushView("results");
      return;
    }

    results.forEach((photo) => searchResult.appendChild(createCard(photo)));
    hasMoreResults = results.length === PER_PAGE && page < totalPages;
    updatePagingControls();

    addHistory(keyword);
    if (!hasMoreResults && page > 1) {
      setStatus("You have reached the end of the available results.", "info");
    }

    pushView("results");
  } catch (err) {
    clearResultSkeletons();
    if (page === 1) {
      currentSearchResults = [];
      clearResultsView();
    }
    if (page > 1) {
      page -= 1;
      hasMoreResults = true;
    } else {
      hasMoreResults = false;
    }
    updatePagingControls();
    setStatus(
      getFriendlyErrorMessage(err, "search"),
      err.kind === "rate-limit" ? "warning" : "error"
    );
  } finally {
    setLoading(false);
  }
}

/* ---------- Spelling suggestions ---------- */
let suggestTimer = null;

function getSuggestionItems() {
  return Array.from(spellBox.querySelectorAll(".suggItem"));
}

function updateSuggestionSelection(nextIndex) {
  const items = getSuggestionItems();
  if (!items.length) {
    activeSuggestionIndex = -1;
    searchBox.removeAttribute("aria-activedescendant");
    return;
  }

  activeSuggestionIndex = Math.max(-1, Math.min(nextIndex, items.length - 1));
  items.forEach((item, index) => {
    item.classList.toggle("isActive", index === activeSuggestionIndex);
    item.setAttribute("aria-selected", index === activeSuggestionIndex ? "true" : "false");
  });

  if (activeSuggestionIndex >= 0) {
    searchBox.setAttribute("aria-activedescendant", items[activeSuggestionIndex].id);
  } else {
    searchBox.removeAttribute("aria-activedescendant");
  }
}

function chooseSuggestion(value) {
  searchBox.value = value;
  page = 1;
  hideSpellBox();
  setSearchFeedback("");
  searchImages();
}

async function fetchSpellSuggestions(q) {
  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=6`;
  const data = await fetchJson(url);
  return data.map((x) => x.word);
}

function getHistorySuggestions(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const history = getHistory();
  const startsWithMatches = history.filter((term) => term.toLowerCase().startsWith(normalizedQuery));
  const containsMatches = history.filter((term) => {
    const normalizedTerm = term.toLowerCase();
    return !normalizedTerm.startsWith(normalizedQuery) && normalizedTerm.includes(normalizedQuery);
  });

  return [...startsWithMatches, ...containsMatches];
}

function mergeSuggestions(query, apiSuggestions = []) {
  const normalizedQuery = query.trim().toLowerCase();
  const merged = [];
  const seen = new Set();

  const addSuggestion = (value, source) => {
    const trimmed = value.trim();
    const normalizedValue = trimmed.toLowerCase();
    if (!trimmed || normalizedValue === normalizedQuery || seen.has(normalizedValue)) return;
    seen.add(normalizedValue);
    merged.push({ value: trimmed, source });
  };

  getHistorySuggestions(query).forEach((term) => addSuggestion(term, "history"));
  apiSuggestions.forEach((term) => addSuggestion(term, "api"));

  return merged.slice(0, 8);
}

function hideSpellBox() {
  spellBox.classList.add("hidden");
  spellBox.innerHTML = "";
  activeSuggestionIndex = -1;
  searchBox.setAttribute("aria-expanded", "false");
  searchBox.removeAttribute("aria-activedescendant");
}

function renderSpellSuggestions(list) {
  if (!list.length) return hideSpellBox();

  spellBox.classList.remove("hidden");
  searchBox.setAttribute("aria-expanded", "true");
  spellBox.innerHTML = list
    .map(({ value, source }, index) => `
      <div class="suggItem" id="suggestion-${index}" role="option" aria-selected="false" data-value="${value}">
        <span class="suggText">${value}</span>
        <span class="suggMeta">${source === "history" ? "Recent" : "Suggest"}</span>
      </div>
    `)
    .join("");
  updateSuggestionSelection(-1);
}

searchBox.addEventListener("input", () => {
  const q = searchBox.value.trim();
  if (!q || q.length < 2) {
    hideSpellBox();
    setSearchFeedback("");
    return;
  }

  clearTimeout(suggestTimer);
  suggestTimer = setTimeout(async () => {
    try {
      const list = await fetchSpellSuggestions(q);
      setSearchFeedback("");
      renderSpellSuggestions(mergeSuggestions(q, list));
    } catch (err) {
      const historyOnlySuggestions = mergeSuggestions(q, []);
      if (historyOnlySuggestions.length) renderSpellSuggestions(historyOnlySuggestions);
      else hideSpellBox();
      setSearchFeedback(getFriendlyErrorMessage(err, "suggestions"));
    }
  }, 250);
});

searchBox.addEventListener("keydown", (e) => {
  const items = getSuggestionItems();
  const hasSuggestions = !spellBox.classList.contains("hidden") && items.length > 0;

  if (e.key === "ArrowDown" && hasSuggestions) {
    e.preventDefault();
    updateSuggestionSelection(activeSuggestionIndex + 1);
    return;
  }

  if (e.key === "ArrowUp" && hasSuggestions) {
    e.preventDefault();
    updateSuggestionSelection(activeSuggestionIndex - 1);
    return;
  }

  if (e.key === "Escape" && hasSuggestions) {
    hideSpellBox();
    return;
  }

  if (e.key === "Enter" && hasSuggestions && activeSuggestionIndex >= 0) {
    e.preventDefault();
    chooseSuggestion(items[activeSuggestionIndex].dataset.value);
  }
});

spellBox.addEventListener("click", (e) => {
  const item = e.target.closest(".suggItem");
  if (!item) return;
  chooseSuggestion(item.dataset.value);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchBoxWrap")) hideSpellBox();
});

/* ---------- Events ---------- */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  page = 1;
  hideSpellBox();
  searchImages();
});

showMoreBtn.addEventListener("click", () => {
  if (isLoading || !hasMoreResults) return;
  page += 1;
  searchImages();
});

collageOpenBtn.addEventListener("click", () => {
  openCollageStudio();
});

selectionClearBtn.addEventListener("click", () => {
  clearSelectedImages();
});

collageModalClose.addEventListener("click", () => {
  closeCollageStudio();
});

collageModalX.addEventListener("click", () => {
  closeCollageStudio();
});

collageLayoutButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCollageLayout = button.dataset.collageLayout;
    updateCollageLayoutButtons();
    updateCollageSummary();
    resetCollagePreview();
    setCollageStatus("Layout updated. Generate a fresh preview when you are ready.");
    if (!collageModal.classList.contains("hidden")) generateCollagePreview();
  });
});

collageThemeSelect.addEventListener("change", () => {
  selectedCollageTheme = collageThemeSelect.value;
  updateCollageThemeUI();
  updateCollageSummary();
});

collageThemeAddBtn.addEventListener("click", () => {
  addThemeMatchesToSelection();
});

collageGenerateBtn.addEventListener("click", () => {
  if (collageIsRendering) return;
  generateCollagePreview();
});

collageDownloadBtn.addEventListener("click", (e) => {
  if (collageDownloadBtn.getAttribute("aria-disabled") === "true") {
    e.preventDefault();
  }
});

favoritesBtn.addEventListener("click", () => pushView("favorites"));
clearFavoritesBtn.addEventListener("click", () => {
  localStorage.removeItem(FAV_KEY);
  setCollections(getCollections().map((collection) => ({ ...collection, imageIds: [] })));
  renderFavorites();
  renderModalCollectionControls();
  renderModalCollectionMemberships();
});
backBtn.addEventListener("click", () => goBack());
clearHistoryBtn.addEventListener("click", () => clearHistory());

[sortSelect, orientationSelect, colorSelect].forEach((el) => {
  el.addEventListener("change", () => {
    persistPrefs();
    if (!searchBox.value.trim()) return;
    page = 1;
    searchImages();
  });
});

infiniteToggle.addEventListener("change", () => {
  persistPrefs();
  updatePagingControls();
});

themeToggle.addEventListener("click", () => {
  toggleTheme();
});

createCollectionBtn.addEventListener("click", () => {
  openCollectionForm("create");
});

renameCollectionBtn.addEventListener("click", () => {
  if (!getSelectedCollection()) return;
  openCollectionForm("rename");
});

deleteCollectionBtn.addEventListener("click", () => {
  const selected = getSelectedCollection();
  if (!selected) return;
  setCollections(getCollections().filter((collection) => collection.id !== selected.id));
  selectedCollectionId = "all";
  setStatus(`Deleted collection ${selected.name}.`, "info");
  renderFavorites();
  renderModalCollectionControls();
  renderModalCollectionMemberships();
});

collectionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveCollectionFromForm();
});

collectionCancelBtn.addEventListener("click", () => {
  closeCollectionForm();
});

/* ---------- ✅ Clear (clears ALL images on screen) ---------- */
clearBtn.addEventListener("click", () => {
  searchBox.value = "";
  keyword = "";
  page = 1;
  currentSearchResults = [];

  // ✅ clear images everywhere (results + favorites view)
  clearResultsView();
  favoritesGrid.innerHTML = "";

  // hide buttons/messages/suggestions/modal
  showMoreBtn.classList.add("hidden");
  loader.classList.add("hidden");
  hideSpellBox();
  setSearchFeedback("");
  closeModal();
  closeCollageStudio();
  clearSelectedImages();

  setStatus("Cleared. Search something to begin.");
  resetToHomeView();
});

/* ---------- ✅ Reset All (clears screen + history + favorites) ---------- */
resetAllBtn.addEventListener("click", () => {
  // clear UI
  searchBox.value = "";
  keyword = "";
  page = 1;
  currentSearchResults = [];
  clearResultsView();
  favoritesGrid.innerHTML = "";
  showMoreBtn.classList.add("hidden");
  loader.classList.add("hidden");
  hideSpellBox();
  setSearchFeedback("");
  closeModal();
  closeCollageStudio();
  clearSelectedImages();

  // clear storage
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(FAV_KEY);
  localStorage.removeItem(COLLECTIONS_KEY);
  selectedCollectionId = "all";

  renderHistory();
  renderFavorites();
  closeCollectionForm();
  renderModalCollectionControls();
  renderModalCollectionMemberships();

  setStatus("Everything reset ✅");
  resetToHomeView();
});

/* ---------- Init ---------- */
restorePrefs();
renderHistory();
renderFavorites();
renderModalCollectionControls();
renderSelectionTray();
initInfiniteScrollObserver();
setStatus("Search something to begin (ex: nature, city, food).");
resetToHomeView();
updateBackButton();
