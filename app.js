// ===== TMDB config =====
// Your TMDB v3 API key is inserted here by the pipeline/setup step.
const API_KEY = "bc9db793aab7d8aaf7dbd33c9b8aa1adea91f766";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/original";

// Category -> TMDB endpoint
const CATEGORIES = [
  { key: "trending",  title: "🔥 Trending Now",        url: `/trending/all/week?api_key=${API_KEY}` },
  { key: "hollywood", title: "🎬 Hollywood Movies",    url: `/discover/movie?api_key=${API_KEY}&with_original_language=en&sort_by=popularity.desc` },
  { key: "bollywood", title: "🇮🇳 Bollywood Movies",   url: `/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&region=IN` },
  { key: "series",    title: "📺 Popular Web Series",  url: `/tv/popular?api_key=${API_KEY}` },
  { key: "indian_tv", title: "📺 Indian Web Series",   url: `/discover/tv?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc` },
  { key: "top",       title: "⭐ Top Rated Movies",    url: `/movie/top_rated?api_key=${API_KEY}` },
  { key: "action",    title: "💥 Action & Adventure",  url: `/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc` },
];

const rowsEl   = document.getElementById("rows");
const heroEl   = document.getElementById("hero");
const searchEl = document.getElementById("search");
const resultsSection = document.getElementById("search-results");
const searchGrid = document.getElementById("search-grid");

// ===== helpers =====
async function tmdb(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error("TMDB " + res.status);
  const data = await res.json();
  return data.results || [];
}
const titleOf = (m) => m.title || m.name || "Untitled";
const yearOf  = (m) => (m.release_date || m.first_air_date || "").slice(0, 4);

function cardHTML(m) {
  const poster = m.poster_path ? IMG + m.poster_path : "";
  const isTV = m.media_type === "tv" || m.first_air_date;
  return `
    <div class="card" data-id="${m.id}">
      ${isTV ? '<span class="badge">SERIES</span>' : ''}
      <img loading="lazy" src="${poster}" alt="${titleOf(m)}"
           onerror="this.style.background='#333';this.removeAttribute('src')">
      <div class="cap"><b>${titleOf(m)}</b><span>${yearOf(m) || ""}</span></div>
    </div>`;
}

// ===== hero =====
function setHero(m) {
  if (!m) return;
  heroEl.style.backgroundImage =
    `url(${(m.backdrop_path ? BACKDROP + m.backdrop_path : "")})`;
  document.getElementById("hero-title").textContent = titleOf(m);
  document.getElementById("hero-overview").textContent = m.overview || "";
}

// ===== rows =====
async function buildRows() {
  for (const cat of CATEGORIES) {
    try {
      const items = await tmdb(cat.url);
      if (!items.length) continue;
      if (cat.key === "trending") setHero(items[Math.floor(Math.random() * Math.min(5, items.length))]);
      const row = document.createElement("section");
      row.className = "row";
      row.innerHTML = `<h3>${cat.title}</h3>
        <div class="row-track">${items.map(cardHTML).join("")}</div>`;
      rowsEl.appendChild(row);
    } catch (e) {
      console.error("Row failed:", cat.key, e);
    }
  }
}

// ===== search =====
let searchTimer;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const q = searchEl.value.trim();
  searchTimer = setTimeout(async () => {
    if (!q) { resultsSection.hidden = true; rowsEl.hidden = false; heroEl.hidden = false; return; }
    try {
      const items = await tmdb(`/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
      const filtered = items.filter(m => m.poster_path && (m.media_type === "movie" || m.media_type === "tv"));
      searchGrid.innerHTML = filtered.map(cardHTML).join("") || "<p>No results.</p>";
      resultsSection.hidden = false; rowsEl.hidden = true; heroEl.hidden = true;
    } catch (e) { console.error(e); }
  }, 400);
});

// ===== nav: scroll to category =====
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const cat = link.dataset.cat;
    const idx = CATEGORIES.findIndex(c => c.key === cat);
    const row = rowsEl.children[idx];
    if (row) row.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// header background on scroll
window.addEventListener("scroll", () => {
  document.getElementById("header").classList.toggle("scrolled", window.scrollY > 60);
});

// ===== go =====
buildRows();
