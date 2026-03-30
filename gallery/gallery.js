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
      knownMap.set(p.file, { title: p.title || p.file, tag: p.tag || null });
    });

    // scan: list all image files in the dir
    // on a static host we can't readdir, so we build from JSON entries
    // plus we try to discover unlisted files via <img> probe
    const listedFiles = [...knownMap.keys()];

    // build photos array — JSON-listed files keep their tag,
    // unlisted files (discovered later) get no tag
    photos = listedFiles.map((file) => {
      const info = knownMap.get(file);
      return {
        src:   `${dir}/${file}`,
        title: info.title,
        tag:   info.tag,  // null if not tagged
      };
    });

    buildFilters();
    renderCards("all");
  } catch (err) {
    console.error("Failed to load photos.json:", err);
    gallery.innerHTML = `<p style="color:var(--muted);text-align:center;">Failed to load gallery data.</p>`;
  }
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

// ── render cards ──
function renderCards(tag) {
  gallery.innerHTML = "";
  photos.forEach((p, i) => {
    // filter logic: "all" shows everything;
    // tagged photos match by tag; untagged photos only show under "all"
    if (tag !== "all") {
      if (p.tag !== tag) return;
    }
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.innerHTML = `
      <img src="${p.src}" alt="${p.title}" loading="lazy" />
      <div class="card-meta">
        <h3>${p.title}</h3>
        <span>${p.tag || "untagged"}</span>
      </div>`;
    card.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(card);
  });
}

// ── lightbox ──
const lightbox  = document.getElementById("lightbox");
const overlay   = document.getElementById("lb-overlay");
const lbImg     = document.getElementById("lb-img");
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
}

function showSlide() {
  const p = photos[visibleIndices[currentLb]];
  lbImg.src = p.src;
  lbImg.alt = p.title;
  lbCaption.textContent = p.title;
  lbCounter.textContent = `${currentLb + 1} / ${visibleIndices.length}`;
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
