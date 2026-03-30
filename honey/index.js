// re-query after on_init.js builds the DOM
const selectors = {
  item: document.querySelectorAll("#shell .item"),
  activeClass: "item--active",
};

function setActiveItem(index) {
  selectors.item.forEach((item) => item.classList.remove(selectors.activeClass));
  selectors.item[index].classList.add(selectors.activeClass);
}

// activate first item
setActiveItem(0);

// IntersectionObserver — activate whichever item enters the center band
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(selectors.item).indexOf(entry.target);
        if (index !== -1) setActiveItem(index);
      }
    });
  },
  { rootMargin: "-30% 0px -30% 0px", threshold: 0.1 },
);

selectors.item.forEach((item) => observer.observe(item));
