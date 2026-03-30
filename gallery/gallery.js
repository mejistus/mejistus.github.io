// ── photo data ──
const photos = [
  { src: "../honey/asserts/1.jpg",  title: "Canna in the Wild",      tag: "flora" },
  { src: "../honey/asserts/3.jpg",  title: "River Reflection",       tag: "landscape" },
  { src: "../honey/asserts/8.jpg",  title: "Ferris Wheel at Dusk",   tag: "night" },
  { src: "../honey/asserts/5.jpg",  title: "Xiuhui Road",            tag: "urban" },
  { src: "../honey/asserts/13.jpg", title: "White Cosmos",           tag: "flora" },
  { src: "../honey/asserts/10.jpg", title: "Night Garden",           tag: "night" },
  { src: "../honey/asserts/15.jpg", title: "After the Rain",         tag: "flora" },
  { src: "../honey/asserts/20.jpg", title: "Red Petunias",           tag: "flora" },
  { src: "../honey/asserts/18.jpg", title: "Marigold Glow",         tag: "flora" },
  { src: "../honey/asserts/2.jpg",  title: "Quiet Path",             tag: "landscape" },
  { src: "../honey/asserts/4.jpg",  title: "Morning Light",          tag: "landscape" },
  { src: "../honey/asserts/6.jpg",  title: "Twilight Walk",          tag: "urban" },
  { src: "../honey/asserts/7.jpg",  title: "Street Corner",          tag: "urban" },
  { src: "../honey/asserts/9.jpg",  title: "Evening Sky",            tag: "night" },
  { src: "../honey/asserts/11.jpg", title: "Green Whisper",          tag: "flora" },
  { src: "../honey/asserts/12.jpg", title: "Stillness",              tag: "landscape" },
  { src: "../honey/asserts/14.jpg", title: "Bloom",                  tag: "flora" },
  { src: "../honey/asserts/16.jpg", title: "Golden Hour",            tag: "landscape" },
  { src: "../honey/asserts/17.jpg", title: "Passing By",             tag: "urban" },
  { src: "../honey/asserts/19.jpg", title: "Rooftop View",           tag: "urban" },
  { src: "../honey/asserts/21.jpg", title: "Light Through Leaves",   tag: "flora" },
  { src: "../honey/asserts/22.jpg", title: "Last Frame",             tag: "landscape" },
  { src: "../honey/asserts/23.jpg", title: "Farewell",               tag: "landscape" },
];

// ── build cards ──
const gallery = document.getElementById("gallery");

function renderCards(tag) {
  gallery.innerHTML = "";
  photos.forEach((p, i) => {
    if (tag !== "all" && p.tag !== tag) return;
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.innerHTML = `
      <img src="${p.src}" alt="${p.title}" loading="lazy" />
      <div class="card-meta">
        <h3>${p.title}</h3>
        <span>${p.tag}</span>
      </div>`;
    card.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(card);
  });
}
renderCards("all");

// ── filter ──
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderCards(btn.dataset.tag);
  });
});

// ── lightbox ──
const lightbox  = document.getElementById("lightbox");
const lbImg     = document.getElementById("lb-img");
const lbCaption = document.getElementById("lb-caption");
const lbCounter = document.getElementById("lb-counter");
let currentLb = 0;
let visibleIndices = [];

function getVisibleIndices() {
  const activeTag = document.querySelector(".filter-btn.active").dataset.tag;
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
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
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

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// keyboard
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape")      closeLightbox();
  if (e.key === "ArrowRight")  nextSlide();
  if (e.key === "ArrowLeft")   prevSlide();
});

// touch swipe
let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    dx < 0 ? nextSlide() : prevSlide();
  }
}, { passive: true });
