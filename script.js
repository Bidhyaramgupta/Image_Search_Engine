// ✅ Put your Unsplash access key here
const accessKey = "P39kvatWi4-U9xadjgrgHgMA9cuEnaZIoblrBtBPyR8";

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
const showMoreBtn = document.getElementById("show-more-btn");
const loader = document.getElementById("loader");
const statusBox = document.getElementById("status");

const spellBox = document.getElementById("spell-suggestions");

const favoritesBtn = document.getElementById("favorites-btn");
const viewResults = document.getElementById("view-results");
const viewFavorites = document.getElementById("view-favorites");
const favoritesGrid = document.getElementById("favorites-grid");
const favoritesEmpty = document.getElementById("favorites-empty");
const clearFavoritesBtn = document.getElementById("clear-favorites-btn");

const backBtn = document.getElementById("back-btn");

// History
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalX = document.getElementById("modal-x");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalOpen = document.getElementById("modal-open");
const modalDownload = document.getElementById("modal-download");

/* ---------- State ---------- */
let keyword = "";
let page = 1;
let isLoading = false;

const stack = ["home"]; // home -> results -> favorites
function currentView() { return stack[stack.length - 1]; }

/* ---------- Storage Keys ---------- */
const FAV_KEY = "img_favorites_v1";
const HISTORY_KEY = "img_history_v1";
const HISTORY_MAX = 20;

/* ---------- Helpers ---------- */
function setStatus(msg) {
  if (!msg) {
    statusBox.classList.add("hidden");
    statusBox.textContent = "";
    return;
  }
  statusBox.classList.remove("hidden");
  statusBox.textContent = msg;
}

function setLoading(state) {
  isLoading = state;
  loader.classList.toggle("hidden", !state);
  searchBtn.disabled = state;
  showMoreBtn.disabled = state;
  searchBox.disabled = state;
  sortSelect.disabled = state;
  orientationSelect.disabled = state;
  colorSelect.disabled = state;
  infiniteToggle.disabled = state;
}

function showView(name) {
  const isFav = name === "favorites";
  viewFavorites.classList.toggle("hidden", !isFav);
  viewResults.classList.toggle("hidden", isFav);
  if (isFav) renderFavorites();
  updateBackButton();
}

function pushView(name) {
  if (currentView() === name) return;
  stack.push(name);
  showView(name);
}

function popView() {
  if (stack.length <= 1) return;
  stack.pop();
  showView(currentView());
}

function updateBackButton() {
  backBtn.disabled = stack.length <= 1;
  backBtn.style.opacity = backBtn.disabled ? "0.5" : "1";
}

/* ---------- Favorites ---------- */
function getFavMap() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "{}"); }
  catch { return {}; }
}
function setFavMap(map) { localStorage.setItem(FAV_KEY, JSON.stringify(map)); }
function isFaved(id) { return Boolean(getFavMap()[id]); }

function toggleFavorite(photo) {
  const map = getFavMap();
  if (map[photo.id]) delete map[photo.id];
  else {
    map[photo.id] = {
      id: photo.id,
      alt: photo.alt_description || "Untitled",
      likes: photo.likes,
      user: photo.user?.name || "Unknown",
      link: photo.links?.html,
      download: photo.links?.download || photo.urls?.full,
      urls: { small: photo.urls?.small, regular: photo.urls?.regular }
    };
  }
  setFavMap(map);
}

function renderFavorites() {
  const items = Object.values(getFavMap());
  favoritesGrid.innerHTML = "";
  favoritesEmpty.classList.toggle("hidden", items.length !== 0);
  items.forEach((saved) => favoritesGrid.appendChild(createCardFromSaved(saved)));
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
    empty.style.color = "rgba(255,255,255,0.7)";
    empty.textContent = "No history yet. Search something!";
    historyList.appendChild(empty);
    return;
  }

  list.forEach((term) => {
    const item = document.createElement("div");
    item.className = "historyItem";

    const word = document.createElement("span");
    word.className = "historyWord";
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

  const img = document.createElement("img");
  img.src = photo.urls.small;
  img.alt = photo.alt_description || keyword;
  img.loading = "lazy";

  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "heartBtn" + (isFaved(photo.id) ? " faved" : "");
  heart.textContent = isFaved(photo.id) ? "❤" : "♡";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(photo);
    const now = isFaved(photo.id);
    heart.classList.toggle("faved", now);
    heart.textContent = now ? "❤" : "♡";
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
  card.appendChild(heart);
  card.appendChild(info);

  card.addEventListener("click", () => openModal(photo));
  return card;
}

function createCardFromSaved(saved) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = saved.urls.small;
  img.alt = saved.alt || "Favorite";
  img.loading = "lazy";

  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "heartBtn faved";
  heart.textContent = "❤";
  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    const map = getFavMap();
    delete map[saved.id];
    setFavMap(map);
    renderFavorites();
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
  card.appendChild(heart);
  card.appendChild(info);

  card.addEventListener("click", () => openModalSaved(saved));
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
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- Unsplash URLs ---------- */
function buildSearchUrl() {
  const sort = sortSelect.value; // relevant | latest
  const orientation = orientationSelect.value;
  const color = colorSelect.value;

  const params = new URLSearchParams({
    page: String(page),
    query: keyword,
    client_id: accessKey,
    per_page: "12",
    order_by: sort
  });

  if (orientation) params.set("orientation", orientation);
  if (color) params.set("color", color);

  return `https://api.unsplash.com/search/photos?${params.toString()}`;
}

// ✅ Fallback images if no results:
async function loadFallbackImages() {
  const url = `https://api.unsplash.com/photos/random?count=12&client_id=${accessKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fallback failed (${res.status})`);
  return await res.json(); // array
}

/* ---------- Search ---------- */
async function searchImages() {
  keyword = searchBox.value.trim();

  if (!keyword) {
    searchResult.innerHTML = "";
    showMoreBtn.classList.add("hidden");
    setStatus("Type something to search (ex: sunsets, cats, coffee).");
    pushView("home");
    return;
  }

  if (isLoading) return;
  setLoading(true);
  setStatus("");

  try {
    const url = buildSearchUrl();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    const data = await response.json();
    const results = data.results || [];

    if (page === 1) searchResult.innerHTML = "";

    if (results.length === 0 && page === 1) {
      setStatus("No results found. Showing some random photos instead ✨");
      const fallback = await loadFallbackImages();
      fallback.forEach((photo) => searchResult.appendChild(createCard(photo)));
      showMoreBtn.classList.add("hidden");
      addHistory(keyword);
      pushView("results");
      return;
    }

    results.forEach((photo) => searchResult.appendChild(createCard(photo)));

    addHistory(keyword);

    if (infiniteToggle.checked) showMoreBtn.classList.add("hidden");
    else showMoreBtn.classList.remove("hidden");

    pushView("results");
  } catch (err) {
    setStatus(`Something went wrong: ${err.message}`);
    showMoreBtn.classList.add("hidden");
  } finally {
    setLoading(false);
  }
}

/* ---------- Spelling suggestions ---------- */
let suggestTimer = null;

async function fetchSpellSuggestions(q) {
  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=6`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((x) => x.word);
}

function hideSpellBox() {
  spellBox.classList.add("hidden");
  spellBox.innerHTML = "";
}

function renderSpellSuggestions(list, original) {
  const filtered = list.filter((w) => w.toLowerCase() !== original.toLowerCase());
  if (!filtered.length) return hideSpellBox();

  spellBox.classList.remove("hidden");
  spellBox.innerHTML = filtered
    .map((t) => `<div class="suggItem" data-value="${t}">${t}</div>`)
    .join("");
}

searchBox.addEventListener("input", () => {
  const q = searchBox.value.trim();
  if (!q) return hideSpellBox();

  clearTimeout(suggestTimer);
  suggestTimer = setTimeout(async () => {
    try {
      const list = await fetchSpellSuggestions(q);
      renderSpellSuggestions(list, q);
    } catch {
      hideSpellBox();
    }
  }, 250);
});

spellBox.addEventListener("click", (e) => {
  const item = e.target.closest(".suggItem");
  if (!item) return;
  searchBox.value = item.dataset.value;
  page = 1;
  hideSpellBox();
  searchImages();
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
  page++;
  searchImages();
});

favoritesBtn.addEventListener("click", () => pushView("favorites"));
clearFavoritesBtn.addEventListener("click", () => { localStorage.removeItem(FAV_KEY); renderFavorites(); });
backBtn.addEventListener("click", () => popView());
clearHistoryBtn.addEventListener("click", () => clearHistory());

[sortSelect, orientationSelect, colorSelect].forEach((el) => {
  el.addEventListener("change", () => {
    if (!searchBox.value.trim()) return;
    page = 1;
    searchImages();
  });
});

window.addEventListener("scroll", () => {
  if (!infiniteToggle.checked) return;
  if (isLoading) return;
  if (currentView() !== "results") return;

  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
  if (nearBottom) {
    page++;
    searchImages();
  }
});

/* ---------- ✅ Clear (clears ALL images on screen) ---------- */
clearBtn.addEventListener("click", () => {
  searchBox.value = "";
  keyword = "";
  page = 1;

  // ✅ clear images everywhere (results + favorites view)
  searchResult.innerHTML = "";
  favoritesGrid.innerHTML = "";

  // hide buttons/messages/suggestions/modal
  showMoreBtn.classList.add("hidden");
  loader.classList.add("hidden");
  hideSpellBox();
  closeModal();

  setStatus("Cleared. Search something to begin.");
  pushView("home");
});

/* ---------- ✅ Reset All (clears screen + history + favorites) ---------- */
resetAllBtn.addEventListener("click", () => {
  // clear UI
  searchBox.value = "";
  keyword = "";
  page = 1;
  searchResult.innerHTML = "";
  favoritesGrid.innerHTML = "";
  showMoreBtn.classList.add("hidden");
  loader.classList.add("hidden");
  hideSpellBox();
  closeModal();

  // clear storage
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(FAV_KEY);

  renderHistory();
  renderFavorites();

  setStatus("Everything reset ✅");
  pushView("home");
});

/* ---------- Init ---------- */
renderHistory();
renderFavorites();
setStatus("Search something to begin (ex: nature, city, food).");
showView("home");
updateBackButton();