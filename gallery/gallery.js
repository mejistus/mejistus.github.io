// ── state ──
let photos = [];
const gallery   = document.getElementById("gallery");
const filterBar = document.getElementById("filter-bar");

// ── load photos.json ──
async function init() {
  try {
    const res  = await fetch("./photos.json");
    const data = await res.json();
    const dir  = data.dir || "photos";
    const knownMap = new Map();

    // index entries from JSON
    (data.photos || []).forEach((p) => {
      knownMap.set(p.file, {
        title: p.title || null,
        tag: p.tag || null,
        thumb: p.thumb || null,
        type: p.type || null,
        date: p.date || null,
      });
    });

    // scan: list all image files in the dir
    // on a static host we can't readdir, so we build from JSON entries
    // plus we try to discover unlisted files via <img> probe
    const listedFiles = [...knownMap.keys()];

    // build photos array — JSON-listed files keep their tag,
    // unlisted files (discovered later) get no tag
    photos = listedFiles.map((file) => {
      const info = knownMap.get(file);
      const type = info.type || mediaTypeFromFile(file);
      return {
        src:   `${dir}/${file}`,
        thumb: `${dir}/${info.thumb || file}`,
        type,
        title: info.title,
        tag:   info.tag,
        date:  info.date,
      };
    });

    buildFilters();
    renderCards("all");
  } catch (err) {
    console.error("Failed to load photos.json:", err);
    gallery.innerHTML = `<p style="color:var(--muted);text-align:center;">Failed to load gallery data.</p>`;
  }
}

function mediaTypeFromFile(file) {
  return /\.(mp4|webm|mov)$/i.test(file) ? "video" : "image";
}

// ── build filter buttons dynamically ──
function buildFilters() {
  const tags = new Set();
  photos.forEach((p) => { if (p.tag) tags.add(p.tag); });
  const sorted = [...tags].sort();

  filterBar.innerHTML = "";

  // "All" button
  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.dataset.tag = "all";
  allBtn.textContent = "All";
  filterBar.appendChild(allBtn);

  // one button per tag
  sorted.forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.tag = tag;
    btn.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    filterBar.appendChild(btn);
  });

  // bind clicks
  filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards(btn.dataset.tag);
    });
  });
}

function formatDate(d) {
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`;
  return d;
}

// ── masonry helpers ──
function getColCount() {
  const w = gallery.clientWidth;
  if (w < 520) return 1;
  if (w < 900) return 2;
  return 3;
}

function createColumns(n) {
  gallery.innerHTML = "";
  const cols = [];
  for (let i = 0; i < n; i++) {
    const col = document.createElement("div");
    col.className = "gallery-col";
    gallery.appendChild(col);
    cols.push(col);
  }
  return cols;
}

function shortestCol(cols) {
  let min = cols[0], idx = 0;
  for (let i = 1; i < cols.length; i++) {
    if (cols[i].offsetHeight < min.offsetHeight) {
      min = cols[i];
      idx = i;
    }
  }
  return min;
}

// ── render cards ──
function renderCards(tag) {
  const colCount = getColCount();
  const cols = createColumns(colCount);

  photos.forEach((p, i) => {
    if (tag !== "all" && p.tag !== tag) return;

    const card = document.createElement("div");
    card.className = `card${p.type === "video" ? " video-card" : ""}`;
    card.dataset.index = i;

    const dateStr = p.date ? formatDate(p.date) : null;
    card.innerHTML = `
      <img src="${p.thumb}" alt="${p.title || ""}" loading="lazy" />${
      dateStr ? `
      <div class="card-meta">
        <span>${dateStr}</span>
      </div>` : ""}`;

    card.addEventListener("click", () => openLightbox(i));
    shortestCol(cols).appendChild(card);
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const active = document.querySelector(".filter-btn.active");
    if (active) renderCards(active.dataset.tag);
  }, 200);
});

// ── lightbox ──
const lightbox  = document.getElementById("lightbox");
const overlay   = document.getElementById("lb-overlay");
const lbImg     = document.getElementById("lb-img");
const lbVideo   = document.getElementById("lb-video");
const lbCaption = document.getElementById("lb-caption");
const lbCounter = document.getElementById("lb-counter");
let currentLb = 0;
let visibleIndices = [];

function getVisibleIndices() {
  const activeBtn = document.querySelector(".filter-btn.active");
  const activeTag = activeBtn ? activeBtn.dataset.tag : "all";
  return photos
    .map((p, i) => ({ ...p, i }))
    .filter((p) => activeTag === "all" || p.tag === activeTag)
    .map((p) => p.i);
}

function openLightbox(index) {
  visibleIndices = getVisibleIndices();
  currentLb = visibleIndices.indexOf(index);
  if (currentLb === -1) currentLb = 0;
  showSlide();
  lightbox.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  resetLightboxMedia();
}

function showSlide() {
  const p = photos[visibleIndices[currentLb]];
  resetLightboxMedia();

  if (p.type === "video") {
    lbVideo.poster = p.thumb;
    lbVideo.src = p.src;
    lbVideo.hidden = false;
  } else {
    lbImg.src = p.src;
    lbImg.alt = p.title || "";
    lbImg.hidden = false;
  }

  const parts = [];
  if (p.title) parts.push(p.title);
  if (p.date) parts.push(formatDate(p.date));
  lbCaption.textContent = parts.join(" · ");
  lbCounter.textContent = `${currentLb + 1} / ${visibleIndices.length}`;
}

function resetLightboxMedia() {
  lbImg.hidden = true;
  lbImg.removeAttribute("src");
  lbImg.alt = "";

  lbVideo.pause();
  lbVideo.hidden = true;
  lbVideo.removeAttribute("src");
  lbVideo.removeAttribute("poster");
  lbVideo.load();
}

function nextSlide() {
  currentLb = (currentLb + 1) % visibleIndices.length;
  showSlide();
}
function prevSlide() {
  currentLb = (currentLb - 1 + visibleIndices.length) % visibleIndices.length;
  showSlide();
}

document.querySelector(".lb-close").addEventListener("click", closeLightbox);
document.querySelector(".lb-prev").addEventListener("click", prevSlide);
document.querySelector(".lb-next").addEventListener("click", nextSlide);
overlay.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape")     closeLightbox();
  if (e.key === "ArrowRight") nextSlide();
  if (e.key === "ArrowLeft")  prevSlide();
});

// touch swipe
let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? nextSlide() : prevSlide();
}, { passive: true });

// ── boot ──
init();
